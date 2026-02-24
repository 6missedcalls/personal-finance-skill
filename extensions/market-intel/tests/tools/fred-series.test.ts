import { describe, it, expect, vi, beforeEach } from "vitest"
import { fredSeriesTool } from "../../src/tools/fred-series.ts"
import {
  mockContext,
  configWithNullKey,
  mockFetchSequence,
  mockFetchError,
  getFetchCall,
} from "../helpers.ts"

describe("intel_fred_series", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockObservations = {
    observations: [
      { date: "2024-01-01", value: "27956.0" },
      { date: "2024-04-01", value: "28261.6" },
    ],
  }

  const mockSeriesInfo = {
    seriess: [
      {
        id: "GDP",
        realtime_start: "2024-01-01",
        realtime_end: "2024-12-31",
        title: "Gross Domestic Product",
        observation_start: "1947-01-01",
        observation_end: "2024-07-01",
        frequency: "Quarterly",
        frequency_short: "Q",
        units: "Billions of Dollars",
        units_short: "Bil. of $",
        seasonal_adjustment: "Seasonally Adjusted Annual Rate",
        seasonal_adjustment_short: "SAAR",
        last_updated: "2024-11-27",
        notes: "GDP notes",
      },
    ],
  }

  it("returns FRED series data with title on success", async () => {
    mockFetchSequence([
      { body: mockObservations },
      { body: mockSeriesInfo },
    ])

    const result = await fredSeriesTool.handler(
      { seriesId: "GDP" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.seriesId).toBe("GDP")
    expect(result.data?.title).toBe("Gross Domestic Product")
    expect(result.data?.observations).toHaveLength(2)
  })

  it("returns error on API failure", async () => {
    mockFetchError(404, "Series not found")

    const result = await fredSeriesTool.handler(
      { seriesId: "INVALID" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch FRED series")
    expect(result.error).toContain("404")
  })

  it("returns error when FRED_API_KEY is not configured", async () => {
    const nullKeyContext = { config: configWithNullKey("fredApiKey") }

    const result = await fredSeriesTool.handler(
      { seriesId: "GDP" },
      nullKeyContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("FRED_API_KEY not configured")
  })

  it("constructs correct URL with series_id and api_key", async () => {
    mockFetchSequence([
      { body: mockObservations },
      { body: mockSeriesInfo },
    ])

    await fredSeriesTool.handler(
      { seriesId: "GDP" },
      mockContext
    )

    const obsCall = getFetchCall(0)
    expect(obsCall.url).toContain("api.stlouisfed.org")
    expect(obsCall.url).toContain("series/observations")
    expect(obsCall.url).toContain("series_id=GDP")
    expect(obsCall.url).toContain("api_key=test-fred-key")
    expect(obsCall.url).toContain("file_type=json")
  })

  it("passes optional params to observation request", async () => {
    mockFetchSequence([
      { body: mockObservations },
      { body: mockSeriesInfo },
    ])

    await fredSeriesTool.handler(
      {
        seriesId: "GDP",
        observationStart: "2024-01-01",
        observationEnd: "2024-12-31",
        frequency: "q",
        limit: 10,
      },
      mockContext
    )

    const obsCall = getFetchCall(0)
    expect(obsCall.url).toContain("observation_start=2024-01-01")
    expect(obsCall.url).toContain("observation_end=2024-12-31")
    expect(obsCall.url).toContain("frequency=q")
    expect(obsCall.url).toContain("limit=10")
  })

  it("uses seriesId as title when series info returns empty", async () => {
    mockFetchSequence([
      { body: mockObservations },
      { body: { seriess: [] } },
    ])

    const result = await fredSeriesTool.handler(
      { seriesId: "CUSTOM_ID" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.title).toBe("CUSTOM_ID")
  })
})
