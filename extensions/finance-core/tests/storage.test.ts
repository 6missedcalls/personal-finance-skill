import { existsSync, mkdirSync, rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import { describe, it, expect, beforeEach, afterEach } from "vitest"

import { FinanceStore, computeSha256, generateId, mergeById } from "../src/storage/store.js"
import type { Account, Transaction, Position } from "../src/types.js"

const TEST_DIR = join(tmpdir(), "finance-core-test-" + Date.now())

function createTestAccount(overrides: Partial<Account> = {}): Account {
  return {
    id: generateId("acct"),
    source: "plaid",
    sourceAccountId: "plaid_123",
    institutionId: "inst_1",
    institutionName: "Test Bank",
    name: "Test Checking",
    officialName: null,
    type: "depository",
    subtype: "checking",
    balances: {
      current: 5000,
      available: 4500,
      limit: null,
      lastUpdated: "2026-01-15T00:00:00Z",
    },
    currency: "USD",
    lastSyncedAt: "2026-01-15T00:00:00Z",
    isActive: true,
    metadata: {},
    ...overrides,
  }
}

function createTestTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: generateId("txn"),
    accountId: "acct_test",
    source: "plaid",
    sourceTransactionId: "plaid_txn_123",
    date: "2026-01-15",
    authorizedDate: "2026-01-14",
    amount: 25.50,
    currency: "USD",
    name: "Coffee Shop",
    merchantName: "Starbucks",
    category: "food_and_drink",
    subcategory: null,
    status: "posted",
    isRecurring: false,
    recurringGroupId: null,
    counterpartyName: "Starbucks",
    paymentChannel: "in_store",
    location: null,
    metadata: {},
    ...overrides,
  }
}

