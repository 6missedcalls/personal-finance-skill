# Alpaca Trading Extension

| Field       | Value                                                                                  |
|-------------|----------------------------------------------------------------------------------------|
| id          | `alpaca-trading`                                                                       |
| name        | Alpaca Trading                                                                         |
| version     | 1.0.0                                                                                  |
| description | Alpaca brokerage integration for account management, trading, positions, and market data |
| last-updated | 2026-02-23                                                                            |

---

## Overview

The `alpaca-trading` extension connects the Personal Finance Skill to Alpaca's brokerage platform. It exposes ten tools that cover the full trading lifecycle: account inspection, position monitoring, order management, portfolio history, asset discovery, market data retrieval, and market clock queries.

All tools return strict JSON payloads. Read-only tools can be called freely. The single write tool (`alpaca_create_order`) is gated by configurable safety limits and MUST be preceded by a `finance_policy_check` call. Paper and live environments are selectable per-call, allowing safe iteration before committing real capital.

---

## Configuration

### Plugin Manifest (`openclaw.plugin.json`)

```json
{
  "id": "alpaca-trading",
  "name": "Alpaca Trading",
  "version": "1.0.0",
  "description": "Alpaca brokerage integration for account management, trading, positions, and market data",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "apiKeyEnv": {
        "type": "string",
        "description": "Name of env var holding Alpaca API key"
      },
      "apiSecretEnv": {
        "type": "string",
        "description": "Name of env var holding Alpaca API secret"
      },
      "env": {
        "type": "string",
        "enum": ["paper", "live"],
        "description": "Trading environment: paper for simulated trading, live for real money"
      },
      "maxOrderQty": {
        "type": "number",
        "description": "Maximum single order quantity safety limit"
      },
      "maxOrderNotional": {
        "type": "number",
        "description": "Maximum single order notional value safety limit"
      }
    },
    "required": ["apiKeyEnv", "apiSecretEnv", "env"]
  }
}
```

### Environment Variables

| Variable              | Purpose                    | Required |
|-----------------------|----------------------------|----------|
| `ALPACA_API_KEY`      | Alpaca API key             | Yes      |
| `ALPACA_API_SECRET`   | Alpaca API secret          | Yes      |

The `apiKeyEnv` and `apiSecretEnv` config fields hold the **names** of environment variables (not the secrets themselves). This follows the OpenClaw secrets-indirection pattern -- the plugin reads the env var at runtime, so secrets never appear in config files or manifests.

### Safety Limits

| Config Field       | Type   | Description                                            |
|--------------------|--------|--------------------------------------------------------|
| `maxOrderQty`      | number | Maximum number of shares/units in a single order       |
| `maxOrderNotional` | number | Maximum dollar value of a single order                 |

Both limits are validated inside `alpaca_create_order` before the order reaches the Alpaca API. If either limit is exceeded, the tool returns an error payload without submitting the order.

---

## Tool Catalog

| #  | Tool Name                | Description                                                      | Risk Tier |
|----|--------------------------|------------------------------------------------------------------|-----------|
| 1  | `alpaca_get_account`     | Get account details including balances, buying power, and status | READ-ONLY |
| 2  | `alpaca_list_positions`  | List all open positions in the trading account                   | READ-ONLY |
| 3  | `alpaca_get_position`    | Get details for a single position by symbol or asset ID          | READ-ONLY |
| 4  | `alpaca_list_orders`     | List orders with optional status, date, and symbol filters       | READ-ONLY |
| 5  | `alpaca_create_order`    | Submit a buy or sell order with safety checks                    | HIGH      |
| 6  | `alpaca_cancel_order`    | Cancel a pending order by order ID                               | MEDIUM    |
| 7  | `alpaca_portfolio_history` | Get historical portfolio equity and P/L over a period          | READ-ONLY |
| 8  | `alpaca_get_assets`      | Search for tradable assets by status, class, or exchange         | READ-ONLY |
| 9  | `alpaca_market_data`     | Get market data snapshots, bars, or quotes for symbols           | READ-ONLY |
| 10 | `alpaca_clock`           | Get current market clock: open/closed status, next open/close    | READ-ONLY |

---

## Tool Details

### 1. `alpaca_get_account`

Get Alpaca trading account details including balances, buying power, and status.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field | Type                | Required | Description                              |
|-------|---------------------|----------|------------------------------------------|
| `env` | `"paper" \| "live"` | No       | Override the default trading environment  |

