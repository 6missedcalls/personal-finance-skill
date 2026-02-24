import type {
  MarketIntelConfig,
  ToolResult,
  SecFiling,
  SecSubmission,
} from "../types.js"
import { secEdgarSearchRequest, secEdgarDataRequest } from "../clients/sec-edgar.js"

interface SecFilingsInput {
  readonly symbol: string
  readonly formType?: string
  readonly limit?: number
}

interface SecFilingsOutput {
  readonly filings: ReadonlyArray<SecFiling>
  readonly company: string
  readonly cik: string
}

interface CompanySearchResponse {
  readonly hits: {
    readonly hits: ReadonlyArray<{
      readonly _source: {
        readonly entity_name: string
      }
      readonly _id: string
    }>
  }
}

function padCik(cik: string): string {
  return cik.padStart(10, "0")
}

function parseFilings(
  submission: SecSubmission,
  formType: string | undefined,
  limit: number
): ReadonlyArray<SecFiling> {
  const recent = submission.filings.recent
  const count = recent.accessionNumber.length
  const filings: Array<SecFiling> = []

  for (let i = 0; i < count && filings.length < limit; i++) {
    if (formType && recent.form[i] !== formType) {
      continue
    }
    filings.push({
      accessionNumber: recent.accessionNumber[i],
      filingDate: recent.filingDate[i],
      reportDate: recent.reportDate[i],
      form: recent.form[i],
      primaryDocument: recent.primaryDocument[i],
      primaryDocDescription: recent.primaryDocDescription[i],
      fileNumber: "",
      filmNumber: "",
      items: "",
      size: 0,
      isXBRL: false,
      isInlineXBRL: false,
    })
  }

  return filings
}

export const secFilingsTool = {
  name: "intel_sec_filings",
  description:
    "Get SEC EDGAR filings for a company by ticker symbol. Resolves ticker to CIK and fetches recent submissions.",
  input_schema: {
    type: "object",
    properties: {
      symbol: {
        type: "string",
        description: "Stock ticker symbol (e.g. 'AAPL', 'MSFT').",
      },
      formType: {
        type: "string",
        description:
          "Filter by form type (e.g. '10-K', '10-Q', '8-K'). Returns all types if not specified.",
      },
      limit: {
        type: "number",
        description:
          "Maximum number of filings to return. Defaults to 20.",
      },
    },
    required: ["symbol"],
    additionalProperties: false,
  },
  async handler(
    input: SecFilingsInput,
    context: { config: MarketIntelConfig }
  ): Promise<ToolResult<SecFilingsOutput>> {
    try {
      const limit = input.limit ?? 20

      const searchResult = await secEdgarSearchRequest<CompanySearchResponse>(
        context.config,
        "/search-index",
        { q: `"${input.symbol}"`, forms: "10-K" }
      )

      if (
        !searchResult.hits ||
        !searchResult.hits.hits ||
        searchResult.hits.hits.length === 0
      ) {
        return {
          success: false,
          error: `No SEC filings found for symbol: ${input.symbol}`,
        }
      }

      const cik = searchResult.hits.hits[0]._id.replace(/^0+/, "")
      const companyName = searchResult.hits.hits[0]._source.entity_name
      const paddedCik = padCik(cik)

      const submission = await secEdgarDataRequest<SecSubmission>(
        context.config,
        `/submissions/CIK${paddedCik}.json`
      )

      const filings = parseFilings(submission, input.formType, limit)

      return {
        success: true,
        data: {
          filings,
          company: companyName,
          cik,
        },
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return {
        success: false,
        error: `Failed to fetch SEC filings: ${message}`,
      }
    }
  },
}