describe("FinanceStore", () => {
  let store: FinanceStore

  beforeEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true })
    }
    store = new FinanceStore(TEST_DIR)
  })

  afterEach(() => {
    if (existsSync(TEST_DIR)) {
      rmSync(TEST_DIR, { recursive: true })
    }
  })

  describe("upsertSnapshot", () => {
    it("inserts a new snapshot and returns inserted: true", () => {
      const account = createTestAccount()
      const result = store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { accounts: [account] },
        "idem_1"
      )

      expect(result.inserted).toBe(true)
      expect(result.snapshotId).toMatch(/^snap_/)
      expect(result.contentSha256).toBeTruthy()
    })

    it("returns inserted: false for duplicate idempotency key", () => {
      const account = createTestAccount()
      const first = store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { accounts: [account] },
        "idem_1"
      )
      const second = store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { accounts: [account] },
        "idem_1"
      )

      expect(first.inserted).toBe(true)
      expect(second.inserted).toBe(false)
      expect(second.snapshotId).toBe(first.snapshotId)
    })

    it("merges accounts into existing data", () => {
      const acct1 = createTestAccount({ id: "acct_1", name: "Checking" })
      const acct2 = createTestAccount({ id: "acct_2", name: "Savings" })

      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", { accounts: [acct1] }, "k1")
      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", { accounts: [acct2] }, "k2")

      const accounts = store.getAccounts()
      expect(accounts).toHaveLength(2)
    })

    it("updates existing accounts by id", () => {
      const acct = createTestAccount({ id: "acct_1", name: "Old Name" })
      store.upsertSnapshot("user_1", "plaid", "2026-01-15T00:00:00Z", { accounts: [acct] }, "k1")

      const updated = createTestAccount({ id: "acct_1", name: "New Name" })
      store.upsertSnapshot("user_1", "plaid", "2026-01-16T00:00:00Z", { accounts: [updated] }, "k2")

      const accounts = store.getAccounts()
      expect(accounts).toHaveLength(1)
      expect(accounts[0].name).toBe("New Name")
    })
  })

  describe("getState", () => {
    it("returns empty state when no data exists", () => {
      const state = store.getState("user_1")

      expect(state.accounts).toEqual([])
      expect(state.transactions).toEqual([])
      expect(state.positions).toEqual([])
      expect(state.liabilities).toEqual([])
      expect(state.tax).toBeNull()
    })

    it("filters by include parameter", () => {
      const acct = createTestAccount({ id: "acct_1" })
      const txn = createTestTransaction({ accountId: "acct_1" })

      store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { accounts: [acct], transactions: [txn] },
        "k1"
      )

      const state = store.getState("user_1", ["accounts"])
      expect(state.accounts).toHaveLength(1)
      expect(state.transactions).toEqual([])
    })
  })

  describe("getTransactions", () => {
    it("filters by date range", () => {
      const txn1 = createTestTransaction({ id: "txn_1", date: "2026-01-10" })
      const txn2 = createTestTransaction({ id: "txn_2", date: "2026-01-20" })
      const txn3 = createTestTransaction({ id: "txn_3", date: "2026-01-30" })

      store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-30T00:00:00Z",
        { transactions: [txn1, txn2, txn3] },
        "k1"
      )

      const result = store.getTransactions({
        userId: "user_1",
        startDate: "2026-01-15",
        endDate: "2026-01-25",
      })

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].id).toBe("txn_2")
    })

    it("filters by category", () => {
      const txn1 = createTestTransaction({ id: "txn_1", category: "food_and_drink" })
      const txn2 = createTestTransaction({ id: "txn_2", category: "shopping" })

      store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { transactions: [txn1, txn2] },
        "k1"
      )

      const result = store.getTransactions({
        userId: "user_1",
        category: "food_and_drink",
      })

      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].category).toBe("food_and_drink")
    })

    it("supports pagination", () => {
      const txns = Array.from({ length: 5 }, (_, i) =>
        createTestTransaction({ id: `txn_${i}`, date: `2026-01-${String(i + 10).padStart(2, "0")}` })
      )

      store.upsertSnapshot("user_1", "plaid", "2026-01-20T00:00:00Z", { transactions: txns }, "k1")

      const page1 = store.getTransactions({ userId: "user_1", limit: 2, offset: 0 })
      expect(page1.transactions).toHaveLength(2)
      expect(page1.hasMore).toBe(true)
      expect(page1.total).toBe(5)

      const page2 = store.getTransactions({ userId: "user_1", limit: 2, offset: 4 })
      expect(page2.transactions).toHaveLength(1)
      expect(page2.hasMore).toBe(false)
    })
  })

  describe("computeCashFlow", () => {
    it("computes income and expenses correctly", () => {
      const income = createTestTransaction({
        id: "txn_income",
        amount: -3000,
        category: "income",
        date: "2026-01-15",
        status: "posted",
      })
      const expense1 = createTestTransaction({
        id: "txn_exp1",
        amount: 500,
        category: "food_and_drink",
        date: "2026-01-16",
        status: "posted",
      })
      const expense2 = createTestTransaction({
        id: "txn_exp2",
        amount: 200,
        category: "shopping",
        date: "2026-01-17",
        status: "posted",
      })

      store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-17T00:00:00Z",
        { transactions: [income, expense1, expense2] },
        "k1"
      )

      const cashFlow = store.computeCashFlow("2026-01-01", "2026-01-31")

      expect(cashFlow.totalIncome).toBe(3000)
      expect(cashFlow.totalExpenses).toBe(700)
      expect(cashFlow.netCashFlow).toBe(2300)
      expect(cashFlow.savingsRate).toBeCloseTo(0.7667, 3)
    })

    it("excludes pending transactions", () => {
      const posted = createTestTransaction({
        id: "txn_1",
        amount: 100,
        status: "posted",
        date: "2026-01-15",
      })
      const pending = createTestTransaction({
        id: "txn_2",
        amount: 200,
        status: "pending",
        date: "2026-01-15",
      })

      store.upsertSnapshot(
        "user_1",
        "plaid",
        "2026-01-15T00:00:00Z",
        { transactions: [posted, pending] },
        "k1"
      )

      const cashFlow = store.computeCashFlow("2026-01-01", "2026-01-31")
      expect(cashFlow.totalExpenses).toBe(100)
    })
  })

  describe("policyRules", () => {
    it("stores and retrieves policy rules", () => {
      const rules = [
        {
          id: "rule_1",
          name: "Max trade size",
          actionType: "trade" as const,
          conditions: [{ field: "notional", operator: "gt" as const, value: 10000 }],
          requiredApproval: "user" as const,
          isActive: true,
        },
      ]

      store.setPolicyRules(rules)
      const retrieved = store.getPolicyRules()
      expect(retrieved).toHaveLength(1)
      expect(retrieved[0].name).toBe("Max trade size")
    })
  })
})

describe("utility functions", () => {
  describe("computeSha256", () => {
    it("produces consistent hashes", () => {
      const hash1 = computeSha256({ a: 1, b: 2 })
      const hash2 = computeSha256({ a: 1, b: 2 })
      expect(hash1).toBe(hash2)
    })

    it("produces different hashes for different data", () => {
      const hash1 = computeSha256({ a: 1 })
      const hash2 = computeSha256({ a: 2 })
      expect(hash1).not.toBe(hash2)
    })
  })

  describe("generateId", () => {
    it("produces unique IDs with correct prefix", () => {
      const id1 = generateId("txn")
      const id2 = generateId("txn")
      expect(id1).toMatch(/^txn_/)
      expect(id2).toMatch(/^txn_/)
      expect(id1).not.toBe(id2)
    })
  })

  describe("mergeById", () => {
    it("merges arrays by id, keeping latest", () => {
      const existing = [
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
      ]
      const incoming = [
        { id: "2", name: "Bobby" },
        { id: "3", name: "Charlie" },
      ]

      const result = mergeById(existing, incoming)
      expect(result).toHaveLength(3)
      expect(result.find((r) => r.id === "2")?.name).toBe("Bobby")
    })
  })
})
