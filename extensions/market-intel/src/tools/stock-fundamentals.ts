import type {
  MarketIntelConfig,
  ToolResult,
  FinnhubFinancialStatement,
} from "../types.js"
import { finnhubRequest } from "../clients/finnhub.js"

type ReportFrequency = "annual" | "quarterly"

interface StockFundamentalsInput {
  readonly symbol: string
  readonly freq?: ReportFrequency
  readonly limit?: number
}

export const stockFundamentalsTool = {
  name: "intel_stock_fundamentals",
  description:
    "Get reported financial statements (income, balance sheet, cash flow) for a company from Finnhub SEC filings.",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Stock ticker symbol (e.g. 'AAPL', 'MSFT').",
      },
      freq: {
        type: "string",
        enum: ["annual", "quarterly"],
        description:
          "Report frequency. Defaults to 'annual'.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of reports to return.",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: StockFundamentalsInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<FinnhubFinancialStatement>> {
    try {
      const params: Record<string, string | undefined> = {
        symbol: input.symbol,
        freq: input.freq,
      }

      const statement = await finnhubRequest<FinnhubFinancialStatement>(
        context.config,
        "/api/v1/stock/financials-reported",
        params
      )

      if (input.limit !== undefined && statement.data) {
        return {
          success: true,
          data: {
            ...statement,
            data: statement.data.slice(0, input.limit),
          },
        }
      }

      return {
        success: true,
        data: statement,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch stock fundamentals: ${message}`,
      }
    }
  },
}
