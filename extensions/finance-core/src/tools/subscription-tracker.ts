import { generateId } from "../storage/store.js"
import type { FinanceStore } from "../storage/store.js"
import type {
  Subscription,
  SubscriptionSummary,
  SubscriptionTrackerInput,
  Transaction,
  TransactionCategory,
} from "../types.js"

export const subscriptionTrackerTool = {
  name: "finance_subscription_tracker",
  description:
    "Identify and track recurring subscriptions by analyzing transaction patterns. Detects monthly, quarterly, and annual recurring charges. Reports new and canceled subscriptions since last check.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      lookbackMonths: {
        type: "number",
        description: "Number of months to analyze for recurring patterns (default 6)",
      },
    },
    required: ["userId"],
  },

  createHandler(store: FinanceStore) {
    return async (input: SubscriptionTrackerInput): Promise<SubscriptionSummary> => {
      const lookbackMonths = input.lookbackMonths ?? 6
      const cutoffDate = new Date()
      cutoffDate.setMonth(cutoffDate.getMonth() - lookbackMonths)
      const cutoffStr = cutoffDate.toISOString().split("T")[0]

      const { transactions } = store.getTransactions({
        userId: input.userId,
        startDate: cutoffStr,
        status: "posted",
        limit: 50000,
      })

      const expenses = transactions.filter((tx) => tx.amount > 0)
      const detected = detectRecurringCharges(expenses, lookbackMonths)

      const previousSubscriptions = store.getSubscriptions()
      const previousIds = new Set(previousSubscriptions.map((s) => s.merchantName))
      const currentIds = new Set(detected.map((s) => s.merchantName))

      const newSinceLastCheck = detected.filter((s) => !previousIds.has(s.merchantName))
      const canceledSinceLastCheck = previousSubscriptions.filter(
        (s) => s.isActive && !currentIds.has(s.merchantName)
      )

      store.setSubscriptions(detected)

      const totalMonthlyEstimate = detected.reduce(
        (sum, s) => sum + toMonthlyAmount(s.estimatedAmount, s.frequency),
        0
      )

      return {
        activeSubscriptions: detected,
        totalMonthlyEstimate: roundCents(totalMonthlyEstimate),
        totalAnnualEstimate: roundCents(totalMonthlyEstimate * 12),
        currency: "USD",
        newSinceLastCheck,
        canceledSinceLastCheck,
      }
    }
  },
}

interface MerchantPattern {
  readonly merchantName: string
  readonly amounts: ReadonlyArray<number>
  readonly dates: ReadonlyArray<string>
  readonly txIds: ReadonlyArray<string>
  readonly accountId: string
  readonly category: TransactionCategory
}

function detectRecurringCharges(
  transactions: ReadonlyArray<Transaction>,
  lookbackMonths: number
): ReadonlyArray<Subscription> {
  const merchantGroups = new Map<string, MerchantPattern>()

  for (const tx of transactions) {
    const name = tx.merchantName ?? tx.name
    const existing = merchantGroups.get(name)

    if (existing) {
      merchantGroups.set(name, {
        ...existing,
        amounts: [...existing.amounts, tx.amount],
        dates: [...existing.dates, tx.date],
        txIds: [...existing.txIds, tx.id],
      })
    } else {
      merchantGroups.set(name, {
        merchantName: name,
        amounts: [tx.amount],
        dates: [tx.date],
        txIds: [tx.id],
        accountId: tx.accountId,
        category: tx.category,
      })
    }
  }

  const subscriptions: Subscription[] = []

  for (const [, pattern] of merchantGroups) {
    if (pattern.dates.length < 2) continue

    const frequency = detectFrequency(pattern.dates)
    if (!frequency) continue

    const amountVariance = computeAmountVariance(pattern.amounts)
    if (amountVariance > 0.15) continue

    const avgAmount =
      pattern.amounts.reduce((sum, a) => sum + a, 0) / pattern.amounts.length
    const sortedDates = [...pattern.dates].sort()
    const lastDate = sortedDates[sortedDates.length - 1]

    const confidenceScore = computeConfidence(
      pattern.dates.length,
      lookbackMonths,
      amountVariance,
      frequency
    )

    if (confidenceScore < 0.5) continue

    subscriptions.push({
      id: generateId("sub"),
      merchantName: pattern.merchantName,
      estimatedAmount: roundCents(avgAmount),
      frequency,
      currency: "USD",
      category: pattern.category,
      lastChargeDate: lastDate,
      nextExpectedDate: estimateNextDate(lastDate, frequency),
      accountId: pattern.accountId,
      transactionIds: pattern.txIds,
      isActive: true,
      confidenceScore: roundCents(confidenceScore),
    })
  }

  return subscriptions.sort((a, b) => b.estimatedAmount - a.estimatedAmount)
}

function detectFrequency(
  dates: ReadonlyArray<string>
): Subscription["frequency"] | null {
  const sorted = [...dates].sort()
  if (sorted.length < 2) return null

  const intervals: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const diff = daysBetween(sorted[i - 1], sorted[i])
    intervals.push(diff)
  }

  const avgInterval = intervals.reduce((sum, d) => sum + d, 0) / intervals.length

  if (avgInterval >= 5 && avgInterval <= 10) return "weekly"
  if (avgInterval >= 12 && avgInterval <= 17) return "biweekly"
  if (avgInterval >= 25 && avgInterval <= 35) return "monthly"
  if (avgInterval >= 80 && avgInterval <= 100) return "quarterly"
  if (avgInterval >= 340 && avgInterval <= 390) return "annual"

  return null
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA)
  const b = new Date(dateB)
  return Math.abs(Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24)))
}

function computeAmountVariance(amounts: ReadonlyArray<number>): number {
  if (amounts.length < 2) return 0
  const avg = amounts.reduce((sum, a) => sum + a, 0) / amounts.length
  if (avg === 0) return 0
  const maxDeviation = Math.max(...amounts.map((a) => Math.abs(a - avg)))
  return maxDeviation / avg
}

function computeConfidence(
  occurrences: number,
  lookbackMonths: number,
  amountVariance: number,
  frequency: Subscription["frequency"]
): number {
  let score = 0.5

  const expectedOccurrences = getExpectedOccurrences(frequency, lookbackMonths)
  const completeness = Math.min(occurrences / expectedOccurrences, 1)
  score += completeness * 0.3

  score -= amountVariance * 0.2

  if (occurrences >= 3) score += 0.1
  if (occurrences >= 6) score += 0.1

  return Math.max(0, Math.min(1, score))
}

function getExpectedOccurrences(
  frequency: Subscription["frequency"],
  months: number
): number {
  const map: Record<string, number> = {
    weekly: months * 4.33,
    biweekly: months * 2.17,
    monthly: months,
    quarterly: months / 3,
    annual: months / 12,
  }
  return Math.max(map[frequency] ?? months, 2)
}

function estimateNextDate(
  lastDate: string,
  frequency: Subscription["frequency"]
): string | null {
  const date = new Date(lastDate)
  const daysToAdd: Record<string, number> = {
    weekly: 7,
    biweekly: 14,
    monthly: 30,
    quarterly: 91,
    annual: 365,
  }
  date.setDate(date.getDate() + (daysToAdd[frequency] ?? 30))
  return date.toISOString().split("T")[0]
}

function toMonthlyAmount(
  amount: number,
  frequency: Subscription["frequency"]
): number {
  const multiplier: Record<string, number> = {
    weekly: 4.33,
    biweekly: 2.17,
    monthly: 1,
    quarterly: 1 / 3,
    annual: 1 / 12,
  }
  return amount * (multiplier[frequency] ?? 1)
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}
