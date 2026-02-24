import type {
  MarketIntelConfig,
  ToolResult,
  FredSeriesObservation,
  FredSeriesInfo,
} from "../types.js"
import { fredRequest } from "../clients/fred.js"

interface FredSeriesInput {
  readonly seriesId: string
  readonly observationStart?: string
  readonly observationEnd?: string
  readonly frequency?: string
  readonly limit?: number
}

interface FredSeriesOutput {
  readonly seriesId: string
  readonly title: string
  readonly observations: ReadonlyArray<FredSeriesObservation>
}

interface FredObservationsResponse {
  readonly observations: ReadonlyArray<FredSeriesObservation>
}

interface FredSeriesInfoResponse {
  readonly seriess: ReadonlyArray<FredSeriesInfo>
}

export const fredSeriesTool = {
  name: "intel_fred_series",
  description:
    "Get economic data series observations from FRED (Federal Reserve Economic Data). Supports GDP, CPI, unemployment, interest rates, and thousands of other series.",
  input_schema: {
    type: "object",
    properties: {
      seriesId: {
        type: "string",
        description:
          "FRED series ID (e.g. 'GDP', 'CPIAUCSL', 'UNRATE', 'DFF').",
      },
      observationStart: {
        type: "string",
        description:
          "Start date for observations in YYYY-MM-DD format.",
      },
      observationEnd: {
        type: "string",
        description:
          "End date for observations in YYYY-MM-DD format.",
      },
      frequency: {
        type: "string",
        description:
          "Data frequency (e.g. 'd' daily, 'w' weekly, 'm' monthly, 'q' quarterly, 'a' annual).",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of observations to return.",
      },
    },
    required: ["seriesId"],
    additionalProperties: false,
  },
  async handler(
    input: FredSeriesInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<FredSeriesOutput>> {
    try {
      const obsParams: Record<string, string | undefined> = {
        series_id: input.seriesId,
        observation_start: input.observationStart,
        observation_end: input.observationEnd,
        frequency: input.frequency,
        limit: input.limit !== undefined ? String(input.limit) : undefined,
      }

      const [obsResponse, infoResponse] = await Promise.all([
        fredRequest<FredObservationsResponse>(
          context.config,
          "/fred/series/observations",
          obsParams
        ),
        fredRequest<FredSeriesInfoResponse>(
          context.config,
          "/fred/series",
          { series_id: input.seriesId }
        ),
      ])

      const title =
        infoResponse.seriess.length > 0
          ? infoResponse.seriess[0].title
          : input.seriesId

      return {
        success: true,
        data: {
          seriesId: input.seriesId,
          title,
          observations: obsResponse.observations,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch FRED series: ${message}`,
      }
    }
  },
}