**Output Schema: `AlpacaAccount`**

```typescript
{
  id: string
  account_number: string
  status: string
  currency: string
  cash: string
  portfolio_value: string
  buying_power: string
  equity: string
  last_equity: string
  long_market_value: string
  short_market_value: string
  initial_margin: string
  maintenance_margin: string
  daytrade_count: number
  pattern_day_trader: boolean
  trading_blocked: boolean
  transfers_blocked: boolean
  account_blocked: boolean
  daytrading_buying_power: string
  regt_buying_power: string
}
```

---

### 2. `alpaca_list_positions`

List all open positions in the trading account.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field | Type                | Required | Description                              |
|-------|---------------------|----------|------------------------------------------|
| `env` | `"paper" \| "live"` | No       | Override the default trading environment  |

**Output Schema: `AlpacaPosition[]`**

```typescript
{
  asset_id: string
  symbol: string
  exchange: string
  asset_class: string
  avg_entry_price: string
  qty: string
  qty_available: string
  side: string
  market_value: string
  cost_basis: string
  unrealized_pl: string
  unrealized_plpc: string
  unrealized_intraday_pl: string
  unrealized_intraday_plpc: string
  current_price: string
  lastday_price: string
  change_today: string
}
```

---

### 3. `alpaca_get_position`

Get details for a single position by symbol or asset ID.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field              | Type                | Required | Description                              |
|--------------------|---------------------|----------|------------------------------------------|
| `symbolOrAssetId`  | `string`            | Yes      | Ticker symbol (e.g. "AAPL") or asset UUID |
| `env`              | `"paper" \| "live"` | No       | Override the default trading environment  |

**Output Schema:** `AlpacaPosition` (same structure as `alpaca_list_positions` element)

---

### 4. `alpaca_list_orders`

List orders with optional filters for status, limit, direction, and date range.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field       | Type                            | Required | Description                                       |
|-------------|---------------------------------|----------|---------------------------------------------------|
| `status`    | `"open" \| "closed" \| "all"`   | No       | Filter by order status (default: `"open"`)        |
| `limit`     | `number`                        | No       | Max orders to return (max 500)                    |
| `after`     | `string`                        | No       | Return orders after this timestamp (RFC-3339 or YYYY-MM-DD) |
| `until`     | `string`                        | No       | Return orders before this timestamp               |
| `direction` | `"asc" \| "desc"`               | No       | Sort direction by submission time                 |
| `symbols`   | `string`                        | No       | Comma-separated list of symbols to filter         |

**Output Schema: `AlpacaOrder[]`**

```typescript
{
  id: string
  client_order_id: string
  created_at: string
  updated_at: string
  submitted_at: string
  filled_at: string | null
  expired_at: string | null
  canceled_at: string | null
  failed_at: string | null
  replaced_at: string | null
  asset_id: string
  symbol: string
  asset_class: string
  notional: string | null
  qty: string | null
  filled_qty: string
  filled_avg_price: string | null
  order_class: string
  order_type: string
  type: string
  side: string
  time_in_force: string
  limit_price: string | null
  stop_price: string | null
  status: string
  extended_hours: boolean
  trail_percent: string | null
  trail_price: string | null
  hwm: string | null
}
```

---

### 5. `alpaca_create_order`

Submit a buy or sell order with safety checks. Supports market, limit, stop, stop_limit, and trailing_stop order types, as well as bracket, OCO, and OTO advanced order classes.

**Risk Tier:** HIGH -- executes real trades

**Pre-requisite:** MUST call `finance_policy_check` before invoking this tool. The policy check validates the proposed trade against user-defined guardrails and returns an approval decision.

**Input Schema:**

