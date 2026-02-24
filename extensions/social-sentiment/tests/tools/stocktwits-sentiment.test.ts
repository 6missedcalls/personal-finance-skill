import { describe, it, expect, vi, beforeEach } from "vitest"
import { stocktwitsSentimentTool } from "../../src/tools/stocktwits-sentiment.ts"
import {
  mockConfig,
  mockContext,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("stocktwitsSentimentTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockMessages = [
    {
      id: 1001,
      body: "AAPL looking strong today!",
      created_at: "2024-06-15T10:30:00Z",
      user: { id: 100, username: "trader1", followers: 500 },
      entities: { sentiment: { basic: "Bullish" } },
      likes: { total: 12 },
    },
    {
      id: 1002,
      body: "Not feeling good about AAPL earnings",
      created_at: "2024-06-15T10:35:00Z",
      user: { id: 101, username: "trader2", followers: 200 },
      entities: { sentiment: { basic: "Bearish" } },
      likes: { total: 3 },
    },
    {
      id: 1003,
      body: "AAPL chart update",
      created_at: "2024-06-15T10:40:00Z",
      user: { id: 102, username: "trader3", followers: 1000 },
      entities: { sentiment: { basic: null } },
      likes: { total: 7 },
    },
    {
      id: 1004,
      body: "Going long AAPL calls!",
      created_at: "2024-06-15T10:45:00Z",
      user: { id: 103, username: "trader4", followers: 150 },
      entities: { sentiment: { basic: "Bullish" } },
      likes: { total: 20 },
    },
  ]

  it("returns sentiment data on success", async () => {
    mockFetchSuccess({ messages: mockMessages })

    const result = await stocktwitsSentimentTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.symbol).toBe("AAPL")
    expect(result.data?.messages).toEqual(mockMessages)
    expect(result.data?.timestamp).toBeDefined()
  })

  it("aggregates sentiment counts correctly", async () => {
    mockFetchSuccess({ messages: mockMessages })

    const result = await stocktwitsSentimentTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.data?.sentiment.bullish).toBe(2)
    expect(result.data?.sentiment.bearish).toBe(1)
    expect(result.data?.sentiment.total).toBe(4)
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal server error")

    const result = await stocktwitsSentimentTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve StockTwits sentiment")
    expect(result.error).toContain("500")
  })

  it("calls the correct StockTwits URL", async () => {
    mockFetchSuccess({ messages: [] })

    await stocktwitsSentimentTool.handler({ symbol: "TSLA" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("https://api.stocktwits.com/api/2")
    expect(url).toContain("/streams/symbol/TSLA.json")
  })

  it("passes limit parameter in the URL", async () => {
    mockFetchSuccess({ messages: [] })

    await stocktwitsSentimentTool.handler(
      { symbol: "AAPL", limit: 30 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=30")
  })

  it("defaults limit to 20 when not provided", async () => {
    mockFetchSuccess({ messages: [] })

    await stocktwitsSentimentTool.handler({ symbol: "AAPL" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("limit=20")
  })

  it("uppercases the symbol", async () => {
    mockFetchSuccess({ messages: [] })

    await stocktwitsSentimentTool.handler({ symbol: "aapl" }, mockContext)

    const { url } = getLastFetchCall()
    expect(url).toContain("/streams/symbol/AAPL.json")
  })

  it("handles empty messages array gracefully", async () => {
    mockFetchSuccess({ messages: [] })

    const result = await stocktwitsSentimentTool.handler(
      { symbol: "XYZ" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.sentiment).toEqual({ bullish: 0, bearish: 0, total: 0 })
    expect(result.data?.messages).toEqual([])
  })
})
