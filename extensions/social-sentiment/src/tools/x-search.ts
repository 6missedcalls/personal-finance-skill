import type { XTweet, ToolContext, ToolResult } from "../types.js"
import { xApiRequest } from "../clients/x-api.js"

interface XSearchInput {
  readonly query: string
  readonly limit?: number
  readonly startTime?: string
  readonly endTime?: string
}

interface XSearchResponse {
  readonly data?: ReadonlyArray<XTweet>
  readonly meta?: {
    readonly result_count: number
  }
}

export const xSearchTool = {
  name: "social_x_search",
  description:
    "Search recent tweets on X/Twitter using the v2 search API with full-text query",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Search query string. Supports X API query operators (e.g. 'AAPL earnings', '$TSLA lang:en').",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of tweets to return. Defaults to 10, max 100.",
      },
      startTime: {
        type: "string",
        description:
          "ISO 8601 timestamp for the start of the search window (e.g. '2024-01-01T00:00:00Z').",
      },
      endTime: {
        type: "string",
        description:
          "ISO 8601 timestamp for the end of the search window (e.g. '2024-01-31T23:59:59Z').",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async handler(
    input: XSearchInput,
    context: ToolContext
  ): Promise<ToolResult<{ readonly tweets: ReadonlyArray<XTweet>; readonly resultCount: number }>> {
    try {
      const limit = Math.min(input.limit ?? 10, 100)

      const params: Record<string, string | undefined> = {
        query: input.query,
        max_results: String(limit),
        "tweet.fields": "created_at,public_metrics,author_id",
        start_time: input.startTime,
        end_time: input.endTime,
      }

      const response = await xApiRequest<XSearchResponse>(
        context.config,
        "/tweets/search/recent",
        params
      )

      const tweets = response.data ?? []
      const resultCount = response.meta?.result_count ?? tweets.length

      return {
        success: true,
        data: { tweets, resultCount },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to search X/Twitter: ${message}`,
      }
    }
  },
}
