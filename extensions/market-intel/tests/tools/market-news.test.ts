import { describe, it, expect, vi, beforeEach } from "vitest"
import { marketNewsTool } from "../../src/tools/market-news.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_market_news", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockArticles = [
    {
      category: "general",
      datetime: 1700000000,
      headline: "Markets rally on economic data",
      id: 1001,
      image: "https://example.com/img.jpg",
      related: "",
      source: "CNBC",
      summary: "Markets rallied after positive economic data.",
      url: "https://example.com/market-rally",
    },
  ]

  it("returns market news on success", async () => {
    mockFetchSuccess(mockArticles)

    const result = await marketNewsTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(1)
    expect(result.data?.category).toBe("general")
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal Server Error")

    const result = await marketNewsTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch market news")
    expect(result.error).toContain("500")
  })

  it("returns error when FINNHUB_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("finnhubApiKey") }

    const result = await marketNewsTool.handler({}, nullKeyContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("FINNHUB_API_KEY not configured")
  })

  it("constructs correct URL with category param", async () => {
    mockFetchSuccess(mockArticles)

    await marketNewsTool.handler({ category: "crypto" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("finnhub.io")
    expect(url).toContain("/news")
    expect(url).toContain("category=crypto")
    expect(url).toContain("token=test-finnhub-key")
  })

  it("defaults category to general", async () => {
    mockFetchSuccess(mockArticles)

    const result = await marketNewsTool.handler({}, mockContext)

    expect(result.data?.category).toBe("general")
    const { url } = getLastFetchCall()
    expect(url).toContain("category=general")
  })

  it("slices articles to limit", async () => {
    const manyArticles = Array.from({ length: 30 }, (_, i) => ({
      ...mockArticles[0],
      id: i,
    }))
    mockFetchSuccess(manyArticles)

    const result = await marketNewsTool.handler({ limit: 10 }, mockContext)

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(10)
  })

  it("caps limit at 50", async () => {
    const manyArticles = Array.from({ length: 60 }, (_, i) => ({
      ...mockArticles[0],
      id: i,
    }))
    mockFetchSuccess(manyArticles)

    const result = await marketNewsTool.handler({ limit: 100 }, mockContext)

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(50)
  })
})
