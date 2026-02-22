import { existsSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

import { FinanceStore, generateId } from "../src/storage/store.js"
import { upsertSnapshotTool } from "../src/tools/upsert-snapshot.js"
import { getStateTool } from "../src/tools/get-state.js"
import { getTransactionsTool } from "../src/tools/get-transactions.js"
import { getNetWorthTool } from "../src/tools/get-net-worth.js"
import { detectAnomaliesTool } from "../src/tools/detect-anomalies.js"
import { cashFlowSummaryTool } from "../src/tools/cash-flow-summary.js"
import { subscriptionTrackerTool } from "../src/tools/subscription-tracker.js"
import { generateBriefTool } from "../src/tools/generate-brief.js"
import { policyCheckTool } from "../src/tools/policy-check.js"
import type { Account, Transaction, Position, Liability, PolicyRule } from "../src/types.js"

const TEST_DIR = join(tmpdir(), "finance-tools-test-" + Date.now())

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: overrides.id ?? generateId("acct"),
    source: "plaid",
    sourceAccountId: "plaid_123",
    institutionId: "inst_1",
    institutionName: "Test Bank",
    name: "Test Checking",
    officialName: null,
    type: "depository",
    subtype: "checking",
    balances: { current: 10000, available: 9500, limit: null, lastUpdated: "2026-01-15T00:00:00Z" },
    currency: "USD",
    lastSyncedAt: "2026-01-15T00:00:00Z",
    isActive: true,
    metadata: {},
    ...overrides,
  }
}

function makeTxn(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: overrides.id ?? generateId("txn"),
    accountId: "acct_1",
    source: "plaid",
    sourceTransactionId: "plaid_txn_" + Math.random().toString(36).slice(2, 6),
    date: "2026-01-15",
    authorizedDate: null,
    amount: 25,
    currency: "USD",
    name: "Test Merchant",
    merchantName: "Test Merchant",
    category: "shopping",
    subcategory: null,
    status: "posted",
    isRecurring: false,
    recurringGroupId: null,
    counterpartyName: null,
    paymentChannel: null,
    location: null,
    metadata: {},
    ...overrides,
  }
}

function makePosition(overrides: Partial<Position> = {}): Position {
  return {
    id: overrides.id ?? generateId("pos"),
    accountId: "acct_inv",
    source: "alpaca",
    symbol: "AAPL",
    name: "Apple Inc.",
    holdingType: "equity",
    quantity: 100,
    costBasis: 15000,
    costBasisPerShare: 150,
    currentPrice: 175,
    marketValue: 17500,
    unrealizedGainLoss: 2500,
    unrealizedGainLossPercent: 0.1667,
    currency: "USD",
    lastUpdated: "2026-01-15T00:00:00Z",
    taxLots: [],
    metadata: {},
    ...overrides,
  }
}

