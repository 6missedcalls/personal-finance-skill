import type { FinanceStore } from "../storage/store.js"
import type { FinancialState, GetStateInput } from "../types.js"

export const getStateTool = {
  name: "finance_get_state",
  description:
    "Get the current financial state including accounts, transactions, positions, liabilities, and tax data. Use the 'include' parameter to limit which data categories are returned.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      include: {
        type: "array",
        items: {
          type: "string",
          enum: ["accounts", "transactions", "positions", "liabilities", "tax"],
        },
        description:
          "Which data categories to include. Defaults to all if omitted.",
      },
      asOf: {
        type: "string",
        description: "Optional ISO timestamp to retrieve state as of a specific point in time",
      },
    },
    required: ["userId"],
  },

  createHandler(store: FinanceStore) {
    return async (input: GetStateInput): Promise<FinancialState> => {
      return store.getState(input.userId, input.include, input.asOf)
    }
  },
}
