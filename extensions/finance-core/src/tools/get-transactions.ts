import type { FinanceStore } from "../storage/store.js"
import type { GetTransactionsInput, GetTransactionsOutput } from "../types.js"

export const getTransactionsTool = {
  name: "finance_get_transactions",
  description:
    "Query normalized transactions across all connected sources. Supports filtering by date range, account, category, amount range, and status. Returns paginated results sorted by date descending.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      startDate: {
        type: "string",
        description: "Filter transactions on or after this date (YYYY-MM-DD)",
      },
      endDate: {
        type: "string",
        description: "Filter transactions on or before this date (YYYY-MM-DD)",
      },
      accountId: {
        type: "string",
        description: "Filter to a specific account",
      },
      category: {
        type: "string",
        enum: [
          "income", "transfer", "payment", "food_and_drink", "shopping",
          "transportation", "housing", "utilities", "healthcare",
          "entertainment", "education", "personal_care", "travel",
          "fees", "taxes", "investment", "subscription", "other",
        ],
        description: "Filter by transaction category",
      },
      minAmount: {
        type: "number",
        description: "Minimum absolute transaction amount",
      },
      maxAmount: {
        type: "number",
        description: "Maximum absolute transaction amount",
      },
      status: {
        type: "string",
        enum: ["posted", "pending", "canceled"],
        description: "Filter by transaction status",
      },
      limit: {
        type: "number",
        description: "Max results per page (default 100)",
      },
      offset: {
        type: "number",
        description: "Offset for pagination (default 0)",
      },
    },
    required: ["userId"],
  },

  createHandler(store: FinanceStore) {
    return async (input: GetTransactionsInput): Promise<GetTransactionsOutput> => {
      return store.getTransactions(input)
    }
  },
}
