import type { AlpacaOrder, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface ListOrdersInput {
  readonly status?: "open" | "closed" | "all"
  readonly limit?: number
  readonly after?: string
  readonly until?: string
  readonly direction?: "asc" | "desc"
  readonly symbols?: string
}

export const listOrdersTool = {
  name: "alpaca_list_orders",
  description:
    "List orders with optional filters for status, limit, direction, and date range",
  input_schema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["open", "closed", "all"],
        description:
          "Order status filter. Defaults to 'open' if not specified.",
      },
      limit: {
        type: "number",
        description: "Maximum number of orders to return. Max 500.",
      },
      after: {
        type: "string",
        description:
          "RFC-3339 or YYYY-MM-DD timestamp. Orders submitted after this date.",
      },
      until: {
        type: "string",
        description:
          "RFC-3339 or YYYY-MM-DD timestamp. Orders submitted before this date.",
      },
      direction: {
        type: "string",
        enum: ["asc", "desc"],
        description: "Sort direction by submitted_at. Defaults to 'desc'.",
      },
      symbols: {
        type: "string",
        description:
          "Comma-separated list of symbols to filter by (e.g. 'AAPL,TSLA').",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: ListOrdersInput,
    context: ToolContext
  ): Promise<ToolResult<ReadonlyArray<AlpacaOrder>>> {
    try {
      const params: Record<string, string | undefined> = {
        status: input.status,
        limit: input.limit !== undefined ? String(input.limit) : undefined,
        after: input.after,
        until: input.until,
        direction: input.direction,
        symbols: input.symbols,
      }

      const orders = await alpacaRequest<ReadonlyArray<AlpacaOrder>>(
        context.config,
        "/v2/orders",
        { params }
      )

      return {
        success: true,
        data: orders,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to list orders: ${message}`,
      }
    }
  },
}
