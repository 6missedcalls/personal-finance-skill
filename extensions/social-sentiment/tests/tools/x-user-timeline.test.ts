import { describe, it, expect, vi, beforeEach } from "vitest"
import { xUserTimelineTool } from "../../src/tools/x-user-timeline.ts"
import {
  mockContext,
  mockConfigNoX,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("xUserTimelineTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockTweets = [
    {
      id: "tweet-100",
      text: "My latest market analysis thread",
      created_at: "2024-06-15T14:00:00Z",
      author_id: "12345",
      public_metrics: {
        retweet_count: 100,
        reply_count: 25,
        like_count: 500,
        quote_count: 15,
      },
    },
    {
      id: "tweet-101",
      text: "Interesting price action today",
      created_at: "2024-06-15T13:00:00Z",
      author_id: "12345",
      public_metrics: {
        retweet_count: 40,
        reply_count: 10,
        like_count: 200,
        quote_count: 5,
      },
    },
  ]

  it("returns user tweets on success", async () => {
    mockFetchSuccess({ data: mockTweets })

    const result = await xUserTimelineTool.handler(
      { userId: "12345" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual(mockTweets)
  })

  it("returns error on API failure", async () => {
    mockFetchError(404, "User not found")

    const result = await xUserTimelineTool.handler(
      { userId: "99999" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve X/Twitter user timeline")
    expect(result.error).toContain("404")
  })

  it("returns error when bearer token is not configured", async () => {
    const result = await xUserTimelineTool.handler(
      { userId: "12345" },
      { config: mockConfigNoX }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("X_API_BEARER_TOKEN not configured")
  })

  it("calls the correct URL with userId in path", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler({ userId: "12345" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("https://api.twitter.com/2/users/12345/tweets")
  })

  it("sends Authorization Bearer header", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler({ userId: "12345" }, mockContext)

    const { options } = getLastFetchCall()
    const headers = options.headers as Record<string, string>
    expect(headers["Authorization"]).toBe("Bearer test-bearer-token")
  })

  it("passes limit as max_results parameter", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler(
      { userId: "12345", limit: 50 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=50")
  })

  it("caps limit at 100", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler(
      { userId: "12345", limit: 999 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=100")
  })

  it("defaults limit to 10", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler({ userId: "12345" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("max_results=10")
  })

  it("includes tweet.fields in query params", async () => {
    mockFetchSuccess({ data: [] })

    await xUserTimelineTool.handler({ userId: "12345" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("tweet.fields=created_at%2Cpublic_metrics")
  })

  it("handles empty data response gracefully", async () => {
    mockFetchSuccess({})

    const result = await xUserTimelineTool.handler(
      { userId: "12345" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.tweets).toEqual([])
  })
})
