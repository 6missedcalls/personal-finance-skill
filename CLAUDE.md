# Personal Finance Skill — OpenClaw Extensions

## Project Structure
```
extensions/
  plaid-connect/     — Plaid API integration (banking, transactions, investments)
  alpaca-trading/    — Alpaca API integration (brokerage, orders, positions)
  ibkr-portfolio/    — IBKR Client Portal API integration (portfolio, positions)
  tax-engine/        — Tax document parser + tax-loss harvesting strategy
  finance-core/      — Canonical models, normalization, caching, notifications
```

## Reference Documentation
All API docs are at: ~/.agents/skills/personal-finance/references/docs/
- plaid-api.md (219 KB) — Full Plaid API reference
- alpaca-trading-api.md (185 KB) — Full Alpaca API reference  
- ibkr-client-portal-api.md (6 KB) — IBKR Web API reference
- irs-tax-forms-and-rules.md (10 KB) — Tax form schemas + rules
- openclaw-extension-patterns.md (6 KB) — How to build OpenClaw extensions
- openclaw-framework.md (23 KB) — OpenClaw architecture

## Architecture Design
See: ~/.agents/skills/personal-finance/skill-architecture-design.md

## Stack
- TypeScript
- OpenClaw extension format (openclaw.plugin.json + tool registration)
- Each extension is a standalone OpenClaw plugin

## Rules
- Read the reference docs BEFORE writing any code
- Follow OpenClaw extension patterns exactly
- Each extension must have: openclaw.plugin.json, src/index.ts, package.json
- Tools return strict JSON — agent reasons over structured data
- Include comprehensive error handling
- Write tests
