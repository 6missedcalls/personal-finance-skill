import type {
  MarketIntelConfig,
  ToolResult,
  SecSearchResult,
} from "../types.js"
import { secEdgarSearchRequest } from "../clients/sec-edgar.js"

interface SecSearchInput {
  readonly query: string
  readonly forms?: string
  readonly dateFrom?: string
  readonly dateTo?: string
  readonly limit?: number
}

export const secSearchTool = {
  name: "intel_sec_search",
  description:
    "Full-text search across SEC EDGAR filings. Search by keyword, company name, or filing content.",
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "Search query text (e.g. 'artificial intelligence', 'revenue growth').",
      },
      forms: {
        type: "string",
        description:
          "Comma-separated form types to filter (e.g. '10-K,10-Q,8-K').",
      },
      dateFrom: {
        type: "string",
        description:
          "Start date for filing date filter in YYYY-MM-DD format.",
      },
      dateTo: {
        type: "string",
        description:
          "End date for filing date filter in YYYY-MM-DD format.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of results. Defaults to 20.",
      },
    },
    required: ["query"],
    additionalProperties: false,
  },
  async handler(
    input: SecSearchInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<SecSearchResult>> {
    try {
      const limit = input.limit ?? 20

      const params: Record<string, string | undefined> = {
        q: input.query,
        forms: input.forms,
        dateRange: buildDateRange(input.dateFrom, input.dateTo),
        from: "0",
        size: String(limit),
      }

      const result = await secEdgarSearchRequest<SecSearchResult>(
        context.config,
        "/search-index",
        params
      )

      return {
        success: true,
        data: result,
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to search SEC filings: ${message}`,
      }
    }
  },
}

function buildDateRange(
  dateFrom: string | undefined,
  dateTo: string | undefined
): string | undefined {
  if (!dateFrom && !dateTo) {
    return undefined
  }

  const from = dateFrom ?? ""
  const to = dateTo ?? ""
  return `custom&startdt=${from}&enddt=${to}`
}
