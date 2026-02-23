---
name: personal-finance-cfo
description: >
  Use when users want personal finance analysis or actions across banking,
  investing, and tax workflows (Plaid/Alpaca/IBKR/tax docs), including
  scheduled scans, anomaly detection, portfolio monitoring, tax optimization,
  and approval-gated execution.
version: 1.0.0
extensions:
  - finance-core
  - plaid-connect
  - alpaca-trading
  - ibkr-portfolio
  - tax-engine
tools: 46
---

# Personal Finance CFO Skill

## When to Use

Activate this skill when a user asks for:

- **Account aggregation** — connecting bank accounts, viewing balances, syncing transactions
- **Net worth / cash flow** — computing totals, tracking spending, savings rate analysis
- **Portfolio monitoring** — positions, allocation, performance, drift detection
- **Trading** — placing/canceling orders, market data, asset lookup (Alpaca)
- **Tax optimization** — estimated liability, TLH candidates, wash sale checks, quarterly payments
- **Tax document processing** — parsing W-2, 1099-B, 1099-DIV, 1099-INT, K-1
- **Recurring expense tracking** — subscriptions, bills, income streams
- **Anomaly detection** — unusual transactions, balance drops, duplicate charges
- **Financial briefings** — weekly/monthly summaries with action items
- **Scheduled finance workflows** — cron-based scans, alerts, reports

## Architecture Overview

Five OpenClaw extensions organized in three layers:

```
┌─────────────────────────────────────────────────┐
│              Intelligence Layer                  │
│  tax-engine (10 tools)                          │
│  — parsing, liability, TLH, wash sales, lots    │
├─────────────────────────────────────────────────┤
│            Data Source Adapters                   │
│  plaid-connect (8)  alpaca-trading (10)          │
│  ibkr-portfolio (9)                              │
├─────────────────────────────────────────────────┤
│              Foundation Layer                     │
│  finance-core (9 tools)                          │
│  — canonical models, storage, normalization,     │
│    policy checks, anomaly detection, briefs      │
└─────────────────────────────────────────────────┘
```

**Data flow**: Adapters fetch provider data → finance-core normalizes and stores → intelligence layer analyzes → policy engine gates actions.

## Tool Catalog

### finance-core — 9 tools

| Tool | Description | Risk |
|------|-------------|------|
| `finance_upsert_snapshot` | Store normalized financial data snapshot (idempotent) | LOW |
| `finance_get_state` | Get current financial state (accounts, positions, etc.) | READ |
| `finance_get_transactions` | Query transactions with filters and pagination | READ |
| `finance_get_net_worth` | Calculate net worth breakdown by category/account | READ |
| `finance_detect_anomalies` | Scan for unusual transactions, balance drops, fee spikes | READ |
| `finance_cash_flow_summary` | Income vs expenses by category with savings rate | READ |
| `finance_subscription_tracker` | Identify recurring charges and subscription patterns | READ |
| `finance_generate_brief` | Create structured financial summary with action items | READ |
| `finance_policy_check` | Validate proposed action against policy rules | READ |

### plaid-connect — 8 tools

| Tool | Description | Risk |
|------|-------------|------|
| `plaid_create_link_token` | Initialize Plaid Link for account connection | LOW |
| `plaid_exchange_token` | Exchange public token for permanent access | MED |
| `plaid_get_accounts` | List connected accounts with balances | READ |
| `plaid_get_transactions` | Fetch transactions via cursor-based sync | READ |
| `plaid_get_investments` | Fetch holdings, securities, investment transactions | READ |
| `plaid_get_liabilities` | Fetch credit, student loan, and mortgage data | READ |
| `plaid_get_recurring` | Identify recurring inflow/outflow streams | READ |
| `plaid_webhook_handler` | Process incoming Plaid webhook events | LOW |

### alpaca-trading — 10 tools

| Tool | Description | Risk |
|------|-------------|------|
| `alpaca_get_account` | Get account balances, buying power, status | READ |
| `alpaca_list_positions` | List all open positions | READ |
| `alpaca_get_position` | Get single position by symbol | READ |
| `alpaca_list_orders` | List orders with status/date filters | READ |
| `alpaca_create_order` | Submit buy/sell order with safety checks | **HIGH** |
| `alpaca_cancel_order` | Cancel a pending order | MED |
| `alpaca_portfolio_history` | Historical equity and P/L over time | READ |
| `alpaca_get_assets` | Search tradable assets by class/exchange | READ |
| `alpaca_market_data` | Get snapshots, bars, or quotes for symbols | READ |
| `alpaca_clock` | Check if market is open, next open/close | READ |

