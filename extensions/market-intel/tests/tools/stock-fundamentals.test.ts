import { describe, it, expect, vi, beforeEach } from "vitest"
import { stockFundamentalsTool } from "../../src/tools/stock-fundamentals.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_stock_fundamentals", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockStatement = {
    symbol: "AAPL",
    cik: "0000320193",
    data: [
      {
        accessNumber: "0000320193-24-000001",
        symbol: "AAPL",
        cik: "0000320193",
        year: 2024,
        quarter: 0,
        form: "10-K",
        startDate: "2023-10-01",
        endDate: "2024-09-30",
        filedDate: "2024-11-01",
        report: {
          bs: [
            { label: "Total Assets", value: 352583000000, unit: "USD" },
          ],
          ic: [
            { label: "Revenue", value: 391035000000, unit: "USD" },
          ],
        },
      },
      {
        accessNumber: "0000320193-23-000001",
        symbol: "AAPL",
        cik: "0000320193",
        year: 2023,
        quarter: 0,
        form: "10-K",
        startDate: "2022-10-01",
        endDate: "2023-09-30",
        filedDate: "2023-11-01",
        report: {
          bs: [
            { label: "Total Assets", value: 352755000000, unit: "USD" },
          ],
        },
      },
    ],
  }

  it("returns financial statements on success", async () => {
    mockFetchSuccess(mockStatement)

    const result = await stockFundamentalsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.symbol).toBe("AAPL")
    expect(result.data?.data).toHaveLength(2)
  })

  it("returns error on API failure", async () => {
    mockFetchError(403, "Forbidden")

    const result = await stockFundamentalsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch stock fundamentals")
    expect(result.error).toContain("403")
  })

  it("returns error when FINNHUB_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("finnhubApiKey") }

    const result = await stockFundamentalsTool.handler(
      { symbol: "AAPL" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("FINNHUB_API_KEY not configured")
  })

  it("constructs correct URL with symbol and freq params", async () => {
    mockFetchSuccess(mockStatement)

    await stockFundamentalsTool.handler(
      { symbol: "AAPL", freq: "quarterly" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("finnhub.io")
    expect(url).toContain("financials-reported")
    expect(url).toContain("symbol=AAPL")
    expect(url).toContain("freq=quarterly")
    expect(url).toContain("token=test-finnhub-key")
  })

  it("slices data array when limit is provided", async () => {
    mockFetchSuccess(mockStatement)

    const result = await stockFundamentalsTool.handler(
      { symbol: "AAPL", limit: 1 },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.data).toHaveLength(1)
  })

  it("does not include freq in URL when not provided", async () => {
    mockFetchSuccess(mockStatement)

    await stockFundamentalsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).not.toContain("freq=")
  })
})
