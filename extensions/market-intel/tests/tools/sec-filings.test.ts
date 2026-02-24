import { describe, it, expect, vi, beforeEach } from "vitest"
import { secFilingsTool } from "../../src/tools/sec-filings.ts"
import {
  mockContext,
  mockFetchError,
  mockFetchSequence,
  getFetchCall,
} from "../helpers.ts"

describe("intel_sec_filings", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockSearchResult = {
    hits: {
      hits: [
        {
          _id: "320193",
          _source: {
            entity_name: "Apple Inc.",
          },
        },
      ],
    },
  }

  const mockSubmission = {
    cik: "320193",
    entityType: "operating",
    sic: "3571",
    sicDescription: "Electronic Computers",
    name: "Apple Inc.",
    tickers: ["AAPL"],
    exchanges: ["Nasdaq"],
    filings: {
      recent: {
        accessionNumber: [
          "0000320193-24-000123",
          "0000320193-24-000100",
          "0000320193-23-000090",
        ],
        filingDate: ["2024-11-01", "2024-08-01", "2024-02-01"],
        reportDate: ["2024-09-30", "2024-06-30", "2023-12-31"],
        form: ["10-K", "10-Q", "10-Q"],
        primaryDocument: ["aapl-20240930.htm", "aapl-20240630.htm", "aapl-20231231.htm"],
        primaryDocDescription: [
          "10-K Annual Report",
          "10-Q Quarterly Report",
          "10-Q Quarterly Report",
        ],
      },
    },
  }

  it("returns SEC filings on success", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    const result = await secFilingsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.filings).toHaveLength(3)
    expect(result.data?.company).toBe("Apple Inc.")
    expect(result.data?.cik).toBe("320193")
  })

  it("returns error when no filings found for symbol", async () => {
    mockFetchSequence([
      { body: { hits: { hits: [] } } },
    ])

    const result = await secFilingsTool.handler(
      { symbol: "XYZFAKE" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("No SEC filings found for symbol: XYZFAKE")
  })

  it("returns error on API failure", async () => {
    mockFetchError(503, "Service Unavailable")

    const result = await secFilingsTool.handler(
      { symbol: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch SEC filings")
    expect(result.error).toContain("503")
  })

  it("filters by formType when provided", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    const result = await secFilingsTool.handler(
      { symbol: "AAPL", formType: "10-K" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.filings).toHaveLength(1)
    expect(result.data?.filings[0].form).toBe("10-K")
  })

  it("limits the number of filings returned", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    const result = await secFilingsTool.handler(
      { symbol: "AAPL", limit: 2 },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.filings).toHaveLength(2)
  })

  it("constructs search URL with correct params", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    await secFilingsTool.handler({ symbol: "AAPL" }, mockContext)

    const searchCall = getFetchCall(0)
    expect(searchCall.url).toContain("efts.sec.gov")
    expect(searchCall.url).toContain("search-index")
    expect(searchCall.url).toContain("q=%22AAPL%22")
  })

  it("pads CIK to 10 digits for data request", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    await secFilingsTool.handler({ symbol: "AAPL" }, mockContext)

    const dataCall = getFetchCall(1)
    expect(dataCall.url).toContain("CIK0000320193.json")
  })

  it("sends User-Agent header in requests", async () => {
    mockFetchSequence([
      { body: mockSearchResult },
      { body: mockSubmission },
    ])

    await secFilingsTool.handler({ symbol: "AAPL" }, mockContext)

    const searchCall = getFetchCall(0)
    const headers = searchCall.options.headers as Record<string, string>
    expect(headers["User-Agent"]).toBe("TestAgent/1.0 (test@example.com)")
  })
})
