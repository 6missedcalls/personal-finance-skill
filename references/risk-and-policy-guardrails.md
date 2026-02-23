# Risk and Policy Guardrails

> Policy engine, approval tiers, and non-negotiable rules for the Personal Finance Skill.

Last updated: 2026-02-23

---

## Overview

The policy engine is the gatekeeper for all side-effecting actions in the Personal Finance Skill. Every operation that modifies external state -- placing a trade, initiating a transfer, executing a tax-loss harvest, or triggering a rebalance -- must pass through the `finance_policy_check` tool before execution. The engine evaluates the proposed action against a set of user-defined policy rules and returns an explicit allow/deny verdict along with any required approval levels.

If no rules are configured for a given action type, the engine defaults to **allowed**. This means a fresh installation with no policy rules has no guardrails -- configuring baseline rules is a required setup step.

---

## Action Types

The policy engine recognizes five action types. Every side-effecting tool call must map to exactly one of these.

| Action Type    | Description                                        | Typical Examples                                                   |
|----------------|----------------------------------------------------|--------------------------------------------------------------------|
| `trade`        | Buying or selling securities                       | Market/limit orders, bracket orders, options trades                |
| `transfer`     | Moving funds between accounts                      | ACH transfers, wire transfers, internal account sweeps             |
| `tax_move`     | Tax-motivated financial operations                 | Tax-loss harvesting execution, Roth conversions, asset relocation  |
| `notification` | Informational alerts and briefings                 | Weekly briefs, anomaly alerts, payment reminders                   |
| `rebalance`    | Portfolio rebalancing toward target allocations     | Drift correction trades, cash drag reduction, asset reallocation   |

---

## Approval Tiers

Each policy rule specifies a required approval level. When multiple rules match a single action, the **most restrictive** approval level applies.

| Tier       | Effect                                                                                              | When Used                                                         |
|------------|-----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| `none`     | Action proceeds without any approval gate. The agent may execute autonomously.                      | Low-risk, informational actions (notifications, read-only scans)  |
| `user`     | Action is paused until the user explicitly confirms. Delivered via `finance.request_approval`.       | Moderate-risk actions (standard trades, transfers, tax moves)     |
| `advisor`  | Action is **blocked**. Requires out-of-band advisor review before any execution can proceed.        | High-risk actions (large trades, complex tax strategies)          |

Escalation logic in the policy engine:
- If **any** matched rule requires `advisor` approval, the action is blocked (`allowed: false`).
- If **any** matched rule requires `user` approval (and no rule requires `advisor`), the action needs user confirmation before proceeding.
- If all matched rules require `none`, or no rules match, the action is allowed.

---

## Policy Rule Structure

### Rule Definition

Each policy rule is defined as a `PolicyRule` object:

```typescript
interface PolicyRule {
  readonly id: string                              // Unique rule identifier
  readonly name: string                            // Human-readable rule name
  readonly actionType: PolicyActionType             // Which action type this rule applies to
  readonly conditions: ReadonlyArray<PolicyCondition> // All conditions that must match (AND logic)
  readonly requiredApproval: ApprovalLevel          // Approval tier when this rule triggers
  readonly isActive: boolean                        // Whether the rule is currently enforced
}
```

### Condition Evaluation

Conditions within a single rule use **AND logic** -- every condition must evaluate to `true` for the rule to match. If any condition fails, the entire rule does not match.

```typescript
interface PolicyCondition {
  readonly field: string     // Dot-notation field path on the candidateAction object
  readonly operator: string  // Comparison operator
  readonly value: unknown    // Value to compare against
}
```

### Supported Operators

| Operator | Description                       | Value Type          | Example                                      |
|----------|-----------------------------------|---------------------|----------------------------------------------|
| `gt`     | Greater than                      | `number`            | `{ field: "notional", operator: "gt", value: 10000 }` |
| `lt`     | Less than                         | `number`            | `{ field: "qty", operator: "lt", value: 1 }`          |
| `gte`    | Greater than or equal             | `number`            | `{ field: "amount", operator: "gte", value: 500 }`    |
| `lte`    | Less than or equal                | `number`            | `{ field: "amount", operator: "lte", value: 100 }`    |
| `eq`     | Strict equality                   | `any`               | `{ field: "env", operator: "eq", value: "live" }`     |
| `neq`    | Strict inequality                 | `any`               | `{ field: "side", operator: "neq", value: "sell" }`   |
| `in`     | Value is in array                 | `array`             | `{ field: "symbol", operator: "in", value: ["GME", "AMC"] }` |
| `not_in` | Value is not in array             | `array`             | `{ field: "type", operator: "not_in", value: ["market"] }`   |

