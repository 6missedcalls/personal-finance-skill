import { createHash } from "crypto"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs"
import { join } from "path"

import type {
  Account,
  Anomaly,
  CashFlowSummary,
  FinancialState,
  Liability,
  PolicyRule,
  Position,
  Snapshot,
  SnapshotPayload,
  Subscription,
  TaxState,
  Transaction,
} from "../types.js"

// --- Storage Schema ---

interface StorageData {
  readonly accounts: ReadonlyArray<Account>
  readonly transactions: ReadonlyArray<Transaction>
  readonly positions: ReadonlyArray<Position>
  readonly liabilities: ReadonlyArray<Liability>
  readonly tax: TaxState | null
  readonly snapshots: ReadonlyArray<Snapshot>
  readonly policyRules: ReadonlyArray<PolicyRule>
  readonly subscriptions: ReadonlyArray<Subscription>
  readonly anomalyHistory: ReadonlyArray<Anomaly>
}

const EMPTY_STORE: StorageData = {
  accounts: [],
  transactions: [],
  positions: [],
  liabilities: [],
  tax: null,
  snapshots: [],
  policyRules: [],
  subscriptions: [],
  anomalyHistory: [],
}

// --- Pure Helpers ---

function computeSha256(payload: unknown): string {
  const serialized = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort())
  return createHash("sha256").update(serialized).digest("hex")
}

function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 10)
  return `${prefix}_${timestamp}_${random}`
}

function mergeById<T extends { readonly id: string }>(
  existing: ReadonlyArray<T>,
  incoming: ReadonlyArray<T>
): ReadonlyArray<T> {
  const existingMap = new Map(existing.map((item) => [item.id, item]))
  for (const item of incoming) {
    existingMap.set(item.id, item)
  }
  return Array.from(existingMap.values())
}

// --- Store Class ---

export class FinanceStore {
  private readonly storageDir: string
  private readonly dataFilePath: string

