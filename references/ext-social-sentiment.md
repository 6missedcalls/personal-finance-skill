# Social Sentiment Extension

| Field       | Value                                                                                  |
|-------------|----------------------------------------------------------------------------------------|
| id          | `social-sentiment`                                                                     |
| name        | Social Sentiment                                                                       |
| version     | 0.1.0                                                                                  |
| description | Social media sentiment monitoring for financial signals via StockTwits, X/Twitter, and Quiver Quantitative |
| last-updated | 2026-02-23                                                                            |

---

## Overview

The `social-sentiment` extension provides six tools for monitoring social media sentiment and alternative data signals relevant to financial markets. It integrates three providers: **StockTwits** (retail trader sentiment and trending symbols), **X/Twitter** (cashtag searches, user timelines, and keyword-based sentiment), and **Quiver Quantitative** (congressional trading activity).

All tools are read-only. StockTwits requires no API key. X API and Quiver require bearer tokens configured via environment variables. Tools check their specific key at runtime and return a descriptive error if unconfigured.

---

## Configuration

### Plugin Manifest (`openclaw.plugin.json`)

```json
{
  "id": "social-sentiment",
  "name": "Social Sentiment",
  "version": "0.1.0",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "xApiBearerTokenEnv": { "type": "string", "default": "X_API_BEARER_TOKEN" },
      "quiverApiKeyEnv": { "type": "string", "default": "QUIVER_API_KEY" }
    }
  }
}
```

### Environment Variables

| Variable              | Provider       | Required | Notes                                    |
|-----------------------|----------------|----------|------------------------------------------|
| `X_API_BEARER_TOKEN`  | X/Twitter      | Yes*     | OAuth 2.0 Bearer Token (developer.x.com) |
| `QUIVER_API_KEY`      | Quiver Quant   | Yes*     | API key from quiverquant.com              |

\* StockTwits tools work without any API key. X and Quiver keys are only required for their respective tools.

### Rate Limits

| Provider       | Rate Limit                                |
|----------------|-------------------------------------------|
| StockTwits     | Public API, reasonable use                |
| X/Twitter      | 300 tweets/15 min (Basic), 10K (Pro)      |
| Quiver Quant   | Varies by plan                            |

---

## Tool Catalog

| #  | Tool Name                      | Provider       | Description                                              | Risk Tier |
|----|--------------------------------|----------------|----------------------------------------------------------|-----------|
| 1  | `social_stocktwits_sentiment`  | StockTwits     | Get sentiment breakdown (bull/bear) for a stock symbol   | READ-ONLY |
| 2  | `social_stocktwits_trending`   | StockTwits     | Get currently trending symbols on StockTwits             | READ-ONLY |
| 3  | `social_x_search`              | X/Twitter      | Search recent tweets by keyword or query                 | READ-ONLY |
| 4  | `social_x_user_timeline`       | X/Twitter      | Get recent tweets from a specific user                   | READ-ONLY |
| 5  | `social_x_cashtag`             | X/Twitter      | Search cashtag ($AAPL) with keyword sentiment scoring    | READ-ONLY |
| 6  | `social_quiver_congress`       | Quiver Quant   | Get congressional stock trading disclosures              | READ-ONLY |

---

## Tool Details

### 1. `social_stocktwits_sentiment`

Get retail trader sentiment for a stock from StockTwits message stream.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string", "description": "Stock ticker (e.g. AAPL)" },
    "limit": { "type": "number", "description": "Max messages (default: 20)" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ symbol, sentiment: { bullish, bearish, total }, messages: [...], timestamp }`

The tool aggregates Bullish/Bearish tags from individual messages to produce a sentiment ratio.

### 2. `social_stocktwits_trending`

Get currently trending symbols on StockTwits.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "limit": { "type": "number", "description": "Max symbols (default: 20)" }
  }
}
```

**Output:** `{ symbols: [{ symbol, title, watchlist_count }] }`

### 3. `social_x_search`

Search recent tweets by keyword, hashtag, or complex query.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "query": { "type": "string", "description": "Search query (supports X search operators)" },
    "limit": { "type": "number", "description": "Max tweets (default: 10, max: 100)" },
    "startTime": { "type": "string", "description": "ISO 8601 start time" },
    "endTime": { "type": "string", "description": "ISO 8601 end time" }
  },
  "required": ["query"]
}
```

**Output:** `{ tweets: [...], resultCount }`

### 4. `social_x_user_timeline`

Get recent tweets from a specific X/Twitter user.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "userId": { "type": "string", "description": "X user ID (numeric)" },
    "limit": { "type": "number", "description": "Max tweets (default: 10, max: 100)" }
  },
  "required": ["userId"]
}
```

**Output:** `{ tweets: [...] }`

### 5. `social_x_cashtag`

Search tweets for a stock's cashtag ($AAPL) and score basic keyword sentiment.

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string", "description": "Stock ticker (e.g. AAPL)" },
    "limit": { "type": "number", "description": "Max tweets (default: 20)" }
  },
  "required": ["symbol"]
}
```

**Output:** `{ tweets: [...], symbol, sentimentSummary: { positive, negative, neutral } }`

Sentiment scoring uses keyword matching:
- **Positive:** bullish, buy, long, moon, calls, up, green, rocket, gains
- **Negative:** bearish, sell, short, puts, down, red, crash, dump, loss

### 6. `social_quiver_congress`

Get congressional stock trading disclosures (STOCK Act filings).

**Input Schema:**
```json
{
  "type": "object",
  "properties": {
    "symbol": { "type": "string", "description": "Filter by ticker (optional — omit for all)" },
    "limit": { "type": "number", "description": "Max trades (default: 50)" },
    "daysBack": { "type": "number", "description": "Filter trades within N days" }
  }
}
```

**Output:** `{ trades: [{ transaction_date, disclosure_date, representative, party, house, ticker, transaction_type, amount, asset_description }] }`

---

## Typical Workflows

### Stock Sentiment Overview

```
social_stocktwits_sentiment(symbol: "TSLA")
  → social_x_cashtag(symbol: "TSLA")
  → intel_news_sentiment(tickers: "TSLA")    [from market-intel]
  → Compare retail vs news sentiment
```

### Congressional Trading Signals

```
social_quiver_congress(daysBack: 30)
  → Filter for large purchases
  → intel_company_news(symbol: <top_ticker>)  [from market-intel]
  → alpaca_market_data(symbols: <top_ticker>) [from alpaca-trading]
```

### Trending Stock Research

```
social_stocktwits_trending(limit: 10)
  → For top symbols:
    social_stocktwits_sentiment(symbol)
    intel_analyst_recommendations(symbol)     [from market-intel]
```

---

## Data Freshness Notes

- StockTwits messages are real-time but reflect retail sentiment (may be noisy)
- X/Twitter search covers the last 7 days (Basic tier) or longer (Academic/Enterprise)
- Congressional trades have a 45-day disclosure delay by law
- Always cross-reference social signals with fundamental data before making financial decisions
