import type {
  MarketIntelConfig,
  ToolResult,
  FinnhubRecommendation,
} from "../types.js"
import { finnhubRequest } from "../clients/finnhub.js"

interface AnalystRecommendationsInput {
  readonly symbol: string
}

interface AnalystRecommendationsOutput {
  readonly recommendations: ReadonlyArray<FinnhubRecommendation>
  readonly symbol: string
}

export const analystRecommendationsTool = {
  name: "intel_analyst_recommendations",
  description:
    "Get analyst recommendation trends (buy, hold, sell, strong buy, strong sell) for a stock from Finnhub.",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Stock ticker symbol (e.g. 'AAPL', 'MSFT').",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: AnalystRecommendationsInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<AnalystRecommendationsOutput>> {
    try {
      const recommendations = await finnhubRequest<
        ReadonlyArray<FinnhubRecommendation>
      >(context.config, "/api/v1/stock/recommendation", {
        symbol: input.symbol,
      })

      return {
        success: true,
        data: {
          recommendations,
          symbol: input.symbol,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch analyst recommendations: ${message}`,
      }
    }
  },
}