  constructor(storageDir: string) {
    this.storageDir = storageDir
    this.dataFilePath = join(storageDir, "finance-data.json")
    this.ensureDirectoryExists()
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(this.storageDir)) {
      mkdirSync(this.storageDir, { recursive: true })
    }
  }

  private readData(): StorageData {
    if (!existsSync(this.dataFilePath)) {
      return EMPTY_STORE
    }
    try {
      const raw = readFileSync(this.dataFilePath, "utf-8")
      return JSON.parse(raw) as StorageData
    } catch {
      return EMPTY_STORE
    }
  }

  private writeData(data: StorageData): void {
    writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2), "utf-8")
  }

  // --- Snapshot Operations ---

  upsertSnapshot(
    userId: string,
    source: string,
    asOf: string,
    payload: SnapshotPayload,
    idempotencyKey: string
  ): { snapshotId: string; contentSha256: string; inserted: boolean } {
    const data = this.readData()
    const contentSha256 = computeSha256(payload)

    const existingSnapshot = data.snapshots.find((s) => s.idempotencyKey === idempotencyKey)
    if (existingSnapshot) {
      return {
        snapshotId: existingSnapshot.snapshotId,
        contentSha256: existingSnapshot.contentSha256,
        inserted: false,
      }
    }

    const snapshotId = generateId("snap")
    const snapshot: Snapshot = {
      snapshotId,
      userId,
      source: source as Snapshot["source"],
      asOf,
      contentSha256,
      idempotencyKey,
      payload,
      createdAt: new Date().toISOString(),
    }

    const updatedData = this.applySnapshotPayload(data, payload, snapshot)

    this.writeData(updatedData)

    return { snapshotId, contentSha256, inserted: true }
  }

  private applySnapshotPayload(
    data: StorageData,
    payload: SnapshotPayload,
    snapshot: Snapshot
  ): StorageData {
    return {
      ...data,
      snapshots: [...data.snapshots, snapshot],
      accounts: payload.accounts ? mergeById(data.accounts, payload.accounts) : data.accounts,
      transactions: payload.transactions
        ? mergeById(data.transactions, payload.transactions)
        : data.transactions,
      positions: payload.positions ? mergeById(data.positions, payload.positions) : data.positions,
      liabilities: payload.liabilities
        ? mergeById(data.liabilities, payload.liabilities)
        : data.liabilities,
      tax: payload.tax ?? data.tax,
    }
  }

  // --- State Queries ---

  getState(
    userId: string,
    include?: ReadonlyArray<string>,
    _asOf?: string
  ): FinancialState {
    const data = this.readData()
    const includeSet = new Set(include ?? ["accounts", "transactions", "positions", "liabilities", "tax"])

    return {
      stateVersion: computeSha256({ ts: Date.now() }).slice(0, 16),
      userId,
      asOf: new Date().toISOString(),
      accounts: includeSet.has("accounts") ? data.accounts : [],
      transactions: includeSet.has("transactions") ? data.transactions : [],
      positions: includeSet.has("positions") ? data.positions : [],
      liabilities: includeSet.has("liabilities")
        ? data.liabilities
        : [],
      tax: includeSet.has("tax") ? data.tax : null,
    }
  }

  getTransactions(filters: {
    userId: string
    startDate?: string
    endDate?: string
    accountId?: string
    category?: string
    minAmount?: number
    maxAmount?: number
    status?: string
    limit?: number
    offset?: number
  }): { transactions: ReadonlyArray<Transaction>; total: number; hasMore: boolean } {
    const data = this.readData()
    const limit = filters.limit ?? 100
    const offset = filters.offset ?? 0

    const filtered = data.transactions.filter((tx) => {
      if (filters.startDate && tx.date < filters.startDate) return false
      if (filters.endDate && tx.date > filters.endDate) return false
      if (filters.accountId && tx.accountId !== filters.accountId) return false
      if (filters.category && tx.category !== filters.category) return false
      if (filters.minAmount !== undefined && Math.abs(tx.amount) < filters.minAmount) return false
      if (filters.maxAmount !== undefined && Math.abs(tx.amount) > filters.maxAmount) return false
      if (filters.status && tx.status !== filters.status) return false
      return true
    })

    const sorted = [...filtered].sort((a, b) => b.date.localeCompare(a.date))
    const page = sorted.slice(offset, offset + limit)

    return {
      transactions: page,
      total: filtered.length,
      hasMore: offset + limit < filtered.length,
    }
  }

  getAccounts(): ReadonlyArray<Account> {
    return this.readData().accounts
  }

  getPositions(): ReadonlyArray<Position> {
    return this.readData().positions
  }

  getLiabilities(): ReadonlyArray<Liability> {
    return this.readData().liabilities
  }

  getTaxState(): TaxState | null {
    return this.readData().tax
  }

  // --- Policy Rules ---

  getPolicyRules(): ReadonlyArray<PolicyRule> {
    return this.readData().policyRules
  }

  setPolicyRules(rules: ReadonlyArray<PolicyRule>): void {
    const data = this.readData()
    this.writeData({ ...data, policyRules: rules })
  }

  // --- Subscriptions ---

  getSubscriptions(): ReadonlyArray<Subscription> {
    return this.readData().subscriptions
  }

  setSubscriptions(subscriptions: ReadonlyArray<Subscription>): void {
    const data = this.readData()
    this.writeData({ ...data, subscriptions })
  }

  // --- Anomaly History ---

  getAnomalyHistory(): ReadonlyArray<Anomaly> {
    return this.readData().anomalyHistory
  }

  appendAnomalies(anomalies: ReadonlyArray<Anomaly>): void {
    const data = this.readData()
    this.writeData({
      ...data,
      anomalyHistory: [...data.anomalyHistory, ...anomalies],
    })
  }

  // --- Cash Flow Computation ---

  computeCashFlow(startDate: string, endDate: string): CashFlowSummary {
    const data = this.readData()
    const txns = data.transactions.filter(
      (tx) => tx.date >= startDate && tx.date <= endDate && tx.status === "posted"
    )

    const income = txns.filter((tx) => tx.amount < 0)
    const expenses = txns.filter((tx) => tx.amount > 0)

    const totalIncome = Math.abs(income.reduce((sum, tx) => sum + tx.amount, 0))
    const totalExpenses = expenses.reduce((sum, tx) => sum + tx.amount, 0)

    const incomeByCategory = this.groupByCategory(income, totalIncome)
    const expensesByCategory = this.groupByCategory(expenses, totalExpenses)
    const topMerchants = this.groupByMerchant(expenses)

    const savingsRate = totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0

    return {
      period: { start: startDate, end: endDate },
      totalIncome: roundCents(totalIncome),
      totalExpenses: roundCents(totalExpenses),
      netCashFlow: roundCents(totalIncome - totalExpenses),
      currency: "USD",
      incomeByCategory,
      expensesByCategory,
      topMerchants: topMerchants.slice(0, 10),
      savingsRate: roundPercent(savingsRate),
    }
  }

  private groupByCategory(
    txns: ReadonlyArray<Transaction>,
    total: number
  ): ReadonlyArray<{ category: Transaction["category"]; amount: number; transactionCount: number; percentOfTotal: number }> {
    const groups = new Map<string, { amount: number; count: number }>()
    for (const tx of txns) {
      const existing = groups.get(tx.category) ?? { amount: 0, count: 0 }
      groups.set(tx.category, {
        amount: existing.amount + Math.abs(tx.amount),
        count: existing.count + 1,
      })
    }

    return Array.from(groups.entries())
      .map(([category, data]) => ({
        category: category as Transaction["category"],
        amount: roundCents(data.amount),
        transactionCount: data.count,
        percentOfTotal: total > 0 ? roundPercent(data.amount / total) : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
  }

  private groupByMerchant(
    txns: ReadonlyArray<Transaction>
  ): ReadonlyArray<{ merchantName: string; totalAmount: number; transactionCount: number }> {
    const groups = new Map<string, { amount: number; count: number }>()
    for (const tx of txns) {
      const name = tx.merchantName ?? tx.name
      const existing = groups.get(name) ?? { amount: 0, count: 0 }
      groups.set(name, {
        amount: existing.amount + Math.abs(tx.amount),
        count: existing.count + 1,
      })
    }

    return Array.from(groups.entries())
      .map(([merchantName, data]) => ({
        merchantName,
        totalAmount: roundCents(data.amount),
        transactionCount: data.count,
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
  }
}

// --- Utility ---

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}

function roundPercent(value: number): number {
  return Math.round(value * 10000) / 10000
}

export { computeSha256, generateId, mergeById }
