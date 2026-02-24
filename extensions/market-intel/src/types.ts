// ── Market Intelligence Extension Types ──

// ── Config ──

export interface MarketIntelConfig {
  readonly finnhubApiKey: string | null
  readonly finnhubBaseUrl: string
  readonly fredApiKey: string | null
  readonly fredBaseUrl: string
  readonly blsApiKey: string | null
  readonly blsBaseUrl: string
  readonly alphaVantageApiKey: string | null
  readonly alphaVantageBaseUrl: string
  readonly secEdgarBaseUrl: string
  readonly secEdgarUserAgent: string
}

export interface ToolContext {
  readonly config: MarketIntelConfig
}

export interface ToolResult<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
}

// ── Finnhub Types ──

export interface FinnhubNewsArticle {
  readonly category: string
  readonly datetime: number
  readonly headline: string
  readonly id: number
  readonly image: string
  readonly related: string
  readonly source: string
  readonly summary: string
  readonly url: string
}

export interface FinnhubFinancialStatement {
  readonly symbol: string
  readonly cik: string
  readonly data: ReadonlyArray<FinnhubFinancialReport>
}

export interface FinnhubFinancialReport {
  readonly accessNumber: string
  readonly symbol: string
  readonly cik: string
  readonly year: number
  readonly quarter: number
  readonly form: string
  readonly startDate: string
  readonly endDate: string
  readonly filedDate: string
  readonly report: Readonly<Record<string, ReadonlyArray<FinnhubReportItem>>>
}

export interface FinnhubReportItem {
  readonly label: string
  readonly value: number
  readonly unit: string
}

export interface FinnhubRecommendation {
  readonly buy: number
  readonly hold: number
  readonly period: string
  readonly sell: number
  readonly strongBuy: number
  readonly strongSell: number
  readonly symbol: string
}

// ── SEC EDGAR Types ──

export interface SecFiling {
  readonly accessionNumber: string
  readonly filingDate: string
  readonly reportDate: string
  readonly form: string
  readonly primaryDocument: string
  readonly primaryDocDescription: string
  readonly fileNumber: string
  readonly filmNumber: string
  readonly items: string
  readonly size: number
  readonly isXBRL: boolean
  readonly isInlineXBRL: boolean
}

export interface SecSubmission {
  readonly cik: string
  readonly entityType: string
  readonly sic: string
  readonly sicDescription: string
  readonly name: string
  readonly tickers: ReadonlyArray<string>
  readonly exchanges: ReadonlyArray<string>
  readonly filings: {
    readonly recent: {
      readonly accessionNumber: ReadonlyArray<string>
      readonly filingDate: ReadonlyArray<string>
      readonly reportDate: ReadonlyArray<string>
      readonly form: ReadonlyArray<string>
      readonly primaryDocument: ReadonlyArray<string>
      readonly primaryDocDescription: ReadonlyArray<string>
    }
  }
}

export interface SecSearchResult {
  readonly hits: {
    readonly total: {
      readonly value: number
    }
    readonly hits: ReadonlyArray<{
      readonly _source: {
        readonly file_date: string
        readonly display_date_filed: string
        readonly entity_name: string
        readonly file_num: string
        readonly file_type: string
        readonly file_description: string
      }
    }>
  }
}

// ── FRED Types ──

export interface FredSeriesObservation {
  readonly date: string
  readonly value: string
}

export interface FredSeriesInfo {
  readonly id: string
  readonly realtime_start: string
  readonly realtime_end: string
  readonly title: string
  readonly observation_start: string
  readonly observation_end: string
  readonly frequency: string
  readonly frequency_short: string
  readonly units: string
  readonly units_short: string
  readonly seasonal_adjustment: string
  readonly seasonal_adjustment_short: string
  readonly last_updated: string
  readonly notes: string
}

export interface FredSearchResult {
  readonly seriess: ReadonlyArray<FredSeriesInfo>
  readonly count: number
  readonly offset: number
  readonly limit: number
}

// ── BLS Types ──

export interface BlsDataPoint {
  readonly year: string
  readonly period: string
  readonly periodName: string
  readonly value: string
  readonly footnotes: ReadonlyArray<{
    readonly code: string
    readonly text: string
  }>
}

export interface BlsSeriesData {
  readonly seriesID: string
  readonly data: ReadonlyArray<BlsDataPoint>
}

export interface BlsRequestBody {
  readonly seriesid: ReadonlyArray<string>
  readonly startyear?: string
  readonly endyear?: string
  readonly registrationkey?: string
}

// ── Alpha Vantage Types ──

export interface AlphaVantageSentimentArticle {
  readonly title: string
  readonly url: string
  readonly time_published: string
  readonly authors: ReadonlyArray<string>
  readonly summary: string
  readonly source: string
  readonly overall_sentiment_score: number
  readonly overall_sentiment_label: string
  readonly ticker_sentiment: ReadonlyArray<{
    readonly ticker: string
    readonly relevance_score: string
    readonly ticker_sentiment_score: string
    readonly ticker_sentiment_label: string
  }>
}

export interface AlphaVantageSentimentResponse {
  readonly items: string
  readonly sentiment_score_definition: string
  readonly relevance_score_definition: string
  readonly feed: ReadonlyArray<AlphaVantageSentimentArticle>
}
