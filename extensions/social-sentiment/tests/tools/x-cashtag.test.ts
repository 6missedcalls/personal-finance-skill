import { describe, it, expect, vi, beforeEach } from "vitest"
import { xCashtagTool } from "../../src/tools/x-cashtag.ts"
import {
  mockContext,
  mockConfigNoX,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("xCashtagTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockTweets = [
    {
      id: "ct-001",
      text: "$AAPL bullish setup, going long with calls!",
      created_at: "2024-06-15T10:00:00Z",
      author_id: "user-001",
      public_metrics: {
        retweet_count: 20,
        reply_count: 5,
        like_count: 100,
        quote_count: 2,
      },
    },
    {
      id: "ct-002",
      text: "$AAPL crash incoming, bearish divergence on the chart",
      created_at: "2024-06-15T10:15:00Z",
      author_id: "user-002",
      public_metrics: {
        retweet_count: 15,
        reply_count: 8,
        like_count: 50,
        quote_count: 1,
      },
    },
    {
      id: "ct-003",
      text: "$AAPL reporting next week, interesting to watch",
      created_at: "2024-06-15T10:30:00Z",
      author_id: "user-003",
      public_metrics: {
        retweet_count: 5,
        reply_count: 2,
        like_count: 20,
        quote_count: 0,
      },
    },
  ]

  it("returns tweets with sentiment summary on success", async () => {
    mockFetchSuccess({ data: mockTweets })

    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual(mockTweets)
    expect(result.data?.symbol).toBe("AAPL")
    expect(result.data?.sentimentSummary).toBeDefined()
  })

  it("counts positive sentiment from keywords correctly", async () => {
    mockFetchSuccess({ data: mockTweets })

    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    // Tweet 1: "bullish", "long", "calls" -> positive
    // Tweet 2: "crash", "bearish" -> negative
    // Tweet 3: no keywords -> neutral
    expect(result.data?.sentimentSummary.positive).toBe(1)
    expect(result.data?.sentimentSummary.negative).toBe(1)
    expect(result.data?.sentimentSummary.neutral).toBe(1)
  })

  it("classifies tweets with no matching keywords as neutral", async () => {
    const neutralTweets = [
      {
        id: "ct-100",
        text: "$AAPL reporting earnings next Thursday",
        created_at: "2024-06-15T10:00:00Z",
        author_id: "user-100",
        public_metrics: {
          retweet_count: 5,
          reply_count: 1,
          like_count: 10,
          quote_count: 0,
        },
      },
    ]

    mockFetchSuccess({ data: neutralTweets })

    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.data?.sentimentSummary.positive).toBe(0)
    expect(result.data?.sentimentSummary.negative).toBe(0)
    expect(result.data?.sentimentSummary.neutral).toBe(1)
  })

  it("searches with $ prefix for the symbol", async () => {
    mockFetchSuccess({ data: [] })

    await xCashtagTool.handler({ symbol: "AAPL" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("query=%24AAPL")
  })

  it("uppercases the symbol", async () => {
    mockFetchSuccess({ data: [] })

    await xCashtagTool.handler({ symbol: "tsla" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("query=%24TSLA")
  })

  it("returns error on API failure", async () => {
    mockFetchError(403, "Forbidden")

    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve X/Twitter cashtag data")
    expect(result.error).toContain("403")
  })

  it("returns error when bearer token is not configured", async () => {
    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      { config: mockConfigNoX }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("X_API_BEARER_TOKEN not configured")
  })

  it("defaults limit to 20", async () => {
    mockFetchSuccess({ data: [] })

    await xCashtagTool.handler({ symbol: "AAPL" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=20")
  })

  it("caps limit at 100", async () => {
    mockFetchSuccess({ data: [] })

    await xCashtagTool.handler({ symbol: "AAPL", limit: 200 }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=100")
  })

  it("handles empty data response gracefully", async () => {
    mockFetchSuccess({ data: [] })

    const result = await xCashtagTool.handler(
      { symbol: "XYZ" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual([])
    expect(result.data?.sentimentSummary).toEqual({
      positive: 0,
      negative: 0,
      neutral: 0,
    })
  })

  it("classifies tweet with both positive and negative keywords as neutral", async () => {
    const mixedTweets = [
      {
        id: "ct-200",
        text: "$AAPL bullish overall but could crash if earnings miss",
        created_at: "2024-06-15T10:00:00Z",
        author_id: "user-200",
        public_metrics: {
          retweet_count: 10,
          reply_count: 3,
          like_count: 25,
          quote_count: 1,
        },
      },
    ]

    mockFetchSuccess({ data: mixedTweets })

    const result = await xCashtagTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.data?.sentimentSummary.neutral).toBe(1)
    expect(result.data?.sentimentSummary.positive).toBe(0)
    expect(result.data?.sentimentSummary.negative).toBe(0)
  })
})
