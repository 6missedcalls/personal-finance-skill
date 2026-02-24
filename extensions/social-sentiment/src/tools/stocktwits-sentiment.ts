import type {
  StockTwitsMessage,
  StockTwitsSentimentResult,
  ToolContext,
  ToolResult,
} from "../types.js"
import { stocktwitsRequest } from "../clients/stocktwits.js"

interface StockTwitsSentimentInput {
  readonly symbol: string
  readonly limit?: number
}

interface StockTwitsStreamResponse {
  readonly messages: ReadonlyArray<StockTwitsMessage>
}

function aggregateSentiment(
  messages: ReadonlyArray<StockTwitsMessage>
): { readonly bullish: number; readonly bearish: number; readonly total: number } {
  let bullish = 0
  let bearish = 0

  for (const message of messages) {
    const basic = message.entities?.sentiment?.basic
    if (basic === "Bullish") {
      bullish += 1
    } else if (basic === "Bearish") {
      bearish += 1
    }
  }

  return { bullish, bearish, total: messages.length }
}

export const stocktwitsSentimentTool = {
  name: "social_stocktwits_sentiment",
  description:
    "Get StockTwits message stream and sentiment breakdown for a stock symbol",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Stock ticker symbol (e.g. 'AAPL', 'TSLA').",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of messages to retrieve. Defaults to 20.",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: StockTwitsSentimentInput,
    context: ToolContext
  ): Promise<ToolResult<StockTwitsSentimentResult>> {
    try {
      const symbol = input.symbol.toUpperCase()
      const limit = input.limit ?? 20

      const response = await stocktwitsRequest<StockTwitsStreamResponse>(
        context.config,
        `/streams/symbol/${encodeURIComponent(symbol)}.json?limit=${limit}`
      )

      const messages = response.messages ?? []
      const sentiment = aggregateSentiment(messages)

      return {
        success: true,
        data: {
          symbol,
          sentiment,
          messages,
          timestamp: new Date().toISOString(),
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve StockTwits sentiment: ${message}`,
      }
    }
  },
}
