import { describe, it, expect, vi, beforeEach } from "vitest"
import { analystRecommendationsTool } from "../../src/tools/analyst-recommendations.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_analyst_recommendations", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockRecommendations = [
    {
      buy: 24,
      hold: 7,
      period: "2024-12-01",
      sell: 1,
      strongBuy: 13,
      strongSell: 0,
      symbol: "AAPL",
    },
    {
      buy: 22,
      hold: 8,
      period: "2024-11-01",
      sell: 2,
      strongBuy: 12,
      strongSell: 0,
      symbol: "AAPL",
    },
  ]

  it("returns analyst recommendations on success", async () => {
    mockFetchSuccess(mockRecommendations)

    const result = await analystRecommendationsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.recommendations).toHaveLength(2)
    expect(result.data?.symbol).toBe("AAPL")
  })

  it("returns error on API failure", async () => {
    mockFetchError(401, "Unauthorized")

    const result = await analystRecommendationsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch analyst recommendations")
    expect(result.error).toContain("401")
  })

  it("returns error when FINNHUB_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("finnhubApiKey") }

    const result = await analystRecommendationsTool.handler(
      { symbol: "AAPL" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("FINNHUB_API_KEY not configured")
  })

  it("constructs correct URL with symbol param", async () => {
    mockFetchSuccess(mockRecommendations)

    await analystRecommendationsTool.handler(
      { symbol: "MSFT" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("finnhub.io")
    expect(url).toContain("stock/recommendation")
    expect(url).toContain("symbol=MSFT")
    expect(url).toContain("token=test-finnhub-key")
  })
})
