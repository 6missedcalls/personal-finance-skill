# Personal Finance Skill

A comprehensive personal finance management skill for OpenClaw, providing 75 tools across 7 extensions for banking aggregation, brokerage trading, portfolio monitoring, tax optimization, market intelligence, social sentiment analysis, and financial analysis.

## Extensions

| Extension | Tools | Purpose |
|-----------|-------|---------|
| **finance-core** | 9 | Canonical data models, storage, normalization, policy checks, anomaly detection, briefs |
| **plaid-connect** | 8 | Plaid API integration for bank accounts, transactions, investments, liabilities |
| **alpaca-trading** | 10 | Alpaca brokerage for account management, trading, positions, market data |
| **ibkr-portfolio** | 9 | Interactive Brokers Client Portal for portfolio, positions, allocation, market data |
| **tax-engine** | 23 | Tax document parsing (1040, Schedules A-E/SE, 8949, 6251, W-2, 1099-B/DIV/INT, K-1, state returns) and tax strategy calculators (liability, TLH, wash sales, lots, quarterly estimates, Schedule D, state tax, AMT) |
| **market-intel** | 10 | Company news, SEC filings, economic data (FRED, BLS), analyst recommendations, and news sentiment via Finnhub, SEC EDGAR, FRED, BLS, and Alpha Vantage |
| **social-sentiment** | 6 | Social media sentiment monitoring via StockTwits, X/Twitter, and Quiver Quantitative (congressional trading) |

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
| Finnhub | `FINNHUB_API_KEY` | [finnhub.io](https://finnhub.io) |
| FRED | `FRED_API_KEY` | [fred.stlouisfed.org](https://fred.stlouisfed.org/docs/api/api_key.html) |
| BLS | `BLS_API_KEY` | [bls.gov](https://data.bls.gov/registrationEngine/) |
| Alpha Vantage | `ALPHA_VANTAGE_API_KEY` | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |
| X/Twitter | `X_API_BEARER_TOKEN` | [developer.x.com](https://developer.x.com) |
| Quiver Quantitative | `QUIVER_API_KEY` | [quiverquant.com](https://www.quiverquant.com) |

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
    tax-engine/               # Tax parsing + strategy (23 tools)
    market-intel/             # Market intelligence (Finnhub, SEC, FRED, BLS, Alpha Vantage)
    social-sentiment/         # Social sentiment (StockTwits, X/Twitter, Quiver)
```

## Setup

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd personal-finance-skill
   ```

2. Run the onboarding script (recommended):
   ```bash
   ./scripts/onboard.sh
   ```
   This installs dependencies, builds all 7 extensions, and configures plugin registration.

3. Or install and build manually:
   ```bash
   for ext in extensions/*/; do
     (cd "$ext" && npm install && npm run build)
   done
   ```

4. Configure environment variables:
   ```bash
   # Banking (Plaid)
   export PLAID_CLIENT_ID="your-client-id"
   export PLAID_SECRET="your-secret"
   export PLAID_ENV="sandbox"           # sandbox | development | production

   # Trading (Alpaca)
   export ALPACA_API_KEY="your-key"
   export ALPACA_API_SECRET="your-secret"
   export ALPACA_ENV="paper"            # paper | live

   # Portfolio (IBKR)
   export IBKR_BASE_URL="https://localhost:5000/v1/api"

   # Market Intelligence
   export FINNHUB_API_KEY="your-key"
   export FRED_API_KEY="your-key"
   export BLS_API_KEY="your-key"
   export ALPHA_VANTAGE_API_KEY="your-key"

   # Social Sentiment
   export X_API_BEARER_TOKEN="your-token"
   export QUIVER_API_KEY="your-key"
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
