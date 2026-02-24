import { describe, it, expect, vi, beforeEach } from "vitest"
import { fredSearchTool } from "../../src/tools/fred-search.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_fred_search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockSearchResult = {
    seriess: [
      {
        id: "CPIAUCSL",
        realtime_start: "2024-01-01",
        realtime_end: "2024-12-31",
        title: "Consumer Price Index for All Urban Consumers",
        observation_start: "1947-01-01",
        observation_end: "2024-10-01",
        frequency: "Monthly",
        frequency_short: "M",
        units: "Index 1982-1984=100",
        units_short: "Index",
        seasonal_adjustment: "Seasonally Adjusted",
        seasonal_adjustment_short: "SA",
        last_updated: "2024-11-12",
        notes: "CPI notes",
      },
    ],
    count: 150,
    offset: 0,
    limit: 20,
  }

  it("returns FRED search results on success", async () => {
    mockFetchSuccess(mockSearchResult)

    const result = await fredSearchTool.handler(
      { query: "consumer price index" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.seriess).toHaveLength(1)
    expect(result.data?.count).toBe(150)
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal Server Error")

    const result = await fredSearchTool.handler(
      { query: "test" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to search FRED series")
    expect(result.error).toContain("500")
  })

  it("returns error when FRED_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("fredApiKey") }

    const result = await fredSearchTool.handler(
      { query: "GDP" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("FRED_API_KEY not configured")
  })

  it("constructs correct URL with search_text and api_key", async () => {
    mockFetchSuccess(mockSearchResult)

    await fredSearchTool.handler(
      { query: "unemployment rate" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("api.stlouisfed.org")
    expect(url).toContain("series/search")
    expect(url).toContain("search_text=unemployment+rate")
    expect(url).toContain("api_key=test-fred-key")
    expect(url).toContain("file_type=json")
  })

  it("defaults limit to 20", async () => {
    mockFetchSuccess(mockSearchResult)

    await fredSearchTool.handler(
      { query: "test" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=20")
  })

  it("uses custom limit", async () => {
    mockFetchSuccess(mockSearchResult)

    await fredSearchTool.handler(
      { query: "test", limit: 5 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=5")
  })
})
