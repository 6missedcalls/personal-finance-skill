import type {
  MarketIntelConfig,
  ToolResult,
  FredSearchResult,
} from "../types.js"
import { fredRequest } from "../clients/fred.js"

interface FredSearchInput {
  readonly query: string
  readonly limit?: number
}

export const fredSearchTool = {
  name: "intel_fred_search",
  description:
    "Search for FRED economic data series by keyword. Find series IDs for GDP, inflation, employment, interest rates, and more.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Search query (e.g. 'consumer price index', 'unemployment rate', 'GDP').",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of results. Defaults to 20.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async handler(
    input: FredSearchInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<FredSearchResult>> {
    try {
      const limit = input.limit ?? 20

      const result = await fredRequest<FredSearchResult>(
        context.config,
        "/fred/series/search",
        {
          search_text: input.query,
          limit: String(limit),
        }
      )

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to search FRED series: ${message}`,
      }
    }
  },
}
