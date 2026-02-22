import type { FinanceStore } from "../storage/store.js"
import type {
  AccountType,
  GetNetWorthInput,
  NetWorthBreakdown,
  NetWorthAccountEntry,
  NetWorthCategory,
} from "../types.js"

export const getNetWorthTool = {
  name: "finance_get_net_worth",
  description:
    "Calculate total net worth from all connected accounts. Returns a breakdown by account type and individual account, showing total assets, total liabilities, and net worth.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      asOf: {
        type: "string",
        description: "Optional ISO timestamp for point-in-time calculation",
      },
    },
    required: ["userId"],
  },

  createHandler(store: FinanceStore) {
    return async (input: GetNetWorthInput): Promise<NetWorthBreakdown> => {
      const accounts = store.getAccounts()
      const positions = store.getPositions()
      const liabilities = store.getLiabilities()

      const liabilityTypes: ReadonlyArray<AccountType> = ["credit", "loan", "mortgage"]

      const accountEntries: ReadonlyArray<NetWorthAccountEntry> = accounts.map((acct) => {
        const isLiability = liabilityTypes.includes(acct.type)
        const positionsValue = positions
          .filter((p) => p.accountId === acct.id)
          .reduce((sum, p) => sum + p.marketValue, 0)

        const balance =
          acct.type === "investment" || acct.type === "brokerage" || acct.type === "retirement"
            ? positionsValue > 0
              ? positionsValue
              : acct.balances.current
            : acct.balances.current

        return {
          accountId: acct.id,
          accountName: acct.name,
          institutionName: acct.institutionName,
          type: acct.type,
          balance: roundCents(balance),
          isLiability,
        }
      })

      const liabilityEntries: ReadonlyArray<NetWorthAccountEntry> = liabilities
        .filter((l) => !accountEntries.some((ae) => ae.accountId === l.accountId))
        .map((l) => ({
          accountId: l.accountId,
          accountName: `${l.type} liability`,
          institutionName: "Unknown",
          type: "loan" as AccountType,
          balance: roundCents(-l.currentBalance),
          isLiability: true,
        }))

      const allEntries = [...accountEntries, ...liabilityEntries]

      const totalAssets = roundCents(
        allEntries.filter((e) => !e.isLiability).reduce((sum, e) => sum + e.balance, 0)
      )
      const totalLiabilities = roundCents(
        Math.abs(
          allEntries.filter((e) => e.isLiability).reduce((sum, e) => sum + e.balance, 0)
        )
      )

      const categoryMap = new Map<AccountType, { totalValue: number; accountCount: number }>()
      for (const entry of allEntries) {
        const existing = categoryMap.get(entry.type) ?? { totalValue: 0, accountCount: 0 }
        categoryMap.set(entry.type, {
          totalValue: existing.totalValue + entry.balance,
          accountCount: existing.accountCount + 1,
        })
      }

      const byCategory: ReadonlyArray<NetWorthCategory> = Array.from(categoryMap.entries())
        .map(([category, data]) => ({
          category,
          totalValue: roundCents(data.totalValue),
          accountCount: data.accountCount,
        }))
        .sort((a, b) => Math.abs(b.totalValue) - Math.abs(a.totalValue))

      return {
        totalAssets,
        totalLiabilities,
        netWorth: roundCents(totalAssets - totalLiabilities),
        currency: "USD",
        asOf: input.asOf ?? new Date().toISOString(),
        byCategory,
        byAccount: allEntries,
      }
    }
  },
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100
}