### ibkr-portfolio — 9 tools

| Tool | Description | Risk |
|------|-------------|------|
| `ibkr_auth_status` | Check gateway authentication status | READ |
| `ibkr_tickle` | Keep gateway session alive (~1 min interval) | LOW |
| `ibkr_list_accounts` | List accounts (must call first) | READ |
| `ibkr_get_positions` | Get positions for an account (paginated) | READ |
| `ibkr_portfolio_allocation` | Allocation by asset class, sector, group | READ |
| `ibkr_portfolio_performance` | NAV time series and returns | READ |
| `ibkr_search_contracts` | Search contracts by symbol/name/type | READ |
| `ibkr_market_snapshot` | Real-time market data for contracts | READ |
| `ibkr_get_orders` | Get current live orders | READ |

### tax-engine — 10 tools

| Tool | Description | Risk |
|------|-------------|------|
| `tax_parse_1099b` | Parse 1099-B (proceeds, cost basis, wash sales) | READ |
| `tax_parse_1099div` | Parse 1099-DIV (dividends, capital gains) | READ |
| `tax_parse_1099int` | Parse 1099-INT (interest, bond premiums) | READ |
| `tax_parse_w2` | Parse W-2 (wages, withholding, SS/Medicare) | READ |
| `tax_parse_k1` | Parse Schedule K-1 (partnership pass-through) | READ |
| `tax_estimate_liability` | Calculate federal/state tax with brackets | READ |
| `tax_find_tlh_candidates` | Identify tax-loss harvesting opportunities | READ |
| `tax_check_wash_sales` | Validate wash sale rule compliance (61-day window) | READ |
| `tax_lot_selection` | Compare FIFO/LIFO/specific ID for a proposed sale | READ |
| `tax_quarterly_estimate` | Quarterly estimated payments with safe harbor | READ |

## Key Workflows

### 1. Onboarding — Connect Accounts

```
plaid_create_link_token(products: ["transactions", "investments", "liabilities"])
  → User completes Plaid Link
  → plaid_exchange_token(publicToken)
  → plaid_get_accounts → finance_upsert_snapshot(source: "plaid")
  → plaid_get_transactions → finance_upsert_snapshot
  → plaid_get_investments → finance_upsert_snapshot
  → finance_get_net_worth → present baseline to user
```

### 2. Daily Scan — Anomaly Detection

```
plaid_get_transactions(cursor) → finance_upsert_snapshot
alpaca_list_positions → finance_upsert_snapshot(source: "alpaca")
ibkr_auth_status → ibkr_get_positions → finance_upsert_snapshot(source: "ibkr")
  → finance_detect_anomalies(lookbackDays: 7)
  → Alert on medium/high severity findings
```

### 3. Tax-Loss Harvesting

```
finance_get_state(include: ["positions"])
  → tax_find_tlh_candidates(positions, marginalRate)
  → tax_check_wash_sales(proposedSales, recentPurchases)
  → tax_lot_selection(symbol, qty, lots)
  → finance_policy_check(actionType: "tax_move")
  → [If approved] alpaca_create_order(side: "sell", ...)
```

### 4. Quarterly Tax Review

```
tax_parse_w2 + tax_parse_1099b + tax_parse_1099div + tax_parse_1099int
  → tax_estimate_liability(filingStatus, income)
  → tax_quarterly_estimate(projectedIncome, priorYearTax, paymentsMade)
  → finance_generate_brief(period: "quarterly")
```

### 5. Portfolio Monitoring

```
alpaca_list_positions + ibkr_get_positions
  → finance_upsert_snapshot (both sources)
  → ibkr_portfolio_allocation (check drift)
  → alpaca_portfolio_history (performance trend)
  → finance_detect_anomalies
  → finance_generate_brief(period: "weekly")
```

## Configuration

### Environment Variables

