import type { FinanceStore } from "../storage/store.js"
import type { CashFlowInput, CashFlowSummary } from "../types.js"

export const cashFlowSummaryTool = {
  name: "finance_cash_flow_summary",
  description:
    "Summarize income vs expenses over a time period. Returns totals by category, top merchants, net cash flow, and savings rate. Useful for understanding spending patterns and financial health.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      startDate: {
        type: "string",
        description: "Start of period (YYYY-MM-DD)",
      },
      endDate: {
        type: "string",
        description: "End of period (YYYY-MM-DD)",
      },
      groupBy: {
        type: "string",
        enum: ["category", "merchant", "account"],
        description: "How to group the breakdown (default category)",
      },
    },
    required: ["userId", "startDate", "endDate"],
  },

  createHandler(store: FinanceStore) {
    return async (input: CashFlowInput): Promise<CashFlowSummary> => {
      return store.computeCashFlow(input.startDate, input.endDate)
    }
  },
}
