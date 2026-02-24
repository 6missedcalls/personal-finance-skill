import type { XTweet, ToolContext, ToolResult } from "../types.js"
import { xApiRequest } from "../clients/x-api.js"

interface XUserTimelineInput {
  readonly userId: string
  readonly limit?: number
}

interface XUserTimelineResponse {
  readonly data?: ReadonlyArray<XTweet>
}

export const xUserTimelineTool = {
  name: "social_x_user_timeline",
  description:
    "Get recent tweets from a specific X/Twitter user by their user ID",
  input_schema: {
    type: "object",
    properties: {
      userId: {
        type: "string",
        description: "The X/Twitter user ID (numeric string).",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of tweets to return. Defaults to 10, max 100.",
      },
    },
    required: ["userId"],
    additionalProperties: false,
  },
  async handler(
    input: XUserTimelineInput,
    context: ToolContext
  ): Promise<ToolResult<{ readonly tweets: ReadonlyArray<XTweet> }>> {
    try {
      const limit = Math.min(input.limit ?? 10, 100)

      const params: Record<string, string | undefined> = {
        max_results: String(limit),
        "tweet.fields": "created_at,public_metrics",
      }

      const response = await xApiRequest<XUserTimelineResponse>(
        context.config,
        `/users/${encodeURIComponent(input.userId)}/tweets`,
        params
      )

      const tweets = response.data ?? []

      return {
        success: true,
        data: { tweets },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve X/Twitter user timeline: ${message}`,
      }
    }
  },
}
