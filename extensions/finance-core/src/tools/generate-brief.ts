import type { FinanceStore } from "../storage/store.js"
import type {
  BriefActionItem,
  BriefSection,
  FinancialBrief,
  GenerateBriefInput,
} from "../types.js"

export const generateBriefTool = {
  name: "finance_generate_brief",
  description:
    "Create a structured weekly or monthly financial summary. Generates sections covering net worth, cash flow, portfolio performance, subscriptions, and anomalies. Returns structured data the agent can format for delivery via any channel.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      period: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "quarterly"],
        description: "Brief period",
      },
      includeSections: {
        type: "array",
        items: { type: "string" },
        description:
          "Which sections to include: net_worth, cash_flow, positions, anomalies, subscriptions, action_items. Defaults to all.",
      },
    },
    required: ["userId", "period"],
  },

  createHandler(store: FinanceStore) {
    return async (input: GenerateBriefInput): Promise<FinancialBrief> => {
      const sectionSet = new Set(
        input.includeSections ?? [
          "net_worth",
          "cash_flow",
          "positions",
          "anomalies",
          "subscriptions",
          "action_items",
        ]
      )

      const { startDate, endDate } = getPeriodDates(input.period)
      const sections: BriefSection[] = []
      const actionItems: BriefActionItem[] = []
      const highlights: string[] = []

      if (sectionSet.has("net_worth")) {
        const accounts = store.getAccounts()
        const positions = store.getPositions()
        const liabilities = store.getLiabilities()

        const assetTotal = accounts
          .filter((a) => !["credit", "loan", "mortgage"].includes(a.type))
          .reduce((sum, a) => sum + a.balances.current, 0)
        const investmentTotal = positions.reduce((sum, p) => sum + p.marketValue, 0)
        const liabilityTotal = liabilities.reduce((sum, l) => sum + l.currentBalance, 0)
        const netWorth = assetTotal + investmentTotal - liabilityTotal

        sections.push({
          title: "Net Worth",
          content: `Total net worth: $${netWorth.toFixed(2)}. Assets: $${(assetTotal + investmentTotal).toFixed(2)}, Liabilities: $${liabilityTotal.toFixed(2)}.`,
          dataPoints: {
            netWorth,
            totalAssets: assetTotal + investmentTotal,
            totalLiabilities: liabilityTotal,
            accountCount: accounts.length,
          },
        })

        highlights.push(`Net worth: $${netWorth.toFixed(2)}`)
      }

      if (sectionSet.has("cash_flow")) {
        const cashFlow = store.computeCashFlow(startDate, endDate)
        sections.push({
          title: "Cash Flow",
          content: `Income: $${cashFlow.totalIncome.toFixed(2)}, Expenses: $${cashFlow.totalExpenses.toFixed(2)}, Net: $${cashFlow.netCashFlow.toFixed(2)}. Savings rate: ${(cashFlow.savingsRate * 100).toFixed(1)}%.`,
          dataPoints: {
            totalIncome: cashFlow.totalIncome,
            totalExpenses: cashFlow.totalExpenses,
            netCashFlow: cashFlow.netCashFlow,
            savingsRate: cashFlow.savingsRate,
            topCategories: cashFlow.expensesByCategory.slice(0, 5),
          },
        })

        highlights.push(
          `Savings rate: ${(cashFlow.savingsRate * 100).toFixed(1)}%`
        )

        if (cashFlow.netCashFlow < 0) {
          actionItems.push({
            priority: "high",
            title: "Negative cash flow",
            description: `Spending exceeded income by $${Math.abs(cashFlow.netCashFlow).toFixed(2)} this period.`,
            actionType: null,
          })
        }
      }

      if (sectionSet.has("positions")) {
        const positions = store.getPositions()
        const totalValue = positions.reduce((sum, p) => sum + p.marketValue, 0)
        const totalGainLoss = positions.reduce(
          (sum, p) => sum + (p.unrealizedGainLoss ?? 0),
          0
        )

        sections.push({
          title: "Portfolio",
          content: `${positions.length} positions worth $${totalValue.toFixed(2)}. Unrealized P/L: $${totalGainLoss.toFixed(2)}.`,
          dataPoints: {
            positionCount: positions.length,
            totalMarketValue: totalValue,
            unrealizedGainLoss: totalGainLoss,
            topPositions: positions
              .sort((a, b) => b.marketValue - a.marketValue)
              .slice(0, 5)
              .map((p) => ({
                symbol: p.symbol,
                marketValue: p.marketValue,
                gainLoss: p.unrealizedGainLoss,
              })),
          },
        })
      }

      if (sectionSet.has("anomalies")) {
        const recentAnomalies = store.getAnomalyHistory()
          .filter((a) => a.detectedAt >= startDate)

        if (recentAnomalies.length > 0) {
          sections.push({
            title: "Alerts",
            content: `${recentAnomalies.length} anomaly(ies) detected this period.`,
            dataPoints: {
              count: recentAnomalies.length,
              bySeverity: {
                critical: recentAnomalies.filter((a) => a.severity === "critical").length,
                high: recentAnomalies.filter((a) => a.severity === "high").length,
                medium: recentAnomalies.filter((a) => a.severity === "medium").length,
                low: recentAnomalies.filter((a) => a.severity === "low").length,
              },
              items: recentAnomalies.slice(0, 5).map((a) => ({
                title: a.title,
                severity: a.severity,
                description: a.description,
              })),
            },
          })

          const criticalCount = recentAnomalies.filter(
            (a) => a.severity === "critical" || a.severity === "high"
          ).length
          if (criticalCount > 0) {
            actionItems.push({
              priority: "high",
              title: `${criticalCount} high-priority alert(s)`,
              description: "Review critical and high-severity anomalies.",
              actionType: null,
            })
          }
        }
      }

      if (sectionSet.has("subscriptions")) {
        const subscriptions = store.getSubscriptions()
        const activeCount = subscriptions.filter((s) => s.isActive).length
        const monthlyTotal = subscriptions
          .filter((s) => s.isActive)
          .reduce((sum, s) => {
            const multiplier: Record<string, number> = {
              weekly: 4.33,
              biweekly: 2.17,
              monthly: 1,
              quarterly: 1 / 3,
              annual: 1 / 12,
            }
            return sum + s.estimatedAmount * (multiplier[s.frequency] ?? 1)
          }, 0)

        sections.push({
          title: "Subscriptions",
          content: `${activeCount} active subscriptions totaling ~$${monthlyTotal.toFixed(2)}/month.`,
          dataPoints: {
            activeCount,
            monthlyEstimate: monthlyTotal,
            annualEstimate: monthlyTotal * 12,
          },
        })
      }

      return {
        period: input.period,
        generatedAt: new Date().toISOString(),
        sections,
        actionItems,
        highlights,
      }
    }
  },
}

function getPeriodDates(period: string): { startDate: string; endDate: string } {
  const now = new Date()
  const endDate = now.toISOString().split("T")[0]
  const start = new Date(now)

  switch (period) {
    case "daily":
      start.setDate(start.getDate() - 1)
      break
    case "weekly":
      start.setDate(start.getDate() - 7)
      break
    case "monthly":
      start.setMonth(start.getMonth() - 1)
      break
    case "quarterly":
      start.setMonth(start.getMonth() - 3)
      break
    default:
      start.setDate(start.getDate() - 7)
  }

  return { startDate: start.toISOString().split("T")[0], endDate }
}
