import type { FinanceStore } from "../storage/store.js"
import type { UpsertSnapshotInput, UpsertSnapshotOutput } from "../types.js"

export const upsertSnapshotTool = {
  name: "finance_upsert_snapshot",
  description:
    "Store a normalized financial data snapshot. Used by data-source extensions (plaid-connect, alpaca-trading, ibkr-portfolio) to persist synced data into the canonical store. Idempotent — duplicate idempotencyKeys return the existing snapshot without re-inserting.",
  input_schema: {
    type: "object" as const,
    additionalProperties: false,
    properties: {
      userId: { type: "string", description: "User identifier" },
      source: {
        type: "string",
        enum: ["plaid", "alpaca", "ibkr", "tax", "manual"],
        description: "Data source that produced this snapshot",
      },
      asOf: { type: "string", description: "ISO timestamp for when this data was current" },
      payload: {
        type: "object",
        description:
          "Normalized financial data — may include accounts, transactions, positions, liabilities, and/or tax state",
        properties: {
          accounts: { type: "array" },
          transactions: { type: "array" },
          positions: { type: "array" },
          liabilities: { type: "array" },
          tax: { type: "object" },
        },
      },
      idempotencyKey: {
        type: "string",
        description: "Unique key to prevent duplicate snapshot insertion",
      },
    },
    required: ["userId", "source", "asOf", "payload", "idempotencyKey"],
  },

  createHandler(store: FinanceStore) {
    return async (input: UpsertSnapshotInput): Promise<UpsertSnapshotOutput> => {
      const result = store.upsertSnapshot(
        input.userId,
        input.source,
        input.asOf,
        input.payload,
        input.idempotencyKey
      )
      return result
    }
  },
}
