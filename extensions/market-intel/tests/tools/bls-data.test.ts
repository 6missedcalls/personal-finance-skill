import { describe, it, expect, vi, beforeEach } from "vitest"
import { blsDataTool } from "../../src/tools/bls-data.ts"
import {
  mockContext,
  mockFetchSuccess,
  mockFetchError,
  getLastFetchCall,
} from "../helpers.ts"

describe("intel_bls_data", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockBlsResponse = {
    status: "REQUEST_SUCCEEDED",
    responseTime: 123,
    message: [],
    Results: {
      series: [
        {
          seriesID: "CUUR0000SA0",
          data: [
            {
              year: "2024",
              period: "M11",
              periodName: "November",
              value: "317.683",
              footnotes: [{ code: "", text: "" }],
            },
            {
              year: "2024",
              period: "M10",
              periodName: "October",
              value: "316.615",
              footnotes: [{ code: "", text: "" }],
            },
          ],
        },
      ],
    },
  }

  it("returns BLS data on success", async () => {
    mockFetchSuccess(mockBlsResponse)

    const result = await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0"] },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data?.series).toHaveLength(1)
    expect(result.data?.series[0].seriesID).toBe("CUUR0000SA0")
    expect(result.data?.series[0].data).toHaveLength(2)
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal Server Error")

    const result = await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0"] },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to fetch BLS data")
    expect(result.error).toContain("500")
  })

  it("sends POST request with correct body", async () => {
    mockFetchSuccess(mockBlsResponse)

    await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0", "LNS14000000"], startYear: "2020", endYear: "2024" },
      mockContext
    )

    const { url, options } = getLastFetchCall()
    expect(url).toContain("api.bls.gov")
    expect(url).toContain("timeseries/data")
    expect(options.method).toBe("POST")

    const body = JSON.parse(options.body as string)
    expect(body.seriesid).toEqual(["CUUR0000SA0", "LNS14000000"])
    expect(body.startyear).toBe("2020")
    expect(body.endyear).toBe("2024")
    expect(body.registrationkey).toBe("test-bls-key")
  })

  it("includes registration key from config in request body", async () => {
    mockFetchSuccess(mockBlsResponse)

    await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0"] },
      mockContext
    )

    const { options } = getLastFetchCall()
    const body = JSON.parse(options.body as string)
    expect(body.registrationkey).toBe("test-bls-key")
  })

  it("omits registration key when BLS API key is null", async () => {
    mockFetchSuccess(mockBlsResponse)
    const nullKeyContext = {
      config: { ...mockContext.config, blsApiKey: null },
    }

    await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0"] },
      nullKeyContext
    )

    const { options } = getLastFetchCall()
    const body = JSON.parse(options.body as string)
    expect(body.registrationkey).toBeUndefined()
  })

  it("sends correct Content-Type header", async () => {
    mockFetchSuccess(mockBlsResponse)

    await blsDataTool.handler(
      { seriesIds: ["CUUR0000SA0"] },
      mockContext
    )

    const { options } = getLastFetchCall()
    const headers = options.headers as Record<string, string>
    expect(headers["Content-Type"]).toBe("application/json")
  })
})
