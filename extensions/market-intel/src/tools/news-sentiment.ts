import type {
  MarketIntelConfig,
  ToolResult,
  AlphaVantageSentimentResponse,
} from "../types.js"
import { alphaVantageRequest } from "../clients/alpha-vantage.js"

interface NewsSentimentInput {
  readonly tickers?: string
  readonly topics?: string
  readonly timeFrom?: string
  readonly timeTo?: string
  readonly limit?: number
}

export const newsSentimentTool = {
  name: "intel_news_sentiment",
  description:
    "Get news articles with sentiment scores and relevance analysis from Alpha Vantage. Supports ticker and topic filtering.",
  input_schema: {
    type: "object",
    properties: {
      tickers: {
        type: "string",
        description:
          "Comma-separated ticker symbols to filter (e.g. 'AAPL,MSFT').",
      },
      topics: {
        type: "string",
        description:
          "Comma-separated topics to filter (e.g. 'technology,earnings').",
      },
      timeFrom: {
        type: "string",
        description:
          "Start time in YYYYMMDDTHHMM format (e.g. '20240101T0000').",
      },
      timeTo: {
        type: "string",
        description:
          "End time in YYYYMMDDTHHMM format (e.g. '20240131T2359').",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of articles to return. Defaults to 50.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: NewsSentimentInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<AlphaVantageSentimentResponse>> {
    try {
      const params: Record<string, string> = {
        function: "NEWS_SENTIMENT",
      }

      if (input.tickers) {
        params.tickers = input.tickers
      }
      if (input.topics) {
        params.topics = input.topics
      }
      if (input.timeFrom) {
        params.time_from = input.timeFrom
      }
      if (input.timeTo) {
        params.time_to = input.timeTo
      }
      if (input.limit !== undefined) {
        params.limit = String(input.limit)
      }

      const result = await alphaVantageRequest<AlphaVantageSentimentResponse>(
        context.config,
        params
      )

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch news sentiment: ${message}`,
      }
    }
  },
}