### Nested Field Paths

Condition fields support dot-notation for accessing nested properties on the `candidateAction` object. For example, `candidateAction.notional` is resolved by splitting on `.` and traversing the object hierarchy. If any segment in the path resolves to `undefined` or `null`, the condition evaluates to `false`.

---

## Default Policy Rules

The following rules are the recommended baseline configuration. They should be loaded during initial setup and adjusted per user preference.

### Trade Rules

| Rule Name                        | Conditions                                              | Approval   |
|----------------------------------|---------------------------------------------------------|------------|
| Trades above $10,000             | `notional gt 10000`                                     | `user`     |
| Trades above $50,000             | `notional gt 50000`                                     | `advisor`  |
| Live environment trades          | `env eq "live"`                                         | `user`     |

### Transfer Rules

| Rule Name                        | Conditions                                              | Approval   |
|----------------------------------|---------------------------------------------------------|------------|
| All account transfers            | *(no additional conditions -- matches all transfers)*   | `user`     |

### Tax Move Rules

| Rule Name                        | Conditions                                              | Approval   |
|----------------------------------|---------------------------------------------------------|------------|
| Tax-loss harvesting execution    | *(no additional conditions -- matches all tax moves)*   | `user`     |

### Rebalance Rules

| Rule Name                        | Conditions                                              | Approval   |
|----------------------------------|---------------------------------------------------------|------------|
| Portfolio rebalance execution    | *(no additional conditions -- matches all rebalances)*  | `user`     |

### Notification Rules

| Rule Name                        | Conditions                                              | Approval   |
|----------------------------------|---------------------------------------------------------|------------|
| *(none by default)*              | --                                                      | `none`     |

Notifications default to allowed with no rules configured, since the engine allows actions when no matching rules exist.

### Example Rule Definition

```json
{
  "id": "trade-large-user-approval",
  "name": "Trades above $10,000",
  "actionType": "trade",
  "conditions": [
    { "field": "notional", "operator": "gt", "value": 10000 }
  ],
  "requiredApproval": "user",
  "isActive": true
}
```

```json
{
  "id": "trade-very-large-advisor-block",
  "name": "Trades above $50,000",
  "actionType": "trade",
  "conditions": [
    { "field": "notional", "operator": "gt", "value": 50000 }
  ],
  "requiredApproval": "advisor",
  "isActive": true
}
```

---

## Extension Safety Limits

Beyond policy rules, individual extensions enforce their own hard limits as defense-in-depth.

### Alpaca Trading Extension

The `alpaca-trading` extension supports two configurable safety limits in its `AlpacaConfig`:

| Limit               | Config Field         | Description                                                       |
|----------------------|----------------------|-------------------------------------------------------------------|
| Max order quantity   | `maxOrderQty`        | Maximum number of shares in a single order. Rejects if exceeded.  |
| Max order notional   | `maxOrderNotional`   | Maximum dollar value of a single order. Rejects if exceeded.      |

These limits are enforced **at the extension level** before the order reaches the Alpaca API, providing a hard stop independent of policy rules. If either limit is not configured, that check is skipped.

### Paper vs. Live Trading

The Alpaca extension supports two environments:

| Environment | Base URL                              | Purpose                                       |
|-------------|---------------------------------------|-----------------------------------------------|
| `paper`     | `https://paper-api.alpaca.markets`    | Simulated trading for testing and development  |
| `live`      | `https://api.alpaca.markets`          | Real money execution                           |

The `env` field in the configuration determines which environment is active. The default policy rules above require `user` approval for any trade in the `live` environment. Paper trading is recommended for all initial testing and validation workflows.

### Order Confirmation Gate

The `alpaca_create_order` tool includes a `confirm: boolean` field that must be explicitly set to `true` to submit any order. This is a code-level safety gate independent of the policy engine.

---

## Non-Negotiable Hard Rules

These rules are absolute constraints on agent behavior. They cannot be overridden by user configuration, policy rules, or agent reasoning.

### 1. Always run `finance_policy_check` before any side-effecting action

Every action that modifies external state (trade, transfer, tax move, rebalance) must pass through the policy engine first. No exceptions. The policy check result must be inspected and honored before proceeding.

### 2. Never bypass approval requirements

If the policy engine returns `requiredApprovals` containing `user` or `advisor`, the agent must not proceed without obtaining the specified approval. The `finance.request_approval` tool must be used to solicit confirmation through the appropriate channel. Advisor-blocked actions cannot proceed through user approval alone.

### 3. Never execute in live trading without explicit user confirmation

Even if policy rules do not cover it, the agent must never auto-execute orders in the `live` Alpaca environment (or any real-money execution path) without explicit user confirmation. Paper trading may proceed according to normal policy rules.

