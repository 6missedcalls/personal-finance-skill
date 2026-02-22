import type { AlpacaPortfolioHistory, ToolContext, ToolResult } from "../types.js"
import { alpacaRequest } from "../client.js"

interface PortfolioHistoryInput {
  readonly period?: string
  readonly timeframe?: string
  readonly date_end?: string
  readonly extended_hours?: boolean
}

export const portfolioHistoryTool = {
  name: "alpaca_portfolio_history",
  description: "Get historical portfolio equity and P/L over a specified period",
  input_schema: {
    type: "object",
    properties: {
      period: {
        type: "string",
        description: "Duration of the data in number + unit format (e.g. '1M', '3M', '1A', '5D'). Defaults to 1M if not specified.",
      },
      timeframe: {
        type: "string",
        description: "Aggregation timeframe for each bar (e.g. '1D', '1H', '15Min'). Required if period is longer than 7 days.",
      },
      date_end: {
        type: "string",
        description: "End date for the data range in YYYY-MM-DD format. Defaults to current date.",
      },
      extended_hours: {
        type: "boolean",
        description: "Include extended hours data in the results.",
      },
    },
    additionalProperties: false,
  },
  async handler(
    input: PortfolioHistoryInput,
    context: ToolContext
  ): Promise<ToolResult<AlpacaPortfolioHistory>> {
    try {
      const params: Record<string, string | undefined> = {
        period: input.period,
        timeframe: input.timeframe,
        date_end: input.date_end,
        extended_hours:
          input.extended_hours !== undefined
            ? String(input.extended_hours)
            : undefined,
      }

      const history = await alpacaRequest<AlpacaPortfolioHistory>(
        context.config,
        "/v2/account/portfolio/history",
        { params }
      )

      return {
        success: true,
        data: history,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to retrieve portfolio history: ${message}`,
      }
    }
  },
}
