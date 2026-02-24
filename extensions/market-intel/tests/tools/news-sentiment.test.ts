import { describe, it, expect, vi, beforeEach } from "vitest"
import { newsSentimentTool } from "../../src/tools/news-sentiment.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_news_sentiment", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockSentimentResponse = {
    items: "50",
    sentiment_score_definition: "Bearish:-1 to -0.35, Neutral:-0.35 to 0.15, Bullish:0.15 to 1",
    relevance_score_definition: "0 to 1, higher is more relevant",
    feed: [
      {
        title: "Apple reports strong Q4 earnings",
        url: "https://example.com/apple-earnings",
        time_published: "20241115T143000",
        authors: ["John Doe"],
        summary: "Apple Inc. reported strong Q4 earnings.",
        source: "Reuters",
        overall_sentiment_score: 0.45,
        overall_sentiment_label: "Bullish",
        ticker_sentiment: [
          {
            ticker: "AAPL",
            relevance_score: "0.95",
            ticker_sentiment_score: "0.52",
            ticker_sentiment_label: "Bullish",
          },
        ],
      },
    ],
  }

  it("returns news sentiment on success", async () => {
    mockFetchSuccess(mockSentimentResponse)

    const result = await newsSentimentTool.handler(
      { tickers: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.feed).toHaveLength(1)
    expect(result.data?.items).toBe("50")
  })

  it("returns error on API failure", async () => {
    mockFetchError(403, "Invalid API key")

    const result = await newsSentimentTool.handler(
      { tickers: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch news sentiment")
    expect(result.error).toContain("403")
  })

  it("returns error when ALPHA_VANTAGE_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("alphaVantageApiKey") }

    const result = await newsSentimentTool.handler(
      { tickers: "AAPL" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("ALPHA_VANTAGE_API_KEY not configured")
  })

  it("constructs correct URL with function and tickers params", async () => {
    mockFetchSuccess(mockSentimentResponse)

    await newsSentimentTool.handler(
      { tickers: "AAPL,MSFT" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("alphavantage.co")
    expect(url).toContain("function=NEWS_SENTIMENT")
    expect(url).toContain("tickers=AAPL%2CMSFT")
    expect(url).toContain("apikey=test-av-key")
  })

  it("includes optional params when provided", async () => {
    mockFetchSuccess(mockSentimentResponse)

    await newsSentimentTool.handler(
      {
        tickers: "AAPL",
        topics: "technology,earnings",
        timeFrom: "20240101T0000",
        timeTo: "20240131T2359",
        limit: 10,
      },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("topics=technology%2Cearnings")
    expect(url).toContain("time_from=20240101T0000")
    expect(url).toContain("time_to=20240131T2359")
    expect(url).toContain("limit=10")
  })

  it("works without any optional params", async () => {
    mockFetchSuccess(mockSentimentResponse)

    const result = await newsSentimentTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    const { url } = getLastFetchCall()
    expect(url).toContain("function=NEWS_SENTIMENT")
    expect(url).not.toContain("tickers=")
    expect(url).not.toContain("topics=")
  })
})
