# Market Intelligence Extension

| Field       | Value                                                                                  |
|-------------|----------------------------------------------------------------------------------------|
| id          | `market-intel`                                                                         |
| name        | Market Intelligence                                                                    |
| version     | 0.1.0                                                                                  |
| description | Company news, SEC filings, economic data, analyst recommendations, and news sentiment  |
| last-updated | 2026-02-23                                                                            |

---

## Overview

The `market-intel` extension provides ten tools for accessing financial market intelligence from five data providers: **Finnhub** (company/market news, fundamentals, analyst recommendations), **SEC EDGAR** (filings, full-text search), **FRED** (economic time series), **BLS** (labor/price statistics), and **Alpha Vantage** (news sentiment scoring).

All tools are read-only and return strict JSON payloads. Each provider has independent API key configuration -- partial setups are valid (e.g., SEC EDGAR needs no key). Tools check their specific key at runtime and return a descriptive error if unconfigured.

---

## Configuration

### Plugin Manifest (`openclaw.plugin.json`)

```json
{
  "id": "market-intel",
  "name": "Market Intelligence",
  "version": "0.1.0",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "finnhubApiKeyEnv": { "type": "string", "default": "FINNHUB_API_KEY" },
      "fredApiKeyEnv": { "type": "string", "default": "FRED_API_KEY" },
      "blsApiKeyEnv": { "type": "string", "default": "BLS_API_KEY" },
      "alphaVantageApiKeyEnv": { "type": "string", "default": "ALPHA_VANTAGE_API_KEY" },
      "secEdgarUserAgent": { "type": "string", "default": "PersonalFinanceSkill/1.0 (contact@example.com)" }
    }
  }
}
```

### Environment Variables

| Variable              | Provider       | Required | Notes                                    |
|-----------------------|----------------|----------|------------------------------------------|
| `FINNHUB_API_KEY`     | Finnhub        | Yes*     | Free tier: 60 calls/min                  |
| `FRED_API_KEY`        | FRED           | Yes*     | Free at api.stlouisfed.org               |
| `BLS_API_KEY`         | BLS            | Yes*     | v2 registration key                      |
| `ALPHA_VANTAGE_API_KEY` | Alpha Vantage | Yes*   | Free tier: 25 calls/day                  |

\* Each key is only required for that provider's tools. SEC EDGAR needs no API key (uses User-Agent header).

### Rate Limits

| Provider       | Rate Limit                        |
|----------------|-----------------------------------|
| Finnhub        | 60 calls/min (free tier)          |
| SEC EDGAR      | 10 requests/sec                   |
| FRED           | No published limit (be respectful)|
| BLS            | Reasonable use                    |
| Alpha Vantage  | 25 calls/day (free), 75/min (paid)|

---

## Tool Catalog

| #  | Tool Name                      | Provider       | Description                                                    | Risk Tier |
|----|--------------------------------|----------------|----------------------------------------------------------------|-----------|
| 1  | `intel_company_news`           | Finnhub        | Get recent news articles for a specific company by ticker      | READ-ONLY |
| 2  | `intel_market_news`            | Finnhub        | Get general market news by category                            | READ-ONLY |
| 3  | `intel_stock_fundamentals`     | Finnhub        | Get reported financial statements (10-K, 10-Q)                 | READ-ONLY |
| 4  | `intel_analyst_recommendations`| Finnhub        | Get analyst buy/hold/sell consensus                            | READ-ONLY |
| 5  | `intel_sec_filings`            | SEC EDGAR      | List SEC filings for a company by ticker                       | READ-ONLY |
| 6  | `intel_sec_search`             | SEC EDGAR      | Full-text search across SEC filings                            | READ-ONLY |
| 7  | `intel_fred_series`            | FRED           | Fetch economic time series data (GDP, CPI, rates, etc.)        | READ-ONLY |
| 8  | `intel_fred_search`            | FRED           | Search for FRED series by keyword                              | READ-ONLY |
| 9  | `intel_bls_data`               | BLS            | Fetch labor/price statistics time series                       | READ-ONLY |
| 10 | `intel_news_sentiment`         | Alpha Vantage  | Get news articles with AI-scored sentiment by ticker/topic     | READ-ONLY |

---

## Tool Details

### 1. `intel_company_news`

Get recent news articles for a specific company.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string", "description": "Stock ticker (e.g. AAPL)" },
    "from": { "type": "string", "description": "Start date YYYY-MM-DD (default: 7 days ago)" },
    "to": { "type": "string", "description": "End date YYYY-MM-DD (default: today)" },
    "limit": { "type": "number", "description": "Max articles (default: 20, max: 50)" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ articles: [...], symbol, dateRange: { from, to } }`

### 2. `intel_market_news`

Get general market news by category.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "category": { "type": "string", "enum": ["general", "forex", "crypto", "merger"] },
    "limit": { "type": "number", "description": "Max articles (default: 20, max: 50)" }
  }
}
```

