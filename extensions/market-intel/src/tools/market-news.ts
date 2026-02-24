import type {
  MarketIntelConfig,
  ToolResult,
  FinnhubNewsArticle,
} from "../types.js"
import { finnhubRequest } from "../clients/finnhub.js"

type NewsCategory = "general" | "forex" | "crypto" | "merger"

interface MarketNewsInput {
  readonly category?: NewsCategory
  readonly limit?: number
}

interface MarketNewsOutput {
  readonly articles: ReadonlyArray<FinnhubNewsArticle>
  readonly category: string
}

export const marketNewsTool = {
  name: "intel_market_news",
  description:
    "Get latest market news by category (general, forex, crypto, merger) from Finnhub.",
  input_schema: {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: ["general", "forex", "crypto", "merger"],
        description:
          "News category to fetch. Defaults to 'general'.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of articles to return. Defaults to 20, max 50.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: MarketNewsInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<MarketNewsOutput>> {
    try {
      const category = input.category ?? "general"
      const limit = Math.min(input.limit ?? 20, 50)

      const articles = await finnhubRequest<ReadonlyArray<FinnhubNewsArticle>>(
        context.config,
        "/api/v1/news",
        { category }
      )

      return {
        success: true,
        data: {
          articles: articles.slice(0, limit),
          category,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch market news: ${message}`,
      }
    }
  },
}