| Field            | Type                                                                    | Required | Description                                           |
|------------------|-------------------------------------------------------------------------|----------|-------------------------------------------------------|
| `symbol`         | `string`                                                                | Yes      | Ticker symbol (e.g. "AAPL")                          |
| `side`           | `"buy" \| "sell"`                                                       | Yes      | Order side                                            |
| `type`           | `"market" \| "limit" \| "stop" \| "stop_limit" \| "trailing_stop"`      | Yes      | Order type                                            |
| `time_in_force`  | `"day" \| "gtc" \| "opg" \| "cls" \| "ioc" \| "fok"`                   | Yes      | Time-in-force instruction                             |
| `qty`            | `string`                                                                | No*      | Number of shares/units to trade                       |
| `notional`       | `string`                                                                | No*      | Dollar amount to trade (fractional shares)            |
| `limit_price`    | `string`                                                                | No       | Required for `limit` and `stop_limit` types           |
| `stop_price`     | `string`                                                                | No       | Required for `stop` and `stop_limit` types            |
| `trail_price`    | `string`                                                                | No       | Trailing amount in dollars (for `trailing_stop`)      |
| `trail_percent`  | `string`                                                                | No       | Trailing amount in percent (for `trailing_stop`)      |
| `extended_hours` | `boolean`                                                               | No       | Allow execution during extended hours                 |
| `client_order_id`| `string`                                                                | No       | Client-specified order ID for idempotency             |
| `order_class`    | `"simple" \| "bracket" \| "oco" \| "oto"`                               | No       | Advanced order class (default: `"simple"`)            |
| `take_profit`    | `{ limit_price: string }`                                               | No       | Take-profit leg (for `bracket` or `oto`)              |
| `stop_loss`      | `{ stop_price: string, limit_price?: string }`                          | No       | Stop-loss leg (for `bracket` or `oto`)                |

*Either `qty` or `notional` is required, but not both.

**Output Schema:** `AlpacaOrder` (same structure as `alpaca_list_orders` element)

**Safety Checks (enforced before submission):**
1. `qty` is validated against `maxOrderQty` from plugin config
2. Estimated notional value is validated against `maxOrderNotional` from plugin config
3. If either limit is exceeded, the tool returns an error and does NOT submit the order

---

### 6. `alpaca_cancel_order`

Cancel a pending order by order ID.

**Risk Tier:** MEDIUM -- cancels pending orders

**Input Schema:**

| Field     | Type     | Required | Description                |
|-----------|----------|----------|----------------------------|
| `orderId` | `string` | Yes      | The Alpaca order ID to cancel |

**Output Schema:**

```typescript
{
  canceled: boolean
}
```

---

### 7. `alpaca_portfolio_history`

Get historical portfolio equity and P/L over a specified period.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field            | Type      | Required | Description                                                    |
|------------------|-----------|----------|----------------------------------------------------------------|
| `period`         | `string`  | No       | Time period (e.g. `"1D"`, `"5D"`, `"1M"`, `"3M"`, `"1A"`)    |
| `timeframe`      | `string`  | No       | Resolution (e.g. `"1Min"`, `"5Min"`, `"15Min"`, `"1H"`, `"1D"`) |
| `date_end`       | `string`  | No       | End date in YYYY-MM-DD format                                  |
| `extended_hours` | `boolean` | No       | Include extended-hours data                                    |

**Output Schema: `AlpacaPortfolioHistory`**

```typescript
{
  timestamp: number[]
  equity: number[]
  profit_loss: number[]
  profit_loss_pct: number[]
  base_value: number
  timeframe: string
}
```

---

### 8. `alpaca_get_assets`

Search for tradable assets by status, asset class, or exchange.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field         | Type     | Required | Description                                              |
|---------------|----------|----------|----------------------------------------------------------|
| `status`      | `string` | No       | `"active"` or `"inactive"`                               |
| `asset_class` | `string` | No       | Asset class filter (e.g. `"us_equity"`, `"crypto"`)      |
| `exchange`    | `string` | No       | Exchange filter (e.g. `"NYSE"`, `"NASDAQ"`, `"AMEX"`)    |

**Output Schema: `AlpacaAsset[]`**

```typescript
{
  id: string
  class: string
  exchange: string
  symbol: string
  name: string
  status: string
  tradable: boolean
  marginable: boolean
  shortable: boolean
  easy_to_borrow: boolean
  fractionable: boolean
}
```

---

### 9. `alpaca_market_data`

Get market data snapshots, bars, or quotes for one or more symbols.

**Risk Tier:** READ-ONLY

**Input Schema:**

| Field       | Type       | Required | Description                                                   |
|-------------|------------|----------|---------------------------------------------------------------|
| `symbols`   | `string[]` | Yes      | Array of ticker symbols (max 100)                             |
| `type`      | `string`   | Yes      | Data type: `"snapshot"`, `"bars"`, or `"quotes"`              |
| `timeframe` | `string`   | No       | Bar timeframe (e.g. `"1Min"`, `"1Hour"`, `"1Day"`) -- required for `"bars"` |
| `start`     | `string`   | No       | Start timestamp (RFC-3339 or YYYY-MM-DD)                      |
| `end`       | `string`   | No       | End timestamp                                                 |
| `limit`     | `number`   | No       | Max number of data points per symbol                          |

