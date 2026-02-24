import type {
  MarketIntelConfig,
  ToolResult,
  BlsSeriesData,
} from "../types.js"
import { blsRequest } from "../clients/bls.js"

interface BlsDataInput {
  readonly seriesIds: ReadonlyArray<string>
  readonly startYear?: string
  readonly endYear?: string
}

interface BlsApiResponse {
  readonly status: string
  readonly responseTime: number
  readonly message: ReadonlyArray<string>
  readonly Results: {
    readonly series: ReadonlyArray<BlsSeriesData>
  }
}

interface BlsDataOutput {
  readonly series: ReadonlyArray<BlsSeriesData>
}

export const blsDataTool = {
  name: "intel_bls_data",
  description:
    "Get time series data from the Bureau of Labor Statistics (BLS). Supports CPI, employment, wages, and other labor statistics.",
  input_schema: {
    type: "object",
    properties: {
      seriesIds: {
        type: "array",
        items: { type: "string" },
        description:
          "Array of BLS series IDs (e.g. ['CUUR0000SA0'] for CPI-U, ['LNS14000000'] for unemployment rate).",
      },
      startYear: {
        type: "string",
        description: "Start year (e.g. '2020').",
      },
      endYear: {
        type: "string",
        description: "End year (e.g. '2024').",
      },
    },
    required: ["seriesIds"],
    additionalProperties: false,
  },
  async handler(
    input: BlsDataInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<BlsDataOutput>> {
    try {
      const body = {
        seriesid: [...input.seriesIds],
        startyear: input.startYear,
        endyear: input.endYear,
      }

      const response = await blsRequest<BlsApiResponse>(
        context.config,
        body
      )

      return {
        success: true,
        data: {
          series: response.Results.series,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch BLS data: ${message}`,
      }
    }
  },
}
