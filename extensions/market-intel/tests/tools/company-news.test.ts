import { describe, it, expect, vi, beforeEach } from "vitest"
import { companyNewsTool } from "../../src/tools/company-news.ts"
import {
  mockConfig,
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_company_news", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockArticles = [
    {
      category: "company",
      datetime: 1700000000,
      headline: "Apple reports record earnings",
      id: 12345,
      image: "https://example.com/image.jpg",
      related: "AAPL",
      source: "Reuters",
      summary: "Apple Inc reported record quarterly earnings.",
      url: "https://example.com/article",
    },
    {
      category: "company",
      datetime: 1700100000,
      headline: "Apple launches new product",
      id: 12346,
      image: "https://example.com/image2.jpg",
      related: "AAPL",
      source: "Bloomberg",
      summary: "Apple Inc launches a new product line.",
      url: "https://example.com/article2",
    },
  ]

  it("returns company news on success", async () => {
    mockFetchSuccess(mockArticles)

    const result = await companyNewsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(2)
    expect(result.data?.symbol).toBe("AAPL")
    expect(result.data?.dateRange.from).toBeDefined()
    expect(result.data?.dateRange.to).toBeDefined()
  })

  it("returns error on API failure", async () => {
    mockFetchError(429, "Rate limit exceeded")

    const result = await companyNewsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch company news")
    expect(result.error).toContain("429")
  })

  it("returns error when FINNHUB_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("finnhubApiKey") }

    const result = await companyNewsTool.handler(
      { symbol: "AAPL" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("FINNHUB_API_KEY not configured")
  })

  it("constructs correct URL with token and query params", async () => {
    mockFetchSuccess(mockArticles)

    await companyNewsTool.handler(
      { symbol: "AAPL", from: "2024-01-01", to: "2024-01-31" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("finnhub.io")
    expect(url).toContain("company-news")
    expect(url).toContain("token=test-finnhub-key")
    expect(url).toContain("symbol=AAPL")
    expect(url).toContain("from=2024-01-01")
    expect(url).toContain("to=2024-01-31")
  })

  it("uses default date range when from/to not provided", async () => {
    mockFetchSuccess(mockArticles)

    const result = await companyNewsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    const { url } = getLastFetchCall()
    expect(url).toContain("from=")
    expect(url).toContain("to=")
  })

  it("slices articles to limit", async () => {
    const manyArticles = Array.from({ length: 30 }, (_, i) => ({
      ...mockArticles[0],
      id: i,
      headline: `Article ${i}`,
    }))
    mockFetchSuccess(manyArticles)

    const result = await companyNewsTool.handler(
      { symbol: "AAPL", limit: 5 },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(5)
  })

  it("caps limit at 50", async () => {
    const manyArticles = Array.from({ length: 60 }, (_, i) => ({
      ...mockArticles[0],
      id: i,
      headline: `Article ${i}`,
    }))
    mockFetchSuccess(manyArticles)

    const result = await companyNewsTool.handler(
      { symbol: "AAPL", limit: 100 },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(50)
  })

  it("defaults limit to 20", async () => {
    const manyArticles = Array.from({ length: 25 }, (_, i) => ({
      ...mockArticles[0],
      id: i,
      headline: `Article ${i}`,
    }))
    mockFetchSuccess(manyArticles)

    const result = await companyNewsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.articles).toHaveLength(20)
  })
})
