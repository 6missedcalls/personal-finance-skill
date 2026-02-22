import type { ToolContext, ToolResult } from "../types.js"
import { alpacaDataRequest } from "../client.js"

type MarketDataType = "bars" | "quotes" | "snapshot"

interface MarketDataInput {
  readonly symbols: string
  readonly type: MarketDataType
  readonly timeframe?: string
  readonly start?: string
  readonly end?: string
  readonly limit?: number
}

type MarketDataResponse = Record<string, unknown>

export const marketDataTool = {
  name: "alpaca_market_data",
  description:
    "Get market data (bars, quotes, or snapshots) for one or more ticker symbols",
  input_schema: {
    type: "object",
    properties: {
      symbols: {
        type: "string",
        description:
          "Comma-separated list of ticker symbols (e.g. 'AAPL,MSFT,GOOG').",
      },
      type: {
        type: "string",
        enum: ["bars", "quotes", "snapshot"],
        description:
          "Type of market data to retrieve: 'bars' for OHLCV candles, 'quotes' for latest bid/ask, 'snapshot' for a full market snapshot.",
      },
      timeframe: {
        type: "string",
        description:
          "Aggregation timeframe for bars (e.g. '1Day', '1Hour', '15Min'). Only applicable when type is 'bars'.",
      },
      start: {
        type: "string",
        description:
          "Start of the time range in RFC-3339 or YYYY-MM-DD format. Only applicable when type is 'bars'.",
      },
      end: {
        type: "string",
        description:
          "End of the time range in RFC-3339 or YYYY-MM-DD format. Only applicable when type is 'bars'.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of data points to return per symbol. Only applicable when type is 'bars'.",
      },
    },
    required: ["symbols", "type"],
    additionalProperties: false,
  },
  async handler(
    input: MarketDataInput,
    context: ToolContext
  ): Promise<ToolResult<MarketDataResponse>> {
    try {
      const { symbols, type, timeframe, start, end, limit } = input

      if (type === "bars") {
        const params: Record<string, string | undefined> = {
          symbols,
          timeframe,
          start,
          end,
          limit: limit !== undefined ? String(limit) : undefined,
        }

        const data = await alpacaDataRequest<MarketDataResponse>(
          context.config,
          "/v2/stocks/bars",
          params
        )

        return {
          success: true,
          data,
        }
      }

      if (type === "quotes") {
        const data = await alpacaDataRequest<MarketDataResponse>(
          context.config,
          "/v2/stocks/quotes/latest",
          { symbols }
        )

        return {
          success: true,
          data,
        }
      }

      // type === "snapshot"
      const data = await alpacaDataRequest<MarketDataResponse>(
        context.config,
        "/v2/stocks/snapshots",
        { symbols }
      )

      return {
        success: true,
        data,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve market data: ${message}`,
      }
    }
  },
}
