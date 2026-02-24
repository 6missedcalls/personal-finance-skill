import type { XTweet, ToolContext, ToolResult } from "../types.js"
import { xApiRequest } from "../clients/x-api.js"

interface XCashtagInput {
  readonly symbol: string
  readonly limit?: number
}

interface XSearchResponse {
  readonly data?: ReadonlyArray<XTweet>
}

interface SentimentSummary {
  readonly positive: number
  readonly negative: number
  readonly neutral: number
}

const POSITIVE_KEYWORDS: ReadonlyArray<string> = [
  "bullish", "buy", "long", "moon", "calls", "up", "green", "rocket", "gains",
]

const NEGATIVE_KEYWORDS: ReadonlyArray<string> = [
  "bearish", "sell", "short", "puts", "down", "red", "crash", "dump", "loss",
]

function classifyTweetSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase()

  const hasPositive = POSITIVE_KEYWORDS.some((kw) => lower.includes(kw))
  const hasNegative = NEGATIVE_KEYWORDS.some((kw) => lower.includes(kw))

  if (hasPositive && !hasNegative) return "positive"
  if (hasNegative && !hasPositive) return "negative"
  return "neutral"
}

function buildSentimentSummary(
  tweets: ReadonlyArray<XTweet>
): SentimentSummary {
  let positive = 0
  let negative = 0
  let neutral = 0

  for (const tweet of tweets) {
    const classification = classifyTweetSentiment(tweet.text)
    if (classification === "positive") {
      positive += 1
    } else if (classification === "negative") {
      negative += 1
    } else {
      neutral += 1
    }
  }

  return { positive, negative, neutral }
}

export const xCashtagTool = {
  name: "social_x_cashtag",
  description:
    "Search X/Twitter for cashtag mentions of a stock symbol and perform keyword-based sentiment analysis",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description:
          "Stock ticker symbol (e.g. 'AAPL'). The '$' prefix is added automatically.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of tweets to return. Defaults to 20.",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: XCashtagInput,
    context: ToolContext
  ): Promise<ToolResult<{
    readonly tweets: ReadonlyArray<XTweet>
    readonly symbol: string
    readonly sentimentSummary: SentimentSummary
  }>> {
    try {
      const symbol = input.symbol.toUpperCase()
      const limit = Math.min(input.limit ?? 20, 100)

      const params: Record<string, string | undefined> = {
        query: `$${symbol}`,
        max_results: String(limit),
        "tweet.fields": "created_at,public_metrics,author_id",
      }

      const response = await xApiRequest<XSearchResponse>(
        context.config,
        "/tweets/search/recent",
        params
      )

      const tweets = response.data ?? []
      const sentimentSummary = buildSentimentSummary(tweets)

      return {
        success: true,
        data: { tweets, symbol, sentimentSummary },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve X/Twitter cashtag data: ${message}`,
      }
    }
  },
}