describe("Tool handlers", () => {
  let store: FinanceStore

  beforeEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
    store = new FinanceStore(TEST_DIR)
  })

  afterEach(() => {
    if (existsSync(TEST_DIR)) rmSync(TEST_DIR, { recursive: true })
  })

  describe("finance_upsert_snapshot", () => {
    it("has correct tool metadata", () => {
      expect(upsertSnapshotTool.name).toBe("finance_upsert_snapshot")
      expect(upsertSnapshotTool.input_schema.required).toContain("userId")
      expect(upsertSnapshotTool.input_schema.required).toContain("idempotencyKey")
    })

    it("handler inserts snapshot", async () => {
      const handler = upsertSnapshotTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        source: "plaid",
        asOf: "2026-01-15T00:00:00Z",
        payload: { accounts: [makeAccount()] },
        idempotencyKey: "key_1",
      })

      expect(result.inserted).toBe(true)
      expect(result.snapshotId).toBeTruthy()
    })
  })

  describe("finance_get_state", () => {
    it("returns populated state after snapshot", async () => {
      const acct = makeAccount({ id: "acct_1" })
      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", { accounts: [acct] }, "k1")

      const handler = getStateTool.createHandler(store)
      const state = await handler({ userId: "user_1" })

      expect(state.accounts).toHaveLength(1)
      expect(state.accounts[0].id).toBe("acct_1")
    })
  })

  describe("finance_get_transactions", () => {
    it("returns filtered transactions", async () => {
      const txns = [
        makeTxn({ id: "t1", category: "food_and_drink", date: "2026-01-10" }),
        makeTxn({ id: "t2", category: "shopping", date: "2026-01-15" }),
        makeTxn({ id: "t3", category: "food_and_drink", date: "2026-01-20" }),
      ]
      store.upsertSnapshot("user_1", "plaid", "2026-01-20T00:00:00Z", { transactions: txns }, "k1")

      const handler = getTransactionsTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        category: "food_and_drink",
      })

      expect(result.transactions).toHaveLength(2)
      expect(result.total).toBe(2)
    })
  })

  describe("finance_get_net_worth", () => {
    it("calculates net worth from accounts and liabilities", async () => {
      const checking = makeAccount({ id: "acct_1", type: "depository", balances: { current: 10000, available: 9500, limit: null, lastUpdated: "2026-01-15T00:00:00Z" } })
      const creditCard = makeAccount({ id: "acct_2", type: "credit", balances: { current: 2000, available: null, limit: 5000, lastUpdated: "2026-01-15T00:00:00Z" } })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", {
        accounts: [checking, creditCard],
      }, "k1")

      const handler = getNetWorthTool.createHandler(store)
      const result = await handler({ userId: "user_1" })

      expect(result.totalAssets).toBe(10000)
      expect(result.totalLiabilities).toBe(2000)
      expect(result.netWorth).toBe(8000)
      expect(result.byAccount).toHaveLength(2)
    })

    it("includes investment positions in net worth", async () => {
      const investmentAcct = makeAccount({
        id: "acct_inv",
        type: "investment",
        balances: { current: 0, available: null, limit: null, lastUpdated: "2026-01-15T00:00:00Z" },
      })
      const position = makePosition({ accountId: "acct_inv", marketValue: 50000 })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", {
        accounts: [investmentAcct],
        positions: [position],
      }, "k1")

      const handler = getNetWorthTool.createHandler(store)
      const result = await handler({ userId: "user_1" })

      expect(result.totalAssets).toBe(50000)
    })
  })

  describe("finance_detect_anomalies", () => {
    it("detects large transactions", async () => {
      const today = new Date().toISOString().split("T")[0]
      const normalTxns = Array.from({ length: 10 }, (_, i) =>
        makeTxn({ id: `txn_${i}`, amount: 30, date: today })
      )
      const largeTxn = makeTxn({ id: "txn_large", amount: 500, date: today })

      store.upsertSnapshot("user_1", "plaid", new Date().toISOString(), {
        transactions: [...normalTxns, largeTxn],
      }, "k1")

      const handler = detectAnomaliesTool.createHandler(store)
      const result = await handler({ userId: "user_1", lookbackDays: 30 })

      const largeAnomaly = result.anomalies.find((a) => a.type === "large_transaction")
      expect(largeAnomaly).toBeDefined()
    })

    it("detects duplicate charges", async () => {
      const today = new Date().toISOString().split("T")[0]
      const txn1 = makeTxn({ id: "txn_dup1", merchantName: "Netflix", amount: 15.99, date: today })
      const txn2 = makeTxn({ id: "txn_dup2", merchantName: "Netflix", amount: 15.99, date: today })

      store.upsertSnapshot("user_1", "plaid", new Date().toISOString(), {
        transactions: [txn1, txn2],
      }, "k1")

      const handler = detectAnomaliesTool.createHandler(store)
      const result = await handler({ userId: "user_1" })

      const duplicateAnomaly = result.anomalies.find((a) => a.type === "duplicate_charge")
      expect(duplicateAnomaly).toBeDefined()
    })
  })

  describe("finance_cash_flow_summary", () => {
    it("returns cash flow breakdown", async () => {
      const income = makeTxn({ id: "income1", amount: -5000, category: "income", date: "2026-01-10" })
      const rent = makeTxn({ id: "rent1", amount: 2000, category: "housing", date: "2026-01-01" })
      const food = makeTxn({ id: "food1", amount: 300, category: "food_and_drink", date: "2026-01-15" })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", {
        transactions: [income, rent, food],
      }, "k1")

      const handler = cashFlowSummaryTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        startDate: "2026-01-01",
        endDate: "2026-01-31",
      })

      expect(result.totalIncome).toBe(5000)
      expect(result.totalExpenses).toBe(2300)
      expect(result.netCashFlow).toBe(2700)
      expect(result.expensesByCategory.length).toBeGreaterThan(0)
    })
  })

  describe("finance_subscription_tracker", () => {
    it("detects monthly subscriptions", async () => {
      const subscriptionTxns = Array.from({ length: 4 }, (_, i) => {
        const month = String(i + 9).padStart(2, "0")
        return makeTxn({
          id: `sub_txn_${i}`,
          merchantName: "Netflix",
          amount: 15.99,
          date: `2025-${month}-15`,
          category: "entertainment",
        })
      })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", {
        transactions: subscriptionTxns,
      }, "k1")

      const handler = subscriptionTrackerTool.createHandler(store)
      const result = await handler({ userId: "user_1", lookbackMonths: 6 })

      expect(result.activeSubscriptions.length).toBeGreaterThanOrEqual(1)
      const netflix = result.activeSubscriptions.find((s) => s.merchantName === "Netflix")
      expect(netflix).toBeDefined()
      expect(netflix?.estimatedAmount).toBeCloseTo(15.99, 1)
      expect(netflix?.frequency).toBe("monthly")
    })
  })

  describe("finance_generate_brief", () => {
    it("generates a structured brief", async () => {
      const acct = makeAccount({ id: "acct_1" })
      const txns = [
        makeTxn({ id: "t1", amount: -5000, category: "income", date: "2026-01-10" }),
        makeTxn({ id: "t2", amount: 200, category: "food_and_drink", date: "2026-01-12" }),
      ]
      const pos = makePosition({ id: "pos_1", accountId: "acct_1" })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", {
        accounts: [acct],
        transactions: txns,
        positions: [pos],
      }, "k1")

      const handler = generateBriefTool.createHandler(store)
      const brief = await handler({ userId: "user_1", period: "weekly" })

      expect(brief.period).toBe("weekly")
      expect(brief.sections.length).toBeGreaterThan(0)
      expect(brief.highlights.length).toBeGreaterThan(0)

      const netWorthSection = brief.sections.find((s) => s.title === "Net Worth")
      expect(netWorthSection).toBeDefined()
    })
  })

  describe("finance_policy_check", () => {
    it("allows action when no rules are configured", async () => {
      const handler = policyCheckTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        actionType: "trade",
        candidateAction: { symbol: "AAPL", side: "buy", notional: 5000 },
      })

      expect(result.allowed).toBe(true)
      expect(result.reasonCodes).toContain("no_rules_configured")
    })

    it("blocks action matching a blocking rule", async () => {
      const rules: PolicyRule[] = [
        {
          id: "rule_1",
          name: "Large trade limit",
          actionType: "trade",
          conditions: [{ field: "notional", operator: "gt", value: 10000 }],
          requiredApproval: "advisor",
          isActive: true,
        },
      ]
      store.setPolicyRules(rules)

      const handler = policyCheckTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        actionType: "trade",
        candidateAction: { symbol: "AAPL", side: "buy", notional: 15000 },
      })

      expect(result.allowed).toBe(false)
      expect(result.matchedRules).toContain("rule_1")
      expect(result.requiredApprovals).toContain("advisor")
    })

    it("allows action below threshold", async () => {
      const rules: PolicyRule[] = [
        {
          id: "rule_1",
          name: "Large trade limit",
          actionType: "trade",
          conditions: [{ field: "notional", operator: "gt", value: 10000 }],
          requiredApproval: "user",
          isActive: true,
        },
      ]
      store.setPolicyRules(rules)

      const handler = policyCheckTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        actionType: "trade",
        candidateAction: { symbol: "AAPL", side: "buy", notional: 5000 },
      })

      expect(result.matchedRules).toHaveLength(0)
    })

    it("ignores inactive rules", async () => {
      const rules: PolicyRule[] = [
        {
          id: "rule_1",
          name: "Disabled rule",
          actionType: "trade",
          conditions: [{ field: "notional", operator: "gt", value: 0 }],
          requiredApproval: "advisor",
          isActive: false,
        },
      ]
      store.setPolicyRules(rules)

      const handler = policyCheckTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        actionType: "trade",
        candidateAction: { symbol: "AAPL", notional: 50000 },
      })

      expect(result.allowed).toBe(true)
    })

    it("supports nested field access", async () => {
      const rules: PolicyRule[] = [
        {
          id: "rule_1",
          name: "Restricted symbols",
          actionType: "trade",
          conditions: [{ field: "order.symbol", operator: "in", value: ["GME", "AMC"] }],
          requiredApproval: "advisor",
          isActive: true,
        },
      ]
      store.setPolicyRules(rules)

      const handler = policyCheckTool.createHandler(store)
      const result = await handler({
        userId: "user_1",
        actionType: "trade",
        candidateAction: { order: { symbol: "GME", qty: 100 } },
      })

      expect(result.allowed).toBe(false)
      expect(result.matchedRules).toContain("rule_1")
    })
  })
})
