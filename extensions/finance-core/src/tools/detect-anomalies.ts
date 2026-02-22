import { generateId } from "../storage/store.js"
import type { FinanceStore } from "../storage/store.js"
import type {
  Anomaly,
  AnomalySeverity,
  AnomalyType,
  DetectAnomaliesInput,
  DetectAnomaliesOutput,
  Transaction,
} from "../types.js"

interface AnomalyConfig {
  readonly largeTransactionMultiple: number
  readonly balanceDropPercent: number
}

const DEFAULT_CONFIG: AnomalyConfig = {
  largeTransactionMultiple: 3,
  balanceDropPercent: 20,
}

const SEVERITY_ORDER: ReadonlyArray<AnomalySeverity> = ["low", "medium", "high", "critical"]

export const detectAnomaliesTool = {
  name: "finance_detect_anomalies",
  description:
    "Flag unusual transactions or balance changes. Scans recent transactions for large amounts, unusual merchants, duplicate charges, balance drops, and new recurring charges. Returns anomalies sorted by severity.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      lookbackDays: {
        type: "number",
        description: "Number of days to scan (default 30)",
      },
      minSeverity: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        description: "Minimum severity threshold for returned anomalies (default low)",
      },
    },
    required: ["userId"],
  },

  createHandler(store: FinanceStore, config?: Partial<AnomalyConfig>) {
    const effectiveConfig: AnomalyConfig = { ...DEFAULT_CONFIG, ...config }

    return async (input: DetectAnomaliesInput): Promise<DetectAnomaliesOutput> => {
      const lookbackDays = input.lookbackDays ?? 30
      const minSeverity = input.minSeverity ?? "low"
      const minSeverityIndex = SEVERITY_ORDER.indexOf(minSeverity)

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - lookbackDays)
      const cutoffStr = cutoffDate.toISOString().split("T")[0]

      const { transactions } = store.getTransactions({
        userId: input.userId,
        startDate: cutoffStr,
        status: "posted",
        limit: 10000,
      })

      const accounts = store.getAccounts()
      const anomalies: Anomaly[] = []

      anomalies.push(...detectLargeTransactions(transactions, effectiveConfig))
      anomalies.push(...detectDuplicateCharges(transactions))
      anomalies.push(...detectBalanceDrops(accounts, effectiveConfig))
      anomalies.push(...detectUnusualMerchants(transactions))

      const filtered = anomalies.filter(
        (a) => SEVERITY_ORDER.indexOf(a.severity) >= minSeverityIndex
      )

      filtered.sort(
        (a, b) => SEVERITY_ORDER.indexOf(b.severity) - SEVERITY_ORDER.indexOf(a.severity)
      )

      store.appendAnomalies(filtered)

      return {
        anomalies: filtered,
        scannedTransactions: transactions.length,
        scannedAccounts: accounts.length,
        scanTimestamp: new Date().toISOString(),
      }
    }
  },
}

function detectLargeTransactions(
  transactions: ReadonlyArray<Transaction>,
  config: AnomalyConfig
): ReadonlyArray<Anomaly> {
  if (transactions.length < 5) return []

  const amounts = transactions.map((tx) => Math.abs(tx.amount))
  const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
  const threshold = avg * config.largeTransactionMultiple

  return transactions
    .filter((tx) => Math.abs(tx.amount) > threshold)
    .map((tx) => createAnomaly(
      "large_transaction",
      Math.abs(tx.amount) > threshold * 2 ? "high" : "medium",
      `Large transaction: ${tx.merchantName ?? tx.name}`,
      `Transaction of $${Math.abs(tx.amount).toFixed(2)} is ${(Math.abs(tx.amount) / avg).toFixed(1)}x the average of $${avg.toFixed(2)}`,
      tx.id,
      "transaction",
      { amount: tx.amount, average: avg, threshold }
    ))
}

function detectDuplicateCharges(
  transactions: ReadonlyArray<Transaction>
): ReadonlyArray<Anomaly> {
  const anomalies: Anomaly[] = []
  const seen = new Map<string, Transaction>()

  for (const tx of transactions) {
    const key = `${tx.merchantName ?? tx.name}|${Math.abs(tx.amount).toFixed(2)}|${tx.date}`
    const existing = seen.get(key)

    if (existing && existing.id !== tx.id) {
      anomalies.push(
        createAnomaly(
          "duplicate_charge",
          "medium",
          `Possible duplicate: ${tx.merchantName ?? tx.name}`,
          `Two charges of $${Math.abs(tx.amount).toFixed(2)} to ${tx.merchantName ?? tx.name} on ${tx.date}`,
          tx.id,
          "transaction",
          { originalTxId: existing.id, amount: tx.amount, date: tx.date }
        )
      )
    }

    seen.set(key, tx)
  }

  return anomalies
}

function detectBalanceDrops(
  accounts: ReadonlyArray<{ readonly id: string; readonly name: string; readonly balances: { readonly current: number; readonly available: number | null } }>,
  config: AnomalyConfig
): ReadonlyArray<Anomaly> {
  return accounts
    .filter((acct) => {
      if (acct.balances.available === null) return false
      const dropPercent =
        ((acct.balances.current - acct.balances.available) / acct.balances.current) * 100
      return dropPercent > config.balanceDropPercent && acct.balances.current > 0
    })
    .map((acct) => {
      const dropPercent =
        ((acct.balances.current - (acct.balances.available ?? acct.balances.current)) /
          acct.balances.current) *
        100
      return createAnomaly(
        "balance_drop",
        dropPercent > 50 ? "critical" : "high",
        `Balance concern: ${acct.name}`,
        `Available balance is ${dropPercent.toFixed(1)}% below current balance`,
        acct.id,
        "account",
        { current: acct.balances.current, available: acct.balances.available, dropPercent }
      )
    })
}

function detectUnusualMerchants(
  transactions: ReadonlyArray<Transaction>
): ReadonlyArray<Anomaly> {
  const merchantCounts = new Map<string, number>()
  for (const tx of transactions) {
    const name = tx.merchantName ?? tx.name
    merchantCounts.set(name, (merchantCounts.get(name) ?? 0) + 1)
  }

  return transactions
    .filter((tx) => {
      const name = tx.merchantName ?? tx.name
      return (merchantCounts.get(name) ?? 0) === 1 && Math.abs(tx.amount) > 100
    })
    .map((tx) =>
      createAnomaly(
        "unusual_merchant",
        "low",
        `New merchant: ${tx.merchantName ?? tx.name}`,
        `First-time charge of $${Math.abs(tx.amount).toFixed(2)} from ${tx.merchantName ?? tx.name}`,
        tx.id,
        "transaction",
        { amount: tx.amount, merchantName: tx.merchantName ?? tx.name }
      )
    )
}

function createAnomaly(
  type: AnomalyType,
  severity: AnomalySeverity,
  title: string,
  description: string,
  relatedEntityId: string,
  relatedEntityType: Anomaly["relatedEntityType"],
  dataPoints: Record<string, unknown>
): Anomaly {
  return {
    id: generateId("anom"),
    type,
    severity,
    title,
    description,
    detectedAt: new Date().toISOString(),
    relatedEntityId,
    relatedEntityType,
    dataPoints,
  }
}