### 4. Numeric outputs must come from deterministic calculators

Tax calculations, profit/loss figures, portfolio drift percentages, and all other numeric financial outputs must be computed by deterministic calculator tools. The agent must never use LLM arithmetic for financial numbers. The agent reasons about what to compute and interprets results, but the computation itself must be handled by code.

### 5. Tax calculations are deterministic only

Tax liability estimates, capital gains computations, wash sale adjustments, and withholding gap analysis must all flow through the `tax-strategy` extension tools. The agent must not estimate tax numbers through natural language reasoning.

### 6. Recommendations must include assumptions and citations

Every financial recommendation the agent produces must enumerate:
- The assumptions underlying the recommendation (e.g., tax bracket, filing status, expected income)
- Citations to the source data used (e.g., snapshot IDs, document IDs, data freshness timestamps)

### 7. Report data staleness before advising

If the data backing a recommendation is stale (sync timestamps older than expected freshness thresholds), the agent must disclose the staleness to the user before presenting any advice. Stale data must never be silently treated as current.

### 8. Never expose raw access tokens or API keys in tool outputs

API credentials (Plaid access tokens, Alpaca API keys/secrets, IBKR session tokens) must never appear in tool output, agent responses, decision packets, or logs. Use environment variable references and opaque token references only.

### 9. All investment recommendations must include the disclaimer

Every response that contains an investment recommendation, trade suggestion, or portfolio action must include:

> **This is not financial advice.** This analysis is generated by an automated system based on the data available. Consult a qualified financial advisor before making investment decisions.

---

## Evidence Standards

The agent must meet minimum evidence thresholds before issuing recommendations.

### Required Evidence for Recommendations

| Recommendation Type          | Minimum Evidence Required                                                                     |
|------------------------------|-----------------------------------------------------------------------------------------------|
| Trade suggestion             | Current position data, recent price data, portfolio context, policy check result              |
| Tax-loss harvesting          | Position cost basis with tax lots, current market value, wash sale lookback (30 days), holding period classification |
| Tax liability estimate       | All available tax documents parsed for the year, filing status, income sources identified     |
| Rebalance proposal           | Current allocations, target allocations, drift thresholds, transaction cost estimates         |
| Anomaly alert                | Transaction history for the lookback period, baseline spending patterns, confidence score     |

### Confidence and Uncertainty

- If extracted data has a confidence score below 0.8, the agent must flag it as low-confidence and recommend manual verification.
- If required data is missing entirely, the agent must state what is missing and decline to issue a recommendation until the gap is filled.
- Decision packets logged via `finance.log_decision_packet` must include a `confidence` field reflecting the overall confidence of the recommendation.

---

## Disclaimer Requirements

Different action types require different disclaimers attached to the agent's response.

| Action Category                | Required Disclaimer                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------|
| Investment recommendations     | "This is not financial advice. Consult a qualified financial advisor before making investment decisions."         |
| Tax recommendations            | "This is not tax advice. Consult a qualified tax professional before making tax-related decisions."               |
| Trade execution confirmation   | "This trade will be executed with real funds. Verify all details before confirming."                             |
| Transfer initiation            | "This transfer will move funds between accounts. Verify the source, destination, and amount before confirming."  |
| Tax-loss harvesting execution  | "This is not tax advice. Tax-loss harvesting involves selling securities at a loss. Wash sale rules may apply. Consult a tax professional." |
| General financial briefings    | "This summary is generated from automated data syncs. Verify figures against your account statements."           |

---

## Cross-References

| Document                                  | Relevance                                                           |
|-------------------------------------------|---------------------------------------------------------------------|
| `references/api-openclaw-extension-patterns.md` | How extensions register tools and enforce schemas                   |
| `references/api-alpaca-trading.md`        | Alpaca API endpoints, order lifecycle, and safety constraints        |
| `references/api-plaid.md`                 | Plaid API patterns, token handling, and webhook security             |
| `references/api-ibkr-client-portal.md`    | IBKR session management and read-only portfolio access               |
| `references/api-irs-tax-forms.md`         | Tax form schemas, extraction rules, and IRS filing constraints       |
| `extensions/finance-core/src/types.ts`    | Canonical type definitions for `PolicyRule`, `PolicyCondition`, `ApprovalLevel` |
| `extensions/finance-core/src/tools/policy-check.ts` | Policy engine implementation                                |
| `extensions/alpaca-trading/src/config.ts` | Alpaca safety limit configuration (`maxOrderQty`, `maxOrderNotional`) |
| `extensions/alpaca-trading/src/tools/create-order.ts` | Order confirmation gate and limit enforcement            |
