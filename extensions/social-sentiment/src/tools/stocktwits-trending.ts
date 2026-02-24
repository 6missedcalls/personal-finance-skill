import type { StockTwitsTrendingSymbol, ToolContext, ToolResult } from "../types.js"
import { stocktwitsRequest } from "../clients/stocktwits.js"

interface StockTwitsTrendingInput {
  readonly limit?: number
}

interface StockTwitsTrendingResponse {
  readonly symbols: ReadonlyArray<StockTwitsTrendingSymbol>
}

export const stocktwitsTrendingTool = {
  name: "social_stocktwits_trending",
  description:
    "Get trending stock symbols on StockTwits with watchlist counts",
  input_schema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description:
          "Maximum number of trending symbols to return. Defaults to 20.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: StockTwitsTrendingInput,
    context: ToolContext
  ): Promise<ToolResult<{ readonly symbols: ReadonlyArray<StockTwitsTrendingSymbol> }>> {
    try {
      const limit = input.limit ?? 20

      const response = await stocktwitsRequest<StockTwitsTrendingResponse>(
        context.config,
        `/trending/symbols.json?limit=${limit}`
      )

      const symbols = response.symbols ?? []

      return {
        success: true,
        data: { symbols },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve StockTwits trending symbols: ${message}`,
      }
    }
  },
}
