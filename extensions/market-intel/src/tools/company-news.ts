import type {
  MarketIntelConfig,
  ToolResult,
  FinnhubNewsArticle,
} from "../types.js"
import { finnhubRequest } from "../clients/finnhub.js"

interface CompanyNewsInput {
  readonly symbol: string
  readonly from?: string
  readonly to?: string
  readonly limit?: number
}

interface CompanyNewsOutput {
  readonly articles: ReadonlyArray<FinnhubNewsArticle>
  readonly symbol: string
  readonly dateRange: {
    readonly from: string
    readonly to: string
  }
}

function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function defaultFromDate(): string {
  const date = new Date()
  date.setDate(date.getDate() - 7)
  return formatDate(date)
}

function defaultToDate(): string {
  return formatDate(new Date())
}

export const companyNewsTool = {
  name: "intel_company_news",
  description:
    "Get recent news articles for a specific company from Finnhub. Returns headlines, summaries, sources, and URLs.",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Stock ticker symbol (e.g. 'AAPL', 'MSFT').",
      },
      from: {
        type: "string",
        description:
          "Start date in YYYY-MM-DD format. Defaults to 7 days ago.",
      },
      to: {
        type: "string",
        description: "End date in YYYY-MM-DD format. Defaults to today.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of articles to return. Defaults to 20, max 50.",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: CompanyNewsInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<CompanyNewsOutput>> {
    try {
      const from = input.from ?? defaultFromDate()
      const to = input.to ?? defaultToDate()
      const limit = Math.min(input.limit ?? 20, 50)

      const articles = await finnhubRequest<ReadonlyArray<FinnhubNewsArticle>>(
        context.config,
        "/api/v1/company-news",
        { symbol: input.symbol, from, to }
      )

      return {
        success: true,
        data: {
          articles: articles.slice(0, limit),
          symbol: input.symbol,
          dateRange: { from, to },
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch company news: ${message}`,
      }
    }
  },
}
