# Personal Finance Skill

A comprehensive personal finance management skill for OpenClaw, providing 46 tools across 5 extensions for banking aggregation, brokerage trading, portfolio monitoring, tax optimization, and financial analysis.

## Extensions

| Extension | Tools | Purpose |
|-----------|-------|---------|
| **finance-core** | 9 | Canonical data models, storage, normalization, policy checks, anomaly detection, briefs |
| **plaid-connect** | 8 | Plaid API integration for bank accounts, transactions, investments, liabilities |
| **alpaca-trading** | 10 | Alpaca brokerage for account management, trading, positions, market data |
| **ibkr-portfolio** | 9 | Interactive Brokers Client Portal for portfolio, positions, allocation, market data |
| **tax-engine** | 10 | Tax document parsing (W-2, 1099-B/DIV/INT, K-1) and tax strategy calculators |

## Prerequisites

- Node.js 18+
- TypeScript 5+
- OpenClaw runtime (for extension registration)

### API Credentials

| Provider | Required Variables | Signup |
|----------|--------------------|--------|
| Plaid | `PLAID_CLIENT_ID`, `PLAID_SECRET` | [dashboard.plaid.com](https://dashboard.plaid.com) |
| Alpaca | `ALPACA_API_KEY`, `ALPACA_API_SECRET` | [app.alpaca.markets](https://app.alpaca.markets) |
| IBKR | `IBKR_BASE_URL` (Client Portal Gateway) | [ibkr.com](https://www.interactivebrokers.com) |

## Project Structure

```
personal-finance-skill/
  SKILL.md                    # AI agent entry point — skill definition
  CLAUDE.md                   # Developer instructions
  references/                 # Reference documentation
    ext-*.md                  # Per-extension tool docs
    data-models-and-schemas.md
    risk-and-policy-guardrails.md
    api-*.md                  # Upstream API references
  assets/
    README.md                 # This file
  extensions/
    finance-core/             # Foundation layer
    plaid-connect/            # Plaid adapter
    alpaca-trading/           # Alpaca adapter
    ibkr-portfolio/           # IBKR adapter
    tax-engine/               # Tax parsing + strategy
```

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd personal-finance-skill
   ```

2. Install dependencies for each extension:
   ```bash
   for ext in extensions/*/; do
     (cd "$ext" && npm install)
   done
   ```

3. Build all extensions:
   ```bash
   for ext in extensions/*/; do
     (cd "$ext" && npm run build)
   done
   ```

4. Configure environment variables:
   ```bash
   export PLAID_CLIENT_ID="your-client-id"
   export PLAID_SECRET="your-secret"
   export PLAID_ENV="sandbox"           # sandbox | development | production
   export ALPACA_API_KEY="your-key"
   export ALPACA_API_SECRET="your-secret"
   export ALPACA_ENV="paper"            # paper | live
   export IBKR_BASE_URL="https://localhost:5000/v1/api"
   ```

5. Register extensions with OpenClaw (see `SKILL.md` for configuration details).

## Running Tests

```bash
for ext in extensions/*/; do
  echo "Testing $ext..."
  (cd "$ext" && npm test)
done
```

## Key Concepts

- **Canonical Models**: All provider data normalizes into shared types (Account, Transaction, Position, Liability) defined in finance-core.
- **Snapshot Storage**: Append-only, content-hashed, idempotent data storage with point-in-time queries.
- **Policy Engine**: All side-effecting actions (trades, transfers, tax moves) must pass `finance_policy_check` before execution.
- **Deterministic Calculators**: Tax calculations, P/L, net worth are computed by tools — never by LLM arithmetic.

## Documentation

- **For AI agents**: Start with `SKILL.md`
- **For developers**: Start with `CLAUDE.md`
- **Tool reference**: See `references/ext-*.md` files
- **Data models**: See `references/data-models-and-schemas.md`
- **Policy rules**: See `references/risk-and-policy-guardrails.md`
