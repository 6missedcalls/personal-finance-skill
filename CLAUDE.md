# Personal Finance Skill — Developer Guide

## Skill Documentation

For AI agent usage, tool catalog, workflows, and guardrails, see **SKILL.md**.

## Project Structure

```
personal-finance-skill/
  SKILL.md                    # AI agent entry point (75 tools, 7 extensions)
  CLAUDE.md                   # This file — developer instructions
  references/                 # All reference documentation (self-contained)
    ext-finance-core.md       # 9 tools — storage, normalization, policy, briefs
    ext-plaid-connect.md      # 8 tools — Plaid Link, accounts, transactions
    ext-alpaca-trading.md     # 10 tools — trading, positions, market data
    ext-ibkr-portfolio.md     # 9 tools — portfolio, allocation, performance
    ext-tax-engine.md         # 23 tools — parsers (15) + calculators (8)
    ext-market-intel.md       # 10 tools — Finnhub, SEC EDGAR, FRED, BLS, Alpha Vantage
    ext-social-sentiment.md   # 6 tools — StockTwits, X/Twitter, Quiver Quantitative
    data-models-and-schemas.md
    risk-and-policy-guardrails.md
    api-plaid.md              # Plaid API reference (219 KB)
    api-alpaca-trading.md     # Alpaca API reference (185 KB)
    api-ibkr-client-portal.md # IBKR Web API reference
    api-openclaw-framework.md # OpenClaw architecture
    api-openclaw-extension-patterns.md
    api-irs-tax-forms.md      # IRS tax form schemas + rules
  extensions/
    finance-core/             # Canonical models, storage, normalization, policy
    plaid-connect/            # Plaid API integration
    alpaca-trading/           # Alpaca brokerage integration
    ibkr-portfolio/           # IBKR Client Portal integration
    tax-engine/               # Tax document parsing + tax strategy
    market-intel/             # Market intelligence (news, filings, economic data)
    social-sentiment/         # Social sentiment (StockTwits, X, congressional)
```

## Stack

- TypeScript
- OpenClaw extension format (`openclaw.plugin.json` + tool registration)
- Each extension is a standalone OpenClaw plugin

## Rules

- Read the reference docs BEFORE writing any code
- Follow OpenClaw extension patterns exactly (`references/api-openclaw-extension-patterns.md`)
- Each extension must have: `openclaw.plugin.json`, `src/index.ts`, `package.json`
- Tools return strict JSON — agent reasons over structured data
- Include comprehensive error handling
- Write tests
- All financial calculations must be deterministic (no LLM arithmetic)
- Side-effecting tools must integrate with `finance_policy_check`

## Extension Architecture

```
┌─────────────────────────────────────────────────┐
│              Intelligence Layer                  │
│  tax-engine (23)  market-intel (10)             │
│  social-sentiment (6)                           │
├─────────────────────────────────────────────────┤
│            Data Source Adapters                   │
│  plaid-connect (8)  alpaca-trading (10)          │
│  ibkr-portfolio (9)                              │
├─────────────────────────────────────────────────┤
│              Foundation Layer                     │
│  finance-core (9 tools)                          │
└─────────────────────────────────────────────────┘
```

- **finance-core** defines canonical types that all other extensions normalize into
- Data source adapters fetch provider-specific data and store via `finance_upsert_snapshot`
- Tax engine operates on the canonical data for analysis and strategy
- Market intelligence fetches external data (news, filings, economic indicators)
- Social sentiment monitors social media signals (StockTwits, X, congressional trades)
- Policy engine in finance-core gates all side-effecting actions

## Key References

| Need | Read |
|------|------|
| Tool schemas and usage | `references/ext-*.md` |
| Canonical data types | `references/data-models-and-schemas.md` |
| Policy rules and guardrails | `references/risk-and-policy-guardrails.md` |
| Plaid API details | `references/api-plaid.md` |
| Alpaca API details | `references/api-alpaca-trading.md` |
| IBKR API details | `references/api-ibkr-client-portal.md` |
| OpenClaw patterns | `references/api-openclaw-extension-patterns.md` |
| Tax form rules | `references/api-irs-tax-forms.md` |

# currentDate
Today's date is 2026-02-23.
