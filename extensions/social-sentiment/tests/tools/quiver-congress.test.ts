import { describe, it, expect, vi, beforeEach } from "vitest"
import { quiverCongressTool } from "../../src/tools/quiver-congress.ts"
import {
  mockContext,
  mockConfigNoQuiver,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("quiverCongressTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockTrades = [
    {
      transaction_date: "2024-06-10",
      disclosure_date: "2024-06-15",
      representative: "Nancy Pelosi",
      party: "Democrat",
      house: "House" as const,
      ticker: "AAPL",
      transaction_type: "Purchase" as const,
      amount: "$1,001 - $15,000",
      asset_description: "Apple Inc. - Common Stock",
    },
    {
      transaction_date: "2024-06-08",
      disclosure_date: "2024-06-14",
      representative: "Dan Crenshaw",
      party: "Republican",
      house: "House" as const,
      ticker: "AAPL",
      transaction_type: "Sale" as const,
      amount: "$15,001 - $50,000",
      asset_description: "Apple Inc. - Common Stock",
    },
    {
      transaction_date: "2024-05-01",
      disclosure_date: "2024-05-10",
      representative: "Tommy Tuberville",
      party: "Republican",
      house: "Senate" as const,
      ticker: "AAPL",
      transaction_type: "Purchase" as const,
      amount: "$1,001 - $15,000",
      asset_description: "Apple Inc. - Common Stock",
    },
  ]

  it("returns congressional trades on success", async () => {
    mockFetchSuccess(mockTrades)

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.trades).toEqual(mockTrades)
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal server error")

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve congressional trading data")
    expect(result.error).toContain("500")
  })

  it("returns error when Quiver API key is not configured", async () => {
    const result = await quiverCongressTool.handler(
      { symbol: "AAPL" },
      { config: mockConfigNoQuiver }
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("QUIVER_API_KEY not configured")
  })

  it("calls symbol-specific endpoint when symbol is provided", async () => {
    mockFetchSuccess([])

    await quiverCongressTool.handler({ symbol: "AAPL" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("https://api.quiverquant.com/beta/live")
    expect(url).toContain("/historical/congresstrading/AAPL")
  })

  it("calls general endpoint when no symbol is provided", async () => {
    mockFetchSuccess([])

    await quiverCongressTool.handler({}, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("/historical/congresstrading")
    expect(url).not.toContain("/historical/congresstrading/")
  })

  it("sends Authorization Bearer header with Quiver API key", async () => {
    mockFetchSuccess([])

    await quiverCongressTool.handler({ symbol: "AAPL" }, mockContext)

    const { options } = getLastFetchCall()
    const headers = options.headers as Record<string, string>
    expect(headers["Authorization"]).toBe("Bearer test-quiver-key")
  })

  it("limits results to specified limit", async () => {
    mockFetchSuccess(mockTrades)

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL", limit: 2 },
      mockContext
    )

    expect(result.data?.trades).toHaveLength(2)
  })

  it("defaults limit to 50", async () => {
    const manyTrades = Array.from({ length: 60 }, (_, i) => ({
      ...mockTrades[0],
      transaction_date: `2024-06-${String(10 - Math.floor(i / 30)).padStart(2, "0")}`,
      representative: `Rep ${i}`,
    }))

    mockFetchSuccess(manyTrades)

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.data?.trades).toHaveLength(50)
  })

  it("filters trades by daysBack when specified", async () => {
    // Use a date that is very recent for the first two, and old for the third
    const now = new Date()
    const recentDate = new Date(now)
    recentDate.setDate(recentDate.getDate() - 5)
    const oldDate = new Date(now)
    oldDate.setDate(oldDate.getDate() - 60)

    const tradesWithDates = [
      { ...mockTrades[0], transaction_date: recentDate.toISOString().slice(0, 10) },
      { ...mockTrades[1], transaction_date: recentDate.toISOString().slice(0, 10) },
      { ...mockTrades[2], transaction_date: oldDate.toISOString().slice(0, 10) },
    ]

    mockFetchSuccess(tradesWithDates)

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL", daysBack: 30 },
      mockContext
    )

    expect(result.data?.trades).toHaveLength(2)
  })

  it("returns all trades when daysBack is not specified", async () => {
    mockFetchSuccess(mockTrades)

    const result = await quiverCongressTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.data?.trades).toHaveLength(3)
  })

  it("uppercases the symbol in the URL", async () => {
    mockFetchSuccess([])

    await quiverCongressTool.handler({ symbol: "aapl" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("/historical/congresstrading/AAPL")
  })

  it("handles empty response gracefully", async () => {
    mockFetchSuccess([])

    const result = await quiverCongressTool.handler(
      { symbol: "XYZ" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.trades).toEqual([])
  })
})
