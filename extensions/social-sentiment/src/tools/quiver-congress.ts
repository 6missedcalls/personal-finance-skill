import type { QuiverCongressTrade, ToolContext, ToolResult } from "../types.js"
import { quiverRequest } from "../clients/quiver.js"

interface QuiverCongressInput {
  readonly symbol?: string
  readonly limit?: number
  readonly daysBack?: number
}

function filterByDaysBack(
  trades: ReadonlyArray<QuiverCongressTrade>,
  daysBack: number
): ReadonlyArray<QuiverCongressTrade> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - daysBack)
  const cutoffIso = cutoff.toISOString()

  return trades.filter((trade) => trade.transaction_date >= cutoffIso.slice(0, 10))
}

export const quiverCongressTool = {
  name: "social_quiver_congress",
  description:
    "Get congressional stock trading data from Quiver Quantitative, optionally filtered by symbol and recency",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description:
          "Stock ticker symbol to filter trades (e.g. 'AAPL'). If omitted, returns all recent congressional trades.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of trades to return. Defaults to 50.",
      },
      daysBack: {
        type: "number",
        description:
          "Only include trades within the last N days. If omitted, no date filter is applied.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: QuiverCongressInput,
    context: ToolContext
  ): Promise<ToolResult<{ readonly trades: ReadonlyArray<QuiverCongressTrade> }>> {
    try {
      const limit = input.limit ?? 50

      const path = input.symbol
        ? `/historical/congresstrading/${encodeURIComponent(input.symbol.toUpperCase())}`
        : "/historical/congresstrading"

      const allTrades = await quiverRequest<ReadonlyArray<QuiverCongressTrade>>(
        context.config,
        path
      )

      const filteredByDate = input.daysBack !== undefined
        ? filterByDaysBack(allTrades, input.daysBack)
        : allTrades

      const trades = filteredByDate.slice(0, limit)

      return {
        success: true,
        data: { trades },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve congressional trading data: ${message}`,
      }
    }
  },
}
