import { describe, it, expect, vi, beforeEach } from "vitest"
import { secSearchTool } from "../../src/tools/sec-search.ts"
import {
  mockContext,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_sec_search", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockSearchResult = {
    hits: {
      total: { value: 42 },
      hits: [
        {
          _source: {
            file_date: "2024-11-01",
            display_date_filed: "2024-11-01",
            entity_name: "Apple Inc.",
            file_num: "001-36743",
            file_type: "10-K",
            file_description: "Annual Report",
          },
        },
        {
          _source: {
            file_date: "2024-08-01",
            display_date_filed: "2024-08-01",
            entity_name: "Apple Inc.",
            file_num: "001-36743",
            file_type: "10-Q",
            file_description: "Quarterly Report",
          },
        },
      ],
    },
  }

  it("returns search results on success", async () => {
    mockFetchSuccess(mockSearchResult)

    const result = await secSearchTool.handler(
      { query: "artificial intelligence" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.hits.total.value).toBe(42)
    expect(result.data?.hits.hits).toHaveLength(2)
  })

  it("returns error on API failure", async () => {
    mockFetchError(400, "Bad Request")

    const result = await secSearchTool.handler(
      { query: "test" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to search SEC filings")
    expect(result.error).toContain("400")
  })

  it("constructs correct URL with query param", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "revenue growth" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("efts.sec.gov")
    expect(url).toContain("search-index")
    expect(url).toContain("q=revenue+growth")
  })

  it("includes forms filter when provided", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "earnings", forms: "10-K,10-Q" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("forms=10-K%2C10-Q")
  })

  it("includes date range when dateFrom and dateTo are provided", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "earnings", dateFrom: "2024-01-01", dateTo: "2024-12-31" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("dateRange=")
    expect(url).toContain("2024-01-01")
    expect(url).toContain("2024-12-31")
  })

  it("defaults limit to 20", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "test" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("size=20")
  })

  it("uses custom limit", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "test", limit: 5 },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("size=5")
  })

  it("sends User-Agent header", async () => {
    mockFetchSuccess(mockSearchResult)

    await secSearchTool.handler(
      { query: "test" },
      mockContext
    )

    const { options } = getLastFetchCall()
    const headers = options.headers as Record<string, string>
    expect(headers["User-Agent"]).toBe("TestAgent/1.0 (test@example.com)")
  })
})