**Output Schema (varies by type):**

For `"snapshot"`, each symbol includes:
```typescript
{
  latestTrade: { price: number, size: number, timestamp: string }
  latestQuote: { askPrice: number, askSize: number, bidPrice: number, bidSize: number, timestamp: string }
  minuteBar: { open: number, high: number, low: number, close: number, volume: number, timestamp: string }
  dailyBar: { open: number, high: number, low: number, close: number, volume: number, timestamp: string }
  prevDailyBar: { open: number, high: number, low: number, close: number, volume: number, timestamp: string }
}
```

For `"bars"`, each symbol returns an array of:
```typescript
{
  timestamp: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  trade_count: number
  vwap: number
}
```

For `"quotes"`, each symbol returns an array of:
```typescript
{
  timestamp: string
  ask_price: number
  ask_size: number
  bid_price: number
  bid_size: number
}
```

---

### 10. `alpaca_clock`

Get current market clock showing whether the market is open and when it next opens or closes.

**Risk Tier:** READ-ONLY

**Input Schema:** None (no parameters)

**Output Schema: `AlpacaClock`**

```typescript
{
  timestamp: string
  is_open: boolean
  next_open: string
  next_close: string
}
```

---

## Order Types

### Simple Order Types

| Type             | Required Fields                        | Description                                                                 |
|------------------|----------------------------------------|-----------------------------------------------------------------------------|
| `market`         | `symbol`, `side`, `qty`/`notional`, `time_in_force` | Executes immediately at best available price                      |
| `limit`          | + `limit_price`                        | Executes at `limit_price` or better                                         |
| `stop`           | + `stop_price`                         | Becomes a market order when `stop_price` is reached                         |
| `stop_limit`     | + `stop_price`, `limit_price`          | Becomes a limit order when `stop_price` is reached                          |
| `trailing_stop`  | + `trail_price` or `trail_percent`     | Stop price trails the market by a fixed amount or percentage                |

### Advanced Order Classes

| Class     | Description                                                                                     |
|-----------|-------------------------------------------------------------------------------------------------|
| `simple`  | Default. A single standalone order.                                                             |
| `bracket` | Entry order with attached take-profit (limit) and stop-loss legs. Both legs are submitted together. When one leg fills, the other is automatically canceled. Requires `take_profit` and `stop_loss`. |
| `oco`     | One-Cancels-Other. Two orders where filling or canceling one automatically cancels the other. Requires `take_profit` and `stop_loss`. |
| `oto`     | One-Triggers-Other. A primary order that, when filled, triggers submission of a secondary order. Requires `stop_loss` (and optionally `take_profit`). |

### Bracket Order Example

```json
{
  "symbol": "AAPL",
  "side": "buy",
  "type": "market",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "bracket",
  "take_profit": {
    "limit_price": "205.00"
  },
  "stop_loss": {
    "stop_price": "190.00",
    "limit_price": "189.50"
  }
}
```

### OTO Order Example

```json
{
  "symbol": "SPY",
  "side": "buy",
  "type": "market",
  "qty": "100",
  "time_in_force": "gtc",
  "order_class": "oto",
  "stop_loss": {
    "stop_price": "299.00",
    "limit_price": "298.50"
  }
}
```

### Time-in-Force Options

| Value | Name                   | Description                                                  |
|-------|------------------------|--------------------------------------------------------------|
| `day` | Day                    | Order expires at end of current trading day                  |
| `gtc` | Good-Til-Canceled      | Order remains active until filled or explicitly canceled     |
| `opg` | At-the-Open            | Executes at market open or is canceled                       |
| `cls` | At-the-Close           | Executes at market close or is canceled                      |
| `ioc` | Immediate-or-Cancel    | Fills immediately (partially or fully) then cancels remainder |
| `fok` | Fill-or-Kill           | Fills entirely immediately or is canceled completely          |

---

## Order Lifecycle

The full lifecycle for placing a trade through this extension follows a strict sequence:

