<div align="center">

# `personal-finance-skill`

### Your AI-Powered Personal CFO

**46 tools** across **5 extensions** for banking, investing, tax optimization, and financial analysis — built for the [Agent Skills Protocol](https://agentskills.io).

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Agent Skills](https://img.shields.io/badge/Agent_Skills-Protocol-blueviolet)](https://agentskills.io)
[![Tools](https://img.shields.io/badge/Tools-46-brightgreen)](#tool-catalog)
[![Tests](https://img.shields.io/badge/Tests-324_passing-success)](#running-tests)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?logo=typescript&logoColor=white)](#)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs&logoColor=white)](#)

---

**Connect your bank accounts** &bull; **Monitor your portfolio** &bull; **Trade stocks** &bull; **Optimize taxes** &bull; **Detect anomalies**

All through natural language, with deterministic calculations, policy guardrails, and approval gates.

[Install](#-quick-start) &bull; [Architecture](#-architecture) &bull; [Tools](#-tool-catalog) &bull; [Workflows](#-key-workflows) &bull; [Docs](#-documentation)

</div>

---

## Why This Skill?

Most AI finance tools hallucinate numbers. This one doesn't.

- **Deterministic math** — Tax liability, P/L, net worth always computed by tools, never by LLM arithmetic
- **Policy engine** — Every trade, transfer, and tax move passes `finance_policy_check` before execution
- **Multi-provider** — Plaid (banking) + Alpaca (trading) + IBKR (portfolio) + IRS tax forms in one unified model
- **Approval gates** — No live trades without explicit human confirmation, ever
- **Canonical data model** — All providers normalize into shared types (Account, Transaction, Position, Liability)
- **Works with 40+ AI agents** — Claude Code, Cursor, Codex, OpenClaw, Windsurf, and more via the Agent Skills Protocol

---

## Install

```bash
npx skills add <owner>/personal-finance-skill
```

Or install for specific agents:

```bash
npx skills add <owner>/personal-finance-skill -a claude-code -a cursor -a codex
```

---

## Architecture

```
+---------------------------------------------------+
|              Intelligence Layer                     |
|  tax-engine (10 tools)                             |
|  Parsing, liability, TLH, wash sales, lot select   |
+---------------------------------------------------+
|            Data Source Adapters                      |
|  plaid-connect (8)  |  alpaca-trading (10)         |
|  ibkr-portfolio (9) |                              |
+---------------------------------------------------+
|              Foundation Layer                        |
|  finance-core (9 tools)                             |
|  Canonical models, storage, normalization,          |
|  policy checks, anomaly detection, briefs           |
+---------------------------------------------------+
```

**Data flow**: Adapters fetch provider data &rarr; finance-core normalizes & stores &rarr; intelligence layer analyzes &rarr; policy engine gates actions.

### Extensions at a Glance

| Extension | Tools | What It Does |
|:----------|:-----:|:-------------|
| **finance-core** | 9 | Canonical data models, snapshot storage, normalization, policy engine, anomaly detection, financial briefs |
| **plaid-connect** | 8 | Plaid Link flow, bank accounts, transactions, investments, liabilities, recurring charges, webhooks |
| **alpaca-trading** | 10 | Brokerage account, positions, orders, market data, trading with safety limits |
| **ibkr-portfolio** | 9 | IBKR Client Portal, portfolio allocation, performance, market snapshots, session management |
| **tax-engine** | 10 | W-2/1099-B/1099-DIV/1099-INT/K-1 parsing, tax liability, TLH candidates, wash sales, lot selection |

---

## Tool Catalog

### finance-core

| Tool | Description | Risk |
|:-----|:------------|:----:|
| `finance_upsert_snapshot` | Store normalized financial data snapshot (idempotent) | LOW |
| `finance_get_state` | Get current financial state (accounts, positions, etc.) | READ |
| `finance_get_transactions` | Query transactions with filters and pagination | READ |
| `finance_get_net_worth` | Calculate net worth breakdown by category/account | READ |
| `finance_detect_anomalies` | Scan for unusual transactions, balance drops, fee spikes | READ |
| `finance_cash_flow_summary` | Income vs expenses by category with savings rate | READ |
| `finance_subscription_tracker` | Identify recurring charges and subscription patterns | READ |
| `finance_generate_brief` | Create structured financial summary with action items | READ |
| `finance_policy_check` | Validate proposed action against policy rules | READ |

### plaid-connect

| Tool | Description | Risk |
|:-----|:------------|:----:|
| `plaid_create_link_token` | Initialize Plaid Link for account connection | LOW |
| `plaid_exchange_token` | Exchange public token for permanent access | MED |
| `plaid_get_accounts` | List connected accounts with balances | READ |
| `plaid_get_transactions` | Fetch transactions via cursor-based sync | READ |
| `plaid_get_investments` | Fetch holdings, securities, investment transactions | READ |
| `plaid_get_liabilities` | Fetch credit, student loan, and mortgage data | READ |
| `plaid_get_recurring` | Identify recurring inflow/outflow streams | READ |
| `plaid_webhook_handler` | Process incoming Plaid webhook events | LOW |

### alpaca-trading

| Tool | Description | Risk |
|:-----|:------------|:----:|
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

### ibkr-portfolio

| Tool | Description | Risk |
|:-----|:------------|:----:|
| `ibkr_auth_status` | Check gateway authentication status | READ |
| `ibkr_tickle` | Keep gateway session alive (~1 min interval) | LOW |
| `ibkr_list_accounts` | List accounts (must call first) | READ |
| `ibkr_get_positions` | Get positions for an account (paginated) | READ |
| `ibkr_portfolio_allocation` | Allocation by asset class, sector, group | READ |
| `ibkr_portfolio_performance` | NAV time series and returns | READ |
| `ibkr_search_contracts` | Search contracts by symbol/name/type | READ |
| `ibkr_market_snapshot` | Real-time market data for contracts | READ |
| `ibkr_get_orders` | Get current live orders | READ |

### tax-engine

| Tool | Description | Risk |
|:-----|:------------|:----:|
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

---

## Key Workflows

### 1. Onboarding &mdash; Connect Accounts

```
plaid_create_link_token(products: ["transactions", "investments", "liabilities"])
  -> User completes Plaid Link
  -> plaid_exchange_token(publicToken)
  -> plaid_get_accounts -> finance_upsert_snapshot(source: "plaid")
  -> plaid_get_transactions -> finance_upsert_snapshot
  -> plaid_get_investments -> finance_upsert_snapshot
  -> finance_get_net_worth -> present baseline to user
```

### 2. Daily Anomaly Scan

```
plaid_get_transactions(cursor) -> finance_upsert_snapshot
alpaca_list_positions -> finance_upsert_snapshot(source: "alpaca")
ibkr_auth_status -> ibkr_get_positions -> finance_upsert_snapshot(source: "ibkr")
  -> finance_detect_anomalies(lookbackDays: 7)
  -> Alert on medium/high severity findings
```

### 3. Tax-Loss Harvesting

```
finance_get_state(include: ["positions"])
  -> tax_find_tlh_candidates(positions, marginalRate)
  -> tax_check_wash_sales(proposedSales, recentPurchases)
  -> tax_lot_selection(symbol, qty, lots)
  -> finance_policy_check(actionType: "tax_move")
  -> [If approved] alpaca_create_order(side: "sell", ...)
```

### 4. Quarterly Tax Review

```
tax_parse_w2 + tax_parse_1099b + tax_parse_1099div + tax_parse_1099int
  -> tax_estimate_liability(filingStatus, income)
  -> tax_quarterly_estimate(projectedIncome, priorYearTax, paymentsMade)
  -> finance_generate_brief(period: "quarterly")
```

### 5. Portfolio Monitoring

```
alpaca_list_positions + ibkr_get_positions
  -> finance_upsert_snapshot (both sources)
  -> ibkr_portfolio_allocation (check drift)
  -> alpaca_portfolio_history (performance trend)
  -> finance_detect_anomalies
  -> finance_generate_brief(period: "weekly")
```

---

## Quick Start

### Prerequisites

- **Node.js 18+** and **npm**
- **TypeScript 5+**
- API credentials for at least one provider (see below)

### 1. Clone & Onboard

The onboard script builds all extensions, registers them as OpenClaw plugins, and installs the skill:

```bash
git clone https://github.com/6missedcalls/personal-finance-skill.git
cd personal-finance-skill

# Build, symlink plugins, and install skill in one command
./scripts/onboard.sh
```

The script will:
1. Install deps and build all 5 extensions
2. Register each as an OpenClaw plugin (dev-linked via `openclaw plugins install -l`)
3. Symlink the skill into `~/.openclaw/skills/`
4. Verify everything is reachable

> **Options**: `--copy` to copy instead of symlink, `--uninstall` to remove everything.

### 2. Configure API Credentials

Set credentials for the providers you plan to use (you don't need all of them):

```bash
# Plaid — https://dashboard.plaid.com
export PLAID_CLIENT_ID="your-client-id"
export PLAID_SECRET="your-secret"
export PLAID_ENV="sandbox"              # sandbox | development | production

# Alpaca — https://app.alpaca.markets
export ALPACA_API_KEY="your-key"
export ALPACA_API_SECRET="your-secret"
export ALPACA_ENV="paper"               # paper | live

# IBKR — https://www.interactivebrokers.com
export IBKR_BASE_URL="https://localhost:5000/v1/api"
```

### 3. Restart & Verify

```bash
openclaw gateway restart
openclaw plugins list        # should show all 5 extensions
```

### 4. Run Tests

```bash
for ext in extensions/*/; do
  echo "Testing $ext..."
  (cd "$ext" && npm test)
done
```

324 tests across 24 test files, all passing.

---

## Project Structure

```
personal-finance-skill/
  SKILL.md                              # Agent Skills Protocol entry point
  README.md                             # This file
  LICENSE                               # MIT
  scripts/
    onboard.sh                          # Build + register + verify (one command)
  extensions/
    finance-core/                       # Foundation: models, storage, policy
    plaid-connect/                      # Adapter: Plaid banking API
    alpaca-trading/                     # Adapter: Alpaca brokerage API
    ibkr-portfolio/                     # Adapter: IBKR Client Portal API
    tax-engine/                         # Intelligence: tax parsing + strategy
  references/
    ext-finance-core.md                 # 9 tool schemas + storage layer
    ext-plaid-connect.md                # 8 tool schemas + Link flow
    ext-alpaca-trading.md               # 10 tool schemas + order lifecycle
    ext-ibkr-portfolio.md               # 9 tool schemas + session mgmt
    ext-tax-engine.md                   # 10 tool schemas + calculators
    data-models-and-schemas.md          # Canonical types + enums
    risk-and-policy-guardrails.md       # Policy engine + approval tiers
    api-plaid.md                        # Plaid API reference
    api-alpaca-trading.md               # Alpaca API reference
    api-ibkr-client-portal.md           # IBKR API reference
    api-openclaw-framework.md           # OpenClaw architecture
    api-openclaw-extension-patterns.md  # Extension patterns
    api-irs-tax-forms.md                # IRS form schemas
  assets/
    README.md                           # Legacy setup notes
```

---

## Automation Examples

Set up recurring scans with your agent runtime:

<details>
<summary><b>Weekly Financial Brief</b> &mdash; Mondays at 8 AM PT</summary>

```bash
openclaw cron add \
  --name "Finance Weekly Brief" \
  --cron "0 8 * * 1" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Sync all providers, compute net worth delta, top spend changes, upcoming bills, tax posture, portfolio drift. Send concise brief with action queue."
```

</details>

<details>
<summary><b>Daily Anomaly Scan</b> &mdash; Every day at 7:15 AM PT</summary>

```bash
openclaw cron add \
  --name "Finance Daily Anomaly" \
  --cron "15 7 * * *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Sync latest transactions, run finance_detect_anomalies. Alert on medium/high/critical findings only."
```

</details>

<details>
<summary><b>Quarterly Tax Check</b> &mdash; Jan, Apr, Jun, Sep 1st at 9 AM PT</summary>

```bash
openclaw cron add \
  --name "Quarterly Tax Review" \
  --cron "0 9 1 1,4,6,9 *" \
  --tz "America/Los_Angeles" \
  --session isolated \
  --message "Estimate liability, check withholding gap, find TLH opportunities, assess quarterly payment risk."
```

</details>

<details>
<summary><b>Portfolio Drift Monitor</b> &mdash; Every 30 min during market hours</summary>

```bash
openclaw cron add \
  --name "Portfolio Drift Monitor" \
  --cron "*/30 13-21 * * 1-5" \
  --tz "America/New_York" \
  --session isolated \
  --message "Check portfolio allocation vs target bands. Alert if drift exceeds threshold for 2 consecutive scans."
```

</details>

---

## Safety & Guardrails

These rules are enforced for all AI agents using this skill:

| # | Rule |
|:-:|:-----|
| 1 | **Always run `finance_policy_check`** before any trade, transfer, or tax move |
| 2 | **Never bypass approval requirements** &mdash; halt and request confirmation |
| 3 | **Deterministic math only** &mdash; never use LLM arithmetic for money |
| 4 | **State data freshness** &mdash; every recommendation includes when data was last synced |
| 5 | **Never expose credentials** &mdash; no API keys or tokens in outputs |
| 6 | **No auto-execution** &mdash; live trades always require explicit human confirmation |
| 7 | **Include disclaimers** &mdash; investment outputs state "not financial advice" |
| 8 | **Flag stale data** &mdash; warn before advising on outdated information |

---

## Key Concepts

| Concept | Description |
|:--------|:------------|
| **Canonical Models** | All provider data normalizes into shared types: `Account`, `Transaction`, `Position`, `Liability` |
| **Snapshot Storage** | Append-only, content-hashed, idempotent storage with point-in-time queries |
| **Policy Engine** | Configurable rules with approval tiers (none / user / advisor) gate all side effects |
| **Deterministic Calculators** | Tax, P/L, net worth computed by tools &mdash; zero LLM math |
| **Progressive Disclosure** | SKILL.md has the overview, `references/` has full schemas, `api-*.md` has upstream docs |

---

## Documentation

| Audience | Start Here |
|:---------|:-----------|
| **AI agents** | [`SKILL.md`](SKILL.md) &mdash; tool catalog, workflows, guardrails |
| **Developers** | [`CLAUDE.md`](CLAUDE.md) &mdash; build instructions, architecture, rules |
| **Tool schemas** | [`references/ext-*.md`](references/) &mdash; full input/output schemas per extension |
| **Data models** | [`references/data-models-and-schemas.md`](references/data-models-and-schemas.md) |
| **Policy rules** | [`references/risk-and-policy-guardrails.md`](references/risk-and-policy-guardrails.md) |

---

## Agent Compatibility

This skill follows the [Agent Skills Protocol](https://agentskills.io) and works with **40+ AI coding agents** including:

Claude Code &bull; Cursor &bull; Codex &bull; OpenClaw &bull; Windsurf &bull; Cline &bull; Roo Code &bull; Goose &bull; Continue &bull; Kilo &bull; Amp &bull; and more

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write tests first (TDD)
4. Ensure all 324 tests pass
5. Submit a PR

See [`CLAUDE.md`](CLAUDE.md) for coding conventions and architecture guidelines.

---

## Disclaimer

This software is for informational and educational purposes only. It is **not financial advice**. Always consult a qualified financial advisor before making investment or tax decisions. The authors assume no liability for financial losses incurred through the use of this software.

---

## License

[MIT](LICENSE)
