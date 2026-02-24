import { describe, it, expect, vi, beforeEach } from "vitest"
import { stocktwitsTrendingTool } from "../../src/tools/stocktwits-trending.ts"
import {
  mockContext,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("stocktwitsTrendingTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockSymbols = [
    { symbol: "AAPL", title: "Apple Inc.", watchlist_count: 250000 },
    { symbol: "TSLA", title: "Tesla, Inc.", watchlist_count: 300000 },
    { symbol: "NVDA", title: "NVIDIA Corporation", watchlist_count: 180000 },
  ]

  it("returns trending symbols on success", async () => {
    mockFetchSuccess({ symbols: mockSymbols })

    const result = await stocktwitsTrendingTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data?.symbols).toEqual(mockSymbols)
  })

  it("returns error on API failure", async () => {
    mockFetchError(503, "Service unavailable")

    const result = await stocktwitsTrendingTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve StockTwits trending symbols")
    expect(result.error).toContain("503")
  })

  it("calls the correct StockTwits trending URL", async () => {
    mockFetchSuccess({ symbols: [] })

    await stocktwitsTrendingTool.handler({}, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("https://api.stocktwits.com/api/2")
    expect(url).toContain("/trending/symbols.json")
  })

  it("passes custom limit parameter", async () => {
    mockFetchSuccess({ symbols: [] })

    await stocktwitsTrendingTool.handler({ limit: 10 }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=10")
  })

  it("defaults limit to 20 when not provided", async () => {
    mockFetchSuccess({ symbols: [] })

    await stocktwitsTrendingTool.handler({}, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=20")
  })

  it("handles empty symbols array gracefully", async () => {
    mockFetchSuccess({ symbols: [] })

    const result = await stocktwitsTrendingTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data?.symbols).toEqual([])
  })
})