**Output:** `{ articles: [...], category }`

### 3. `intel_stock_fundamentals`

Get reported financial statements (SEC filings).

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string" },
    "freq": { "type": "string", "enum": ["annual", "quarterly"] },
    "limit": { "type": "number" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ symbol, cik, data: [{ year, quarter, form, report: {...} }] }`

### 4. `intel_analyst_recommendations`

Get analyst buy/hold/sell consensus for a stock.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ recommendations: [{ buy, hold, sell, strongBuy, strongSell, period }], symbol }`

### 5. `intel_sec_filings`

List SEC filings for a company (resolves ticker to CIK automatically).

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string" },
    "formType": { "type": "string", "description": "Filter by form type (e.g. 10-K, 10-Q, 8-K)" },
    "limit": { "type": "number", "description": "Max filings (default: 20)" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ filings: [...], company, cik }`

### 6. `intel_sec_search`

Full-text search across all SEC filings.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "forms": { "type": "string", "description": "Comma-separated form types" },
    "dateFrom": { "type": "string" },
    "dateTo": { "type": "string" },
    "limit": { "type": "number" }
  },
  "required": ["query"]
}
```

**Output:** SEC EDGAR search results with entity names, filing dates, and descriptions.

### 7. `intel_fred_series`

Fetch economic time series observations from the Federal Reserve.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "seriesId": { "type": "string", "description": "FRED series ID (e.g. GDP, CPIAUCSL, DFF)" },
    "observationStart": { "type": "string", "description": "YYYY-MM-DD" },
    "observationEnd": { "type": "string", "description": "YYYY-MM-DD" },
    "frequency": { "type": "string", "enum": ["d", "w", "bw", "m", "q", "sa", "a"] },
    "limit": { "type": "number" }
  },
  "required": ["seriesId"]
}
```

**Output:** `{ seriesId, title, observations: [{ date, value }] }`

**Common FRED Series IDs:**
- `GDP` — Gross Domestic Product
- `CPIAUCSL` — Consumer Price Index
- `DFF` — Federal Funds Rate
- `UNRATE` — Unemployment Rate
- `DGS10` — 10-Year Treasury Rate
- `MORTGAGE30US` — 30-Year Mortgage Rate

### 8. `intel_fred_search`

Search for FRED series by keyword.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string" },
    "limit": { "type": "number" }
  },
  "required": ["query"]
}
```

**Output:** `{ seriess: [...], count, offset, limit }`

### 9. `intel_bls_data`

Fetch Bureau of Labor Statistics time series data.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "seriesIds": { "type": "array", "items": { "type": "string" } },
    "startYear": { "type": "string" },
    "endYear": { "type": "string" }
  },
  "required": ["seriesIds"]
}
```

**Output:** `{ series: [{ seriesID, data: [{ year, period, periodName, value }] }] }`

**Common BLS Series IDs:**
- `CES0000000001` — Total Nonfarm Payrolls
- `LNS14000000` — Unemployment Rate
- `CUUR0000SA0` — CPI-U All Items
- `CES0500000003` — Average Hourly Earnings

### 10. `intel_news_sentiment`

Get news articles with AI-scored sentiment analysis.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "tickers": { "type": "string", "description": "Comma-separated tickers" },
    "topics": { "type": "string", "description": "Topics: technology, finance, etc." },
    "timeFrom": { "type": "string", "description": "YYYYMMDDTHHMM format" },
    "timeTo": { "type": "string" },
    "limit": { "type": "number" }
  }
}
```

**Output:** Articles with per-ticker sentiment scores (-1 to 1) and labels (Bearish/Somewhat-Bearish/Neutral/Somewhat-Bullish/Bullish).

---

## Typical Workflows

### Company Research

```
intel_company_news(symbol: "AAPL", limit: 10)
  → intel_analyst_recommendations(symbol: "AAPL")
  → intel_stock_fundamentals(symbol: "AAPL", freq: "quarterly")
  → intel_sec_filings(symbol: "AAPL", formType: "10-K")
  → intel_news_sentiment(tickers: "AAPL")
```

### Economic Overview

```
intel_fred_series(seriesId: "GDP")
  → intel_fred_series(seriesId: "CPIAUCSL")
  → intel_fred_series(seriesId: "UNRATE")
  → intel_bls_data(seriesIds: ["CES0000000001"])
```

### SEC Filing Research

```
intel_sec_search(query: "artificial intelligence", forms: "10-K")
  → intel_sec_filings(symbol: "NVDA", formType: "10-K")
```
