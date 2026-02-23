# IBKR Portfolio Extension

| Field | Value |
|-------|-------|
| **ID** | `ibkr-portfolio` |
| **Name** | IBKR Portfolio |
| **Version** | 0.1.0 |
| **Description** | Interactive Brokers Client Portal API integration for portfolio positions, allocation, performance, market data, and order monitoring. |
| **Last Updated** | 2026-02-23 |

---

## Overview

The `ibkr-portfolio` extension connects to the Interactive Brokers Client Portal Gateway (CPAPI) to provide read-only access to brokerage account data. It exposes nine tools covering session management, portfolio positions, allocation analysis, performance reporting, contract search, real-time market data snapshots, and live order monitoring.

All tools are **read-only** or **low-risk** (session keepalive). The extension does not place, modify, or cancel orders. It communicates with a locally running IBKR Client Portal Gateway over HTTPS and requires an authenticated session established outside the extension (via the gateway's browser-based 2FA login flow).

---

## Configuration

Defined in `openclaw.plugin.json` under `configSchema`:

```json
{
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "baseUrl": {
      "type": "string",
      "description": "IBKR Client Portal Gateway base URL (e.g. https://localhost:5000/v1/api)"
    },
    "baseUrlEnv": {
      "type": "string",
      "description": "Environment variable name holding the gateway base URL"
    },
    "defaultAccountId": {
      "type": "string",
      "description": "Default IBKR account ID to use when not specified per-call"
    }
  }
}
```

### Resolution Order

The gateway base URL resolves in this order:

1. `baseUrl` from plugin config (explicit value)
2. `baseUrlEnv` environment variable name from plugin config
3. `IBKR_BASE_URL` environment variable (fallback)
4. `IBKR_GATEWAY_URL` environment variable (fallback)
5. `https://localhost:5000/v1/api` (default)

The default account ID resolves from:

1. `defaultAccountId` from plugin config
2. `IBKR_ACCOUNT_ID` environment variable

---

## Tool Catalog

| # | Tool Name | Description | Risk Tier |
|---|-----------|-------------|-----------|
| 1 | `ibkr_auth_status` | Check gateway authentication and session status | READ-ONLY |
| 2 | `ibkr_tickle` | Keep session alive to prevent idle timeout | LOW |
| 3 | `ibkr_list_accounts` | List brokerage accounts and initialize context | READ-ONLY |
| 4 | `ibkr_get_positions` | Get paginated portfolio positions for an account | READ-ONLY |
| 5 | `ibkr_portfolio_allocation` | Get allocation breakdown by asset class, sector, group | READ-ONLY |
| 6 | `ibkr_portfolio_performance` | Get NAV, cumulative returns, and periodized returns | READ-ONLY |
| 7 | `ibkr_search_contracts` | Search tradable contracts by symbol or name | READ-ONLY |
| 8 | `ibkr_market_snapshot` | Get real-time market data for contracts | READ-ONLY |
| 9 | `ibkr_get_orders` | Get live and recent orders for the session | READ-ONLY |

---

## Tool Details

### 1. ibkr_auth_status

Check IBKR Client Portal Gateway authentication and session status. Use this before other IBKR calls to verify the session is active.

**API Endpoint:** `POST /iserver/auth/status`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |

**Output Schema: `AuthStatus`**

```typescript
{
  authenticated: boolean   // Whether the session is authenticated with IBKR
  connected: boolean       // Whether the gateway is connected to IBKR servers
  competing: boolean       // Whether another session is competing for this login
  message: string          // Status message from the gateway
  MAC: string              // Machine address code
  serverInfo: {
    serverName: string     // Gateway server name
    serverVersion: string  // Gateway server version
  }
}
```

**Error Codes:**
- `IBKR_401` -- Session not authenticated; re-authenticate via gateway browser login
- `IBKR_UNKNOWN` -- Unexpected error

---

### 2. ibkr_tickle

Keep the IBKR Client Portal Gateway session alive. Call this at approximately 1-minute intervals to prevent idle timeout (5-6 minutes without traffic).

**API Endpoint:** `POST /tickle`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |

**Output Schema: `TickleResponse`**

```typescript
{
  session: string          // Session identifier
  ssoExpires: number       // SSO expiration timestamp
  collission: boolean      // Whether a session collision was detected
  userId: number           // IBKR numeric user ID
  iserver: {
    authStatus: {
      authenticated: boolean
      competing: boolean
      connected: boolean
    }
  }
}
```

---

### 3. ibkr_list_accounts

List all tradable IBKR accounts for the active session. **Must be called before portfolio or order endpoints** to initialize account context on the gateway.

**API Endpoint:** `GET /iserver/accounts`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |

**Output Schema: `AccountsResponse`**

```typescript
{
  accounts: string[]                    // List of account IDs (e.g. ["U1234567"])
  aliases: Record<string, string>       // Map of account ID to alias/display name
  selectedAccount: string               // Currently selected account ID
}
```

---

### 4. ibkr_get_positions

Get portfolio positions for an IBKR account. Returns paginated results -- use `pageId` to fetch subsequent pages. Call `ibkr_list_accounts` first to initialize account context.

**API Endpoints:**
- `GET /portfolio/accounts` (context initialization)
- `GET /portfolio/{accountId}/positions/{pageId}`

**Input Schema:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `userId` | `string` | Yes | -- | User identifier for the finance skill session |
| `accountId` | `string` | Yes | Falls back to `defaultAccountId` | IBKR account ID (e.g. `U1234567`) |
| `pageId` | `number` | No | `0` | Page number for pagination (0-indexed) |

**Output Schema:**

```typescript
{
  positions: Position[]   // Array of position objects (see below)
  pageId: number          // Current page number
  hasMore: boolean        // Whether more pages are available
}
```

**Position object:**

```typescript
{
  acctId: string            // Account ID
  conid: number             // Contract ID
  contractDesc: string      // Contract description
  position: number          // Position quantity
  mktPrice: number          // Current market price
  mktValue: number          // Current market value
  avgCost: number           // Average cost basis
  avgPrice: number          // Average purchase price
  realizedPnl: number       // Realized profit/loss
  unrealizedPnl: number     // Unrealized profit/loss
  currency: string          // Position currency
  assetClass: string        // Asset class (STK, OPT, FUT, etc.)
  ticker: string            // Ticker symbol
  listingExchange: string   // Listing exchange
  sector: string            // Sector classification
  group: string             // Industry group
  countryCode: string       // Country code
  expiry: string            // Expiration date (derivatives)
  putOrCall: string         // Put or Call (options)
  strike: number            // Strike price (options)
  multiplier: number        // Contract multiplier
  hasOptions: boolean       // Whether options are available for this contract
}
```

**Error Codes:**
- `IBKR_MISSING_ACCOUNT` -- No `accountId` provided and no default configured

---

### 5. ibkr_portfolio_allocation

Get asset allocation breakdown for an IBKR account by asset class, sector, and industry group. Useful for drift analysis and rebalancing checks.

**API Endpoints:**
- `GET /portfolio/accounts` (context initialization)
- `GET /portfolio/{accountId}/allocation`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |
| `accountId` | `string` | Yes | IBKR account ID (e.g. `U1234567`). Falls back to `defaultAccountId`. |

**Output Schema: `AllocationBreakdown`**

```typescript
{
  assetClass: Record<string, number>  // Allocation % by asset class (e.g. {"STK": 0.65, "BOND": 0.20})
  sector: Record<string, number>      // Allocation % by sector (e.g. {"Technology": 0.30})
  group: Record<string, number>       // Allocation % by industry group
}
```

**Error Codes:**
- `IBKR_MISSING_ACCOUNT` -- No `accountId` provided and no default configured

---

### 6. ibkr_portfolio_performance

Get Portfolio Analyst performance data including NAV time series, cumulative returns, and periodized returns. Supports querying multiple accounts simultaneously.

**API Endpoint:** `POST /pa/performance`

**Input Schema:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `userId` | `string` | Yes | -- | User identifier for the finance skill session |
| `accountIds` | `string[]` | Yes | -- | IBKR account IDs to include in performance analysis |
| `freq` | `string` | No | `"M"` | Frequency: `"D"` (daily), `"W"` (weekly), `"M"` (monthly), `"Q"` (quarterly) |

**Output Schema: `PerformanceSeries`**

```typescript
{
  dates: string[]                               // Array of date strings for the series
  freq: string                                  // Frequency used (D, W, M, Q)
  baseCurrency: string                          // Base currency for calculations
  nav: Record<string, number[]>                 // NAV time series keyed by account ID
  cps: Record<string, number[]>                 // Cumulative performance series by account ID
  tpps: Record<string, number[]>                // Periodized (time-weighted) returns by account ID
}
```

**Error Codes:**
- `IBKR_MISSING_ACCOUNT` -- Empty `accountIds` array

---

### 7. ibkr_search_contracts

Search for tradable contracts (stocks, options, futures, etc.) by symbol or name. Returns contract IDs (`conid`) needed for `ibkr_market_snapshot` and order placement.

**API Endpoint:** `GET /iserver/secdef/search`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |
| `symbol` | `string` | Yes | Ticker symbol to search for (e.g. `AAPL`, `MSFT`) |
| `name` | `string` | No | Company name to refine results |
| `secType` | `string` | No | Security type filter: `STK`, `OPT`, `FUT`, `FOP`, `WAR`, `CFD`, `BOND` |

**Output Schema: `ContractSearchResult[]`**

```typescript
{
  conid: number               // Contract ID (use this for market data and orders)
  companyHeader: string       // Display header (symbol - exchange)
  companyName: string         // Full company name
  symbol: string              // Ticker symbol
  description: string         // Contract description
  restricted: string          // Restriction status
  fop: string                 // Futures options flag
  opt: string                 // Options flag
  war: string                 // Warrants flag
  sections: Array<{
    secType: string           // Security type (STK, OPT, FUT, etc.)
    months: string            // Available contract months
    symbol: string            // Section symbol
    exchange: string          // Exchange
    legSecType: string        // Leg security type (for combos)
  }>
}
```

---

### 8. ibkr_market_snapshot

Get real-time market data snapshot for one or more contracts. Requires contract IDs (`conid`) obtained from `ibkr_search_contracts`. Returns last price, bid, ask, volume, and other requested fields.

**API Endpoint:** `GET /iserver/marketdata/snapshot`

**Input Schema:**

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `userId` | `string` | Yes | -- | User identifier for the finance skill session |
| `conids` | `number[]` | Yes | -- | Contract IDs to get market data for (max 100) |
| `fields` | `string[]` | No | Core price fields (see below) | Market data field IDs to request (max 50) |

**Default fields** when `fields` is omitted: `31` (last), `84` (bid), `86` (ask), `87` (volume), `82` (change), `83` (change%), `70` (high), `71` (low), `55` (symbol), `6509` (availability).

**Output Schema: `MarketSnapshot[]`**

```typescript
{
  conid: number               // Contract ID
  conidEx: string             // Extended contract ID
  _updated: number            // Timestamp of last update (epoch ms)
  [fieldId: string]: value    // Requested field values keyed by field ID string
}
```

**Error Codes:**
- `IBKR_MISSING_CONIDS` -- Empty `conids` array
- `IBKR_TOO_MANY_CONIDS` -- More than 100 conids in a single request

---

### 9. ibkr_get_orders

List recent and open orders for the active IBKR session. Returns order status, fills, and details. Call `ibkr_list_accounts` first to set account context.

**API Endpoint:** `GET /iserver/account/orders`

**Input Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | `string` | Yes | User identifier for the finance skill session |
| `accountId` | `string` | No | IBKR account ID to filter orders for. If omitted, returns orders for all accounts in the session. |

**Output Schema: `OrdersResponse`**

```typescript
{
  orders: Order[]       // Array of order objects
  snapshot: boolean     // Whether this is a snapshot (true) or live feed
}
```

**Order object:**

```typescript
{
  acct: string                // Account ID
  conid: number               // Contract ID
  conidex: string             // Extended contract ID
  orderId: number             // IBKR order ID
  cashCcy: string             // Cash currency
  sizeAndFills: string        // Display string for size and fills
  orderDesc: string           // Order description
  description1: string        // Primary description
  ticker: string              // Ticker symbol
  secType: string             // Security type
  listingExchange: string     // Listing exchange
  remainingQuantity: number   // Quantity still open
  filledQuantity: number      // Quantity filled
  totalSize: number           // Total order size
  avgPrice: number            // Average fill price
  lastFillPrice: number       // Price of last fill
  side: string                // Order side (BUY, SELL)
  orderType: string           // Order type (MKT, LMT, STP, etc.)
  timeInForce: string         // Time in force (DAY, GTC, IOC, etc.)
  status: string              // Order status (Submitted, Filled, Cancelled, etc.)
  bgColor: string             // UI background color hint
  fgColor: string             // UI foreground color hint
}
```

---

## Session Management

The IBKR Client Portal Gateway requires an active authenticated session before any API calls succeed. The extension does not handle authentication itself -- the gateway must be running and logged in via its browser-based 2FA flow.

### Authentication Flow

```
1. Start IBKR Client Portal Gateway locally
2. Complete 2FA login via the gateway's browser interface
3. Extension connects to the gateway's HTTPS endpoint
```

### Session Lifecycle

```
ibkr_auth_status  -->  Verify session is authenticated and connected
       |
       v
ibkr_list_accounts  -->  Initialize account context (REQUIRED before portfolio/order calls)
       |
       v
ibkr_tickle (every ~60s)  -->  Prevent idle timeout
       |
       v
[Portfolio / Market Data / Orders tools]
```

### Key Session Rules

- **Idle timeout:** The gateway disconnects after 5-6 minutes without any traffic. Call `ibkr_tickle` at approximately 1-minute intervals to keep the session alive.
- **Session duration:** Sessions can persist up to 24 hours, but daily IBKR maintenance windows may force disconnects.
- **Competing sessions:** Only one Client Portal Gateway session can be active per IBKR username. If `competing` is `true` in `ibkr_auth_status`, another session has taken over the login.
- **Re-authentication:** When `authenticated` becomes `false`, re-authenticate via the gateway's browser login. The extension cannot perform 2FA programmatically.

---

## Market Data Fields

Common field IDs for use with `ibkr_market_snapshot`:

| Field ID | Constant | Description |
|----------|----------|-------------|
| `31` | `LAST_PRICE` | Last traded price |
| `84` | `BID` | Current bid price |
| `86` | `ASK` | Current ask price |
| `87` | `VOLUME` | Trading volume |
| `70` | `HIGH` | Session high |
| `71` | `LOW` | Session low |
| `82` | `CHANGE` | Price change |
| `83` | `CHANGE_PCT` | Price change percentage |
| `55` | `SYMBOL` | Ticker symbol |
| `7051` | `COMPANY_NAME` | Company name |
| `7289` | `MARKET_CAP` | Market capitalization |
| `7290` | `PE_RATIO` | Price-to-earnings ratio |
| `7291` | `EPS` | Earnings per share |
| `7293` | `DIVIDEND_YIELD` | Dividend yield |
| `7295` | `OPEN` | Session open price |
| `7296` | `CLOSE` | Previous close price |
| `6509` | `AVAILABILITY` | Data availability code |

These constants are exported from `src/types.ts` as `MARKET_DATA_FIELDS` for programmatic use.

---

## Usage Notes

### Call Order Dependencies

Several tools require specific initialization before they can be used:

1. **Always call `ibkr_auth_status` first** to confirm the gateway session is authenticated and connected.
2. **Call `ibkr_list_accounts` before any portfolio or order tools.** The IBKR gateway requires an account context to be initialized via this endpoint. Failing to do so will cause subsequent portfolio calls to return errors.
3. **Call `ibkr_search_contracts` before `ibkr_market_snapshot`.** Market snapshots require numeric contract IDs (`conid`), which are obtained from contract search results.

### Recommended Call Sequence

```
ibkr_auth_status
  --> ibkr_list_accounts
    --> ibkr_get_positions / ibkr_portfolio_allocation / ibkr_portfolio_performance / ibkr_get_orders
    --> ibkr_search_contracts --> ibkr_market_snapshot
  --> ibkr_tickle (repeat every ~60s)
```

### Pagination

`ibkr_get_positions` returns paginated results:
- Pass `pageId: 0` (default) for the first page.
- If `hasMore` is `true` in the response, increment `pageId` and call again.
- Continue until `hasMore` is `false` or the positions array is empty.

### Market Data Limits

- Maximum **100 contract IDs** per `ibkr_market_snapshot` request.
- Maximum **50 field IDs** per request.
- The first snapshot request for a contract may return stale or partial data. A second request typically returns current values.

### Account ID Resolution

Tools that accept `accountId` resolve it in this order:
1. Explicit `accountId` in the tool input
2. `defaultAccountId` from the extension configuration
3. If neither is available, the tool returns an `IBKR_MISSING_ACCOUNT` error

### Tool Response Envelope

All tools return responses in a standard envelope:

**Success:**
```typescript
{
  success: true,
  data: <T>,                // Tool-specific response data
  dataFreshness: string     // ISO 8601 timestamp of when the data was fetched
}
```

**Error:**
```typescript
{
  success: false,
  error: string,            // Human-readable error message
  code: string              // Machine-readable error code (e.g. IBKR_401, IBKR_MISSING_ACCOUNT)
}
```

### Error Code Reference

| Code | Meaning |
|------|---------|
| `IBKR_401` | Gateway session not authenticated |
| `IBKR_403` | Forbidden -- insufficient permissions |
| `IBKR_404` | Resource not found |
| `IBKR_429` | Rate limited by gateway |
| `IBKR_500` | Gateway internal error |
| `IBKR_MISSING_ACCOUNT` | No account ID provided and no default configured |
| `IBKR_MISSING_CONIDS` | Empty conids array for market snapshot |
| `IBKR_TOO_MANY_CONIDS` | Exceeded 100 conid limit per snapshot request |
| `IBKR_UNKNOWN` | Unexpected or unclassified error |

---

## Cross-References

- **[api-ibkr-client-portal.md](./api-ibkr-client-portal.md)** -- Full IBKR Client Portal Web API reference covering all endpoints, authentication flows, order placement, and scanner APIs
- **[api-openclaw-extension-patterns.md](./api-openclaw-extension-patterns.md)** -- OpenClaw extension structure, plugin manifest schema, and tool registration patterns
- **[api-openclaw-framework.md](./api-openclaw-framework.md)** -- OpenClaw framework architecture and plugin lifecycle

---

## Source Files

| Path | Purpose |
|------|---------|
| `extensions/ibkr-portfolio/openclaw.plugin.json` | Plugin manifest and config schema |
| `extensions/ibkr-portfolio/src/index.ts` | Tool registration and exports |
| `extensions/ibkr-portfolio/src/config.ts` | Configuration loader, HTTP client, error handling |
| `extensions/ibkr-portfolio/src/types.ts` | TypeScript interfaces for all inputs, outputs, and API types |
| `extensions/ibkr-portfolio/src/tools/auth-status.ts` | `ibkr_auth_status` tool |
| `extensions/ibkr-portfolio/src/tools/tickle.ts` | `ibkr_tickle` tool |
| `extensions/ibkr-portfolio/src/tools/list-accounts.ts` | `ibkr_list_accounts` tool |
| `extensions/ibkr-portfolio/src/tools/get-positions.ts` | `ibkr_get_positions` tool |
| `extensions/ibkr-portfolio/src/tools/portfolio-allocation.ts` | `ibkr_portfolio_allocation` tool |
| `extensions/ibkr-portfolio/src/tools/portfolio-performance.ts` | `ibkr_portfolio_performance` tool |
| `extensions/ibkr-portfolio/src/tools/search-contracts.ts` | `ibkr_search_contracts` tool |
| `extensions/ibkr-portfolio/src/tools/market-snapshot.ts` | `ibkr_market_snapshot` tool |
| `extensions/ibkr-portfolio/src/tools/get-orders.ts` | `ibkr_get_orders` tool |
