import { describe, it, expect, vi, beforeEach } from "vitest"
import { xSearchTool } from "../../src/tools/x-search.ts"
import {
  mockContext,
  mockConfigNoX,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("xSearchTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockTweets = [
    {
      id: "tweet-001",
      text: "AAPL earnings looking great this quarter!",
      created_at: "2024-06-15T12:00:00Z",
      author_id: "user-001",
      public_metrics: {
        retweet_count: 50,
        reply_count: 10,
        like_count: 200,
        quote_count: 5,
      },
    },
    {
      id: "tweet-002",
      text: "Apple stock analysis thread",
      created_at: "2024-06-15T11:30:00Z",
      author_id: "user-002",
      public_metrics: {
        retweet_count: 30,
        reply_count: 8,
        like_count: 150,
        quote_count: 3,
      },
    },
  ]

  it("returns tweets on success", async () => {
    mockFetchSuccess({ data: mockTweets, meta: { result_count: 2 } })

    const result = await xSearchTool.handler(
      { query: "AAPL earnings" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual(mockTweets)
    expect(result.data?.resultCount).toBe(2)
  })

  it("returns error on API failure", async () => {
    mockFetchError(429, "Too Many Requests")

    const result = await xSearchTool.handler(
      { query: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to search X/Twitter")
    expect(result.error).toContain("429")
  })

  it("returns error when bearer token is not configured", async () => {
    const result = await xSearchTool.handler(
      { query: "AAPL" },
      { config: mockConfigNoX }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("X_API_BEARER_TOKEN not configured")
  })

  it("sends Authorization Bearer header", async () => {
    mockFetchSuccess({ data: [], meta: { result_count: 0 } })

    await xSearchTool.handler({ query: "AAPL" }, mockContext)

    const { options } = getLastFetchCall()
    const headers = options.headers as Record<string, string>
    expect(headers["Authorization"]).toBe("Bearer test-bearer-token")
  })

  it("calls the correct search endpoint with query params", async () => {
    mockFetchSuccess({ data: [], meta: { result_count: 0 } })

    await xSearchTool.handler(
      { query: "AAPL earnings", limit: 25 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("https://api.twitter.com/2/tweets/search/recent")
    expect(url).toContain("query=AAPL+earnings")
    expect(url).toContain("max_results=25")
    expect(url).toContain("tweet.fields=created_at%2Cpublic_metrics%2Cauthor_id")
  })

  it("caps limit at 100", async () => {
    mockFetchSuccess({ data: [], meta: { result_count: 0 } })

    await xSearchTool.handler(
      { query: "AAPL", limit: 500 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=100")
  })

  it("defaults limit to 10", async () => {
    mockFetchSuccess({ data: [], meta: { result_count: 0 } })

    await xSearchTool.handler({ query: "AAPL" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=10")
  })

  it("passes startTime and endTime parameters", async () => {
    mockFetchSuccess({ data: [], meta: { result_count: 0 } })

    await xSearchTool.handler(
      {
        query: "AAPL",
        startTime: "2024-01-01T00:00:00Z",
        endTime: "2024-01-31T23:59:59Z",
      },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("start_time=2024-01-01T00%3A00%3A00Z")
    expect(url).toContain("end_time=2024-01-31T23%3A59%3A59Z")
  })

  it("handles empty data response gracefully", async () => {
    mockFetchSuccess({ meta: { result_count: 0 } })

    const result = await xSearchTool.handler(
      { query: "obscure query" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual([])
    expect(result.data?.resultCount).toBe(0)
  })
})