| Variable | Extension | Description |
|----------|-----------|-------------|
| `PLAID_CLIENT_ID` | plaid-connect | Plaid API client ID |
| `PLAID_SECRET` | plaid-connect | Plaid API secret key |
| `PLAID_ENV` | plaid-connect | sandbox / development / production |
| `ALPACA_API_KEY` | alpaca-trading | Alpaca API key |
| `ALPACA_API_SECRET` | alpaca-trading | Alpaca API secret |
| `ALPACA_ENV` | alpaca-trading | paper / live |
| `IBKR_BASE_URL` | ibkr-portfolio | Client Portal Gateway URL |

### Extension Config

Each extension has an `openclaw.plugin.json` with a `configSchema`. Key settings:

- **finance-core**: `storageDir`, `anomalyThresholds`, `policyRulesPath`
- **plaid-connect**: `plaidEnv`, `webhookUrl`, `clientName`, `countryCodes`
- **alpaca-trading**: `env` (paper/live), `maxOrderQty`, `maxOrderNotional`
- **ibkr-portfolio**: `baseUrl`, `defaultAccountId`
- **tax-engine**: `defaultFilingStatus`, `defaultState`, `defaultTaxYear`

## Cron Examples

### Weekly Financial Brief
```bash
openclaw cron add \
  --name "Finance Weekly Brief" \
  --cron "0 8 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Run personal-finance-cfo weekly workflow: sync all providers, compute net worth delta, top spend changes, upcoming bills, tax posture, and portfolio drift. Send concise brief with action queue."
```

### Daily Anomaly Scan
```bash
openclaw cron add \
  --name "Finance Daily Anomaly" \
  --cron "15 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Sync latest transactions, run finance_detect_anomalies. Alert on medium/high/critical findings only."
```

### Quarterly Tax Check
```bash
openclaw cron add \
  --name "Quarterly Tax Review" \
  --cron "0 9 1 1,4,6,9 *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Run quarterly tax review: estimate liability, check withholding gap, find TLH opportunities, assess quarterly payment risk."
```

### Portfolio Drift Monitor
```bash
openclaw cron add \
  --name "Portfolio Drift Monitor" \
  --cron "*/30 13-21 * * 1-5" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check portfolio allocation vs target bands. Alert if drift exceeds threshold for 2 consecutive scans."
```

## Non-Negotiable Guardrails

These rules apply to all AI agents using this skill:

1. **Always run `finance_policy_check` before any side-effecting action** (trades, transfers, tax moves).
2. **Never bypass approval requirements.** If policy requires user or advisor approval, halt and request it.
3. **Numeric outputs must come from deterministic calculators.** Never use LLM arithmetic for tax amounts, P/L, or net worth — always use the tool.
4. **Recommendations must include assumptions and data freshness.** Every financial recommendation states what data it used and when that data was last updated.
5. **Never expose raw access tokens or API keys** in tool outputs or conversation.
6. **Never auto-execute in live trading** without explicit user confirmation, even if policy rules allow it.
7. **All investment-related outputs must include disclaimer**: "This is informational only, not financial advice. Consult a qualified advisor before making financial decisions."
8. **If data is stale, say so.** Report data freshness before advising.

## Reference Index

| File | Contents |
|------|----------|
| `references/ext-finance-core.md` | 9 tools, storage layer, normalization functions |
| `references/ext-plaid-connect.md` | 8 tools, Plaid Link flow, webhook handling |
| `references/ext-alpaca-trading.md` | 10 tools, order lifecycle, safety limits |
| `references/ext-ibkr-portfolio.md` | 9 tools, session management, market data fields |
| `references/ext-tax-engine.md` | 10 tools, 5 parsers + 5 calculators, form field mappings |
| `references/data-models-and-schemas.md` | Canonical types, enums, entity schemas |
| `references/risk-and-policy-guardrails.md` | Policy engine, approval tiers, hard rules |
| `references/api-plaid.md` | Full Plaid API reference (219 KB) |
| `references/api-alpaca-trading.md` | Full Alpaca API reference (185 KB) |
| `references/api-ibkr-client-portal.md` | IBKR Client Portal Web API reference |
| `references/api-openclaw-framework.md` | OpenClaw architecture reference |
| `references/api-openclaw-extension-patterns.md` | How to build OpenClaw extensions |
| `references/api-irs-tax-forms.md` | IRS tax form schemas and rules |