```
1. Check Market Status
   alpaca_clock
   --> Confirm is_open=true or plan for next_open

2. Validate the Proposed Trade
   finance_policy_check (from finance-core extension)
   --> Validates against user policy, approval tiers, and guardrails
   --> Returns allowed=true/false with reasonCodes

3. Submit the Order
   alpaca_create_order
   --> Internal safety checks: maxOrderQty, maxOrderNotional
   --> Sends order to Alpaca API
   --> Returns order with status (typically "accepted" or "new")

4. Monitor Order Status
   alpaca_list_orders (status="open")
   --> Poll for status changes: new -> partially_filled -> filled
   --> Or: new -> canceled / expired / rejected

5. Cancel if Needed
   alpaca_cancel_order
   --> Cancel any pending order by orderId
   --> Returns { canceled: true }
```

### Order Status Flow

```
accepted -> new -> partially_filled -> filled
                -> canceled
                -> expired
                -> rejected
                -> replaced (if order was modified)
```

---

## Safety Limits

### Configurable Guards

| Guard              | Config Field       | Enforcement Point         | Behavior on Violation               |
|--------------------|--------------------|---------------------------|--------------------------------------|
| Max order quantity | `maxOrderQty`      | `alpaca_create_order`     | Returns error, order NOT submitted   |
| Max order notional | `maxOrderNotional` | `alpaca_create_order`     | Returns error, order NOT submitted   |

### Paper vs Live Trading

| Environment | Config Value | Use Case                                         | Risk Level |
|-------------|-------------|--------------------------------------------------|------------|
| Paper       | `"paper"`   | Simulated trading for testing and validation      | Low        |
| Live        | `"live"`    | Real money trades on the brokerage account        | High       |

The `env` field in the plugin config sets the default environment. Individual tool calls can override with the `env` input parameter (where supported). Always validate strategies in paper mode before switching to live.

### Policy Check Requirement

The `alpaca_create_order` tool MUST be preceded by a `finance_policy_check` call (from the `finance-core` extension). This policy check evaluates:

- Whether the trade action is allowed for the user
- Required approval tier (`"none"`, `"user"`, `"advisor"`)
- Reason codes explaining any restrictions

If the policy check returns `allowed: false`, the agent must NOT call `alpaca_create_order`.

---

## Usage Notes

### Common Patterns

**Portfolio overview:** Call `alpaca_get_account` for balances and buying power, then `alpaca_list_positions` for current holdings. Combine with `alpaca_portfolio_history` for trend context.

**Pre-trade validation:** Call `alpaca_clock` to confirm market hours, then `alpaca_market_data` (type `"snapshot"`) for current pricing, then `finance_policy_check`, then `alpaca_create_order`.

**Order monitoring:** After submitting an order, use `alpaca_list_orders` with `status="open"` and filter by `symbols` to track fill progress.

**Asset discovery:** Use `alpaca_get_assets` to check whether a symbol is tradable, fractionable, or shortable before building an order.

**Historical analysis:** Use `alpaca_portfolio_history` with `period="1A"` and `timeframe="1D"` for a one-year daily equity curve. Use `alpaca_market_data` with `type="bars"` for individual symbol price history.

### Error Handling

All tools return structured error payloads when the Alpaca API returns an error. Common error scenarios:

- **Authentication failure:** Invalid or expired API credentials
- **Insufficient buying power:** Account lacks funds for the requested order
- **Symbol not found:** The requested asset does not exist or is not tradable
- **Market closed:** Attempting a non-extended-hours order outside market hours
- **Rate limiting:** Too many API requests in a short period

### Environment Override

Tools that accept the `env` parameter allow per-call environment switching. This is useful for comparing paper and live account states without changing the global plugin configuration.

---

## Cross-References

- **Alpaca API reference:** `references/api-alpaca-trading.md` -- full Alpaca API endpoint documentation, authentication details, SDK examples, and response schemas
- **Risk and policy guardrails:** `references/risk-and-policy-guardrails.md` -- approval tiers, disallowed action classes, evidence/citation requirements, and policy evaluation rules
- **Finance core extension:** `extensions/finance-core/` -- provides `finance_policy_check`, `finance.upsert_snapshot`, `finance.get_state`, and `finance.log_decision_packet`
- **Skill architecture:** `~/.agents/skills/personal-finance/skill-architecture-design.md` -- full system architecture including extension composition model and workflow order
- **OpenClaw extension patterns:** `references/api-openclaw-extension-patterns.md` -- manifest format, tool registration, secrets management, and lifecycle hooks
