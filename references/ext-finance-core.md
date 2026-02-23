# Finance Core Extension Reference

| Field         | Value                                                                                                                                           |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| **ID**        | `finance-core`                                                                                                                                  |
| **Name**      | Finance Core                                                                                                                                    |
| **Version**   | 1.0.0                                                                                                                                           |
| **Description** | Canonical financial data layer -- normalized models, storage, policy checks, anomaly detection, and briefing generation for the personal finance skill ecosystem |
| **Last Updated** | 2026-02-23                                                                                                                                   |

---

## Overview

Finance Core is the foundational data layer for the Personal Finance Skill ecosystem. Every data-source extension (plaid-connect, alpaca-trading, ibkr-portfolio) normalizes provider-specific data into Finance Core's canonical types and persists it through the snapshot storage mechanism. All analytical, reporting, and governance tools operate on this normalized store.

The extension provides three pillars:

1. **Storage Layer** -- Append-only snapshot persistence with content hashing and idempotent writes, backed by a local filesystem store.
2. **Normalization Layer** -- Eight functions that convert Plaid, Alpaca, and IBKR response shapes into canonical Account, Transaction, Position, and Liability types.
3. **Tool Catalog** -- Nine agent-callable tools for data ingestion, querying, analysis, briefing generation, and policy validation.

Finance Core has no external API dependencies. It reads and writes to local disk and exposes its types and normalizers for consumption by other extensions in the skill pack.

---

## Configuration

The plugin manifest (`openclaw.plugin.json`) defines the configuration schema. All fields are optional.

```json
{
  "id": "finance-core",
  "name": "Finance Core",
  "version": "1.0.0",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "storageDir": {
        "type": "string",
        "description": "Directory for local financial data storage (default: ~/.openclaw/finance-data)"
      },
      "defaultUserId": {
        "type": "string",
        "description": "Default user ID when not explicitly provided"
      },
      "anomalyThresholds": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "largeTransactionMultiple": {
            "type": "number",
            "description": "Flag transactions exceeding this multiple of average (default: 3)"
          },
          "balanceDropPercent": {
            "type": "number",
            "description": "Flag balance drops exceeding this percentage (default: 20)"
          }
        }
      },
      "policyRulesPath": {
        "type": "string",
        "description": "Path to user policy rules JSON file"
      }
    }
  }
}
```

| Config Key                              | Type   | Default                        | Purpose                                                   |
|-----------------------------------------|--------|--------------------------------|-----------------------------------------------------------|
| `storageDir`                            | string | `~/.openclaw/finance-data`     | Root directory for the local finance data JSON file        |
| `defaultUserId`                         | string | --                             | Fallback user ID when not provided in tool calls          |
| `anomalyThresholds.largeTransactionMultiple` | number | `3`                       | Transactions above this multiple of the average are flagged |
| `anomalyThresholds.balanceDropPercent`  | number | `20`                           | Balance drops exceeding this percentage trigger an anomaly |
| `policyRulesPath`                       | string | --                             | Filesystem path to a JSON file containing policy rules    |

---

## Tool Catalog

| #  | Tool Name                      | Description                                                                                    | Risk Tier  |
|----|--------------------------------|------------------------------------------------------------------------------------------------|------------|
| 1  | `finance_upsert_snapshot`      | Store a normalized financial data snapshot. Idempotent by idempotencyKey.                      | LOW        |
| 2  | `finance_get_state`            | Retrieve current financial state across all data categories.                                   | READ-ONLY  |
| 3  | `finance_get_transactions`     | Query transactions with filters, pagination, and date-descending sort.                         | READ-ONLY  |
| 4  | `finance_get_net_worth`        | Calculate net worth breakdown by category and account.                                         | READ-ONLY  |
| 5  | `finance_detect_anomalies`     | Scan recent data for large transactions, duplicates, balance drops, and unusual merchants.      | READ-ONLY  |
| 6  | `finance_cash_flow_summary`    | Compute income vs. expenses with category breakdown, top merchants, and savings rate.          | READ-ONLY  |
| 7  | `finance_subscription_tracker` | Identify recurring charges and subscription patterns from transaction history.                  | READ-ONLY  |
| 8  | `finance_generate_brief`       | Create a structured periodic financial summary with action items.                              | READ-ONLY  |
| 9  | `finance_policy_check`         | Validate a proposed action against user-defined policy rules.                                  | READ-ONLY  |

---

## Tool Details

### 1. finance_upsert_snapshot

Store a normalized financial data snapshot. Used by data-source extensions (plaid-connect, alpaca-trading, ibkr-portfolio) to persist synced data into the canonical store. Idempotent -- duplicate idempotencyKeys return the existing snapshot without re-inserting.

**Risk Tier:** LOW (write to local store, idempotent)

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId", "source", "asOf", "payload", "idempotencyKey"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "User identifier"
    },
    "source": {
      "type": "string",
      "enum": ["plaid", "alpaca", "ibkr", "tax", "manual"],
      "description": "Data source that produced this snapshot"
    },
    "asOf": {
      "type": "string",
      "description": "ISO timestamp for when this data was current"
    },
    "payload": {
      "type": "object",
      "description": "Normalized financial data — may include accounts, transactions, positions, liabilities, and/or tax state",
      "properties": {
        "accounts": { "type": "array" },
        "transactions": { "type": "array" },
        "positions": { "type": "array" },
        "liabilities": { "type": "array" },
        "tax": { "type": "object" }
      }
    },
    "idempotencyKey": {
      "type": "string",
      "description": "Unique key to prevent duplicate snapshot insertion"
    }
  }
}
```

#### Output Schema

```typescript
{
  snapshotId: string    // Generated ID with "snap_" prefix
  contentSha256: string // SHA-256 hash of the serialized payload
  inserted: boolean     // true if new, false if idempotencyKey already existed
}
```

#### Behavior

- Computes a SHA-256 content hash of the payload for integrity verification.
- Checks whether a snapshot with the same `idempotencyKey` already exists. If so, returns the existing snapshot metadata with `inserted: false`.
- On new insert, merges payload data into the store using ID-based upsert: accounts, transactions, positions, and liabilities are merged by their `id` field; tax state is replaced.
- The snapshot record itself is appended to the snapshots log (append-only).

---

### 2. finance_get_state

Get the current financial state including accounts, transactions, positions, liabilities, and tax data. Use the `include` parameter to limit which data categories are returned.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId"],
  "properties": {
    "userId": {
      "type": "string",
      "description": "User identifier"
    },
    "include": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["accounts", "transactions", "positions", "liabilities", "tax"]
      },
      "description": "Which data categories to include. Defaults to all if omitted."
    },
    "asOf": {
      "type": "string",
      "description": "Optional ISO timestamp to retrieve state as of a specific point in time"
    }
  }
}
```

#### Output Schema

```typescript
{
  stateVersion: string                // Short hash identifying the state snapshot
  userId: string
  asOf: string                        // ISO timestamp
  accounts: ReadonlyArray<Account>    // Empty array if not included
  transactions: ReadonlyArray<Transaction>
  positions: ReadonlyArray<Position>
  liabilities: ReadonlyArray<Liability>
  tax: TaxState | null
}
```

#### Behavior

- When `include` is omitted, all five data categories are returned.
- When `include` is provided, only the listed categories are populated; excluded categories return empty arrays (or `null` for tax).
- The `asOf` parameter is accepted for future point-in-time query support.

---

### 3. finance_get_transactions

Query normalized transactions across all connected sources. Supports filtering by date range, account, category, amount range, and status. Returns paginated results sorted by date descending.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "startDate": { "type": "string", "description": "Filter transactions on or after this date (YYYY-MM-DD)" },
    "endDate": { "type": "string", "description": "Filter transactions on or before this date (YYYY-MM-DD)" },
    "accountId": { "type": "string", "description": "Filter to a specific account" },
    "category": {
      "type": "string",
      "enum": [
        "income", "transfer", "payment", "food_and_drink", "shopping",
        "transportation", "housing", "utilities", "healthcare",
        "entertainment", "education", "personal_care", "travel",
        "fees", "taxes", "investment", "subscription", "other"
      ],
      "description": "Filter by transaction category"
    },
    "minAmount": { "type": "number", "description": "Minimum absolute transaction amount" },
    "maxAmount": { "type": "number", "description": "Maximum absolute transaction amount" },
    "status": {
      "type": "string",
      "enum": ["posted", "pending", "canceled"],
      "description": "Filter by transaction status"
    },
    "limit": { "type": "number", "description": "Max results per page (default 100)" },
    "offset": { "type": "number", "description": "Offset for pagination (default 0)" }
  }
}
```

#### Output Schema

```typescript
{
  transactions: ReadonlyArray<Transaction> // Page of matching transactions
  total: number                            // Total matching transactions (before pagination)
  hasMore: boolean                         // true if more pages exist beyond current offset + limit
}
```

#### Behavior

- All filter parameters are optional. When omitted, no filtering is applied for that dimension.
- Amount filters operate on `Math.abs(tx.amount)` so they apply uniformly to income and expense transactions.
- Results are sorted by date descending (most recent first).
- Default limit is 100, default offset is 0.

---

### 4. finance_get_net_worth

Calculate total net worth from all connected accounts. Returns a breakdown by account type and individual account, showing total assets, total liabilities, and net worth.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "asOf": { "type": "string", "description": "Optional ISO timestamp for point-in-time calculation" }
  }
}
```

#### Output Schema

```typescript
{
  totalAssets: number
  totalLiabilities: number
  netWorth: number                           // totalAssets - totalLiabilities
  currency: string                           // "USD"
  asOf: string                               // ISO timestamp
  byCategory: ReadonlyArray<{
    category: AccountType
    totalValue: number
    accountCount: number
  }>
  byAccount: ReadonlyArray<{
    accountId: string
    accountName: string
    institutionName: string
    type: AccountType
    balance: number
    isLiability: boolean
  }>
}
```

#### Behavior

- For investment, brokerage, and retirement accounts, uses sum of position market values when available; falls back to account balance otherwise.
- Account types `credit`, `loan`, and `mortgage` are classified as liabilities.
- Standalone liabilities not already represented by an account are included separately.
- All amounts are rounded to cents (two decimal places).
- The `byCategory` array is sorted by absolute value descending.

---

### 5. finance_detect_anomalies

Flag unusual transactions or balance changes. Scans recent transactions for large amounts, unusual merchants, duplicate charges, and balance drops. Returns anomalies sorted by severity.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "lookbackDays": { "type": "number", "description": "Number of days to scan (default 30)" },
    "minSeverity": {
      "type": "string",
      "enum": ["low", "medium", "high", "critical"],
      "description": "Minimum severity threshold for returned anomalies (default low)"
    }
  }
}
```

#### Output Schema

```typescript
{
  anomalies: ReadonlyArray<Anomaly>  // Sorted by severity descending
  scannedTransactions: number
  scannedAccounts: number
  scanTimestamp: string              // ISO timestamp
}
```

#### Anomaly Types

| Type                      | Detection Logic                                                                 | Severity       |
|---------------------------|---------------------------------------------------------------------------------|----------------|
| `large_transaction`       | Amount exceeds configurable multiple (default 3x) of average transaction amount | medium or high |
| `duplicate_charge`        | Same merchant + same amount + same date across two different transactions        | medium         |
| `balance_drop`            | Available balance is significantly below current balance (configurable %)       | high or critical |
| `unusual_merchant`        | First-time merchant with amount > $100                                          | low            |

Additional anomaly types defined in the type system but not yet implemented in detection: `new_recurring_charge`, `missing_expected_deposit`, `unusual_location`, `fee_spike`.

#### Anomaly Object Shape

```typescript
{
  id: string                                        // Generated ID with "anom_" prefix
  type: AnomalyType
  severity: "low" | "medium" | "high" | "critical"
  title: string
  description: string
  detectedAt: string                                // ISO timestamp
  relatedEntityId: string                           // Transaction or account ID
  relatedEntityType: "transaction" | "account" | "position"
  dataPoints: Record<string, unknown>               // Context-specific evidence
}
```

#### Behavior

- Requires at least 5 transactions for large transaction detection (avoids false positives on sparse data).
- Detected anomalies are persisted to the anomaly history in the store (for briefing and trend analysis).
- Anomalies below `minSeverity` are excluded from the output.
- Configurable thresholds come from the extension config (`anomalyThresholds`).

---

### 6. finance_cash_flow_summary

Summarize income vs. expenses over a time period. Returns totals by category, top merchants, net cash flow, and savings rate.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId", "startDate", "endDate"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "startDate": { "type": "string", "description": "Start of period (YYYY-MM-DD)" },
    "endDate": { "type": "string", "description": "End of period (YYYY-MM-DD)" },
    "groupBy": {
      "type": "string",
      "enum": ["category", "merchant", "account"],
      "description": "How to group the breakdown (default category)"
    }
  }
}
```

#### Output Schema

```typescript
{
  period: { start: string; end: string }
  totalIncome: number
  totalExpenses: number
  netCashFlow: number                                   // totalIncome - totalExpenses
  currency: string                                      // "USD"
  incomeByCategory: ReadonlyArray<{
    category: TransactionCategory
    amount: number
    transactionCount: number
    percentOfTotal: number                              // Decimal (e.g., 0.4523)
  }>
  expensesByCategory: ReadonlyArray<{...}>              // Same shape as above
  topMerchants: ReadonlyArray<{
    merchantName: string
    totalAmount: number
    transactionCount: number
  }>
  savingsRate: number                                   // Decimal (e.g., 0.2350)
}
```

#### Behavior

- Only includes transactions with status `posted` (pending and canceled are excluded).
- In the Plaid convention used by this store, negative amounts represent income and positive amounts represent expenses.
- `topMerchants` is limited to the top 10 by total spend.
- Category and merchant breakdowns are sorted by amount descending.
- All monetary values are rounded to cents; percentages are rounded to four decimal places.
- `savingsRate` is computed as `(totalIncome - totalExpenses) / totalIncome`. Returns 0 if totalIncome is 0.

---

### 7. finance_subscription_tracker

Identify and track recurring subscriptions by analyzing transaction patterns. Detects weekly, biweekly, monthly, quarterly, and annual recurring charges. Reports new and canceled subscriptions since last check.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "lookbackMonths": {
      "type": "number",
      "description": "Number of months to analyze for recurring patterns (default 6)"
    }
  }
}
```

#### Output Schema

```typescript
{
  activeSubscriptions: ReadonlyArray<Subscription>
  totalMonthlyEstimate: number    // Sum of all subscriptions normalized to monthly
  totalAnnualEstimate: number     // totalMonthlyEstimate * 12
  currency: string                // "USD"
  newSinceLastCheck: ReadonlyArray<Subscription>
  canceledSinceLastCheck: ReadonlyArray<Subscription>
}
```

#### Subscription Object Shape

```typescript
{
  id: string                          // Generated ID with "sub_" prefix
  merchantName: string
  estimatedAmount: number             // Average charge amount
  frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annual"
  currency: string
  category: TransactionCategory
  lastChargeDate: string              // YYYY-MM-DD
  nextExpectedDate: string | null     // Estimated next charge date
  accountId: string
  transactionIds: ReadonlyArray<string>
  isActive: boolean
  confidenceScore: number             // 0.0 to 1.0
}
```

#### Behavior

- Groups expense transactions by merchant name and analyzes the interval pattern.
- Frequency detection thresholds: weekly (5-10 day intervals), biweekly (12-17), monthly (25-35), quarterly (80-100), annual (340-390).
- Rejects patterns where amount variance exceeds 15% (to avoid false matches on variable charges).
- Requires a minimum confidence score of 0.5 (based on occurrence completeness, amount consistency, and pattern length).
- Compares detected subscriptions against previously stored subscriptions to identify new and canceled entries.
- Stores the detected subscription list for future delta comparisons.
- Monthly amount normalization multipliers: weekly (4.33x), biweekly (2.17x), monthly (1x), quarterly (1/3), annual (1/12).

---

### 8. finance_generate_brief

Create a structured periodic financial summary. Generates sections covering net worth, cash flow, portfolio performance, subscriptions, and anomalies. Returns structured data the agent can format for delivery via any channel.

**Risk Tier:** READ-ONLY

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId", "period"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "period": {
      "type": "string",
      "enum": ["daily", "weekly", "monthly", "quarterly"],
      "description": "Brief period"
    },
    "includeSections": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Which sections to include: net_worth, cash_flow, positions, anomalies, subscriptions, action_items. Defaults to all."
    }
  }
}
```

#### Output Schema

```typescript
{
  period: "daily" | "weekly" | "monthly" | "quarterly"
  generatedAt: string                              // ISO timestamp
  sections: ReadonlyArray<{
    title: string
    content: string                                // Human-readable summary sentence
    dataPoints: Record<string, unknown>            // Structured data for the section
  }>
  actionItems: ReadonlyArray<{
    priority: "low" | "medium" | "high"
    title: string
    description: string
    actionType: PolicyActionType | null
  }>
  highlights: ReadonlyArray<string>                // Key takeaway strings
}
```

#### Available Sections

| Section Key     | Title           | Content                                                                |
|-----------------|-----------------|------------------------------------------------------------------------|
| `net_worth`     | Net Worth       | Total net worth, assets, liabilities, account count                    |
| `cash_flow`     | Cash Flow       | Income, expenses, net cash flow, savings rate, top expense categories  |
| `positions`     | Portfolio        | Position count, total market value, unrealized P/L, top 5 positions   |
| `anomalies`     | Alerts          | Anomaly count by severity, top 5 anomaly details                      |
| `subscriptions` | Subscriptions   | Active count, monthly and annual cost estimates                        |

#### Behavior

- Period lookback: daily (1 day), weekly (7 days), monthly (1 month), quarterly (3 months).
- Automatically generates action items: negative cash flow triggers a high-priority item; critical/high anomalies trigger review items.
- Highlights array contains concise key metrics (net worth, savings rate) for quick display.
- When `includeSections` is omitted, all six section types are generated.

---

### 9. finance_policy_check

Validate a proposed action against user-defined policy rules. Checks trades, transfers, tax moves, notifications, and rebalances against configured limits, restrictions, and approval requirements. Returns whether the action is allowed and what approvals are needed.

**Risk Tier:** READ-ONLY (validation only -- does not execute any action)

#### Input Schema

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["userId", "actionType", "candidateAction"],
  "properties": {
    "userId": { "type": "string", "description": "User identifier" },
    "actionType": {
      "type": "string",
      "enum": ["trade", "transfer", "tax_move", "notification", "rebalance"],
      "description": "Type of proposed action"
    },
    "candidateAction": {
      "type": "object",
      "description": "The proposed action details. Structure varies by actionType. For trades: symbol, side, qty, notional. For transfers: fromAccount, toAccount, amount. For tax_move: type, amount, account."
    }
  }
}
```

#### Output Schema

```typescript
{
  allowed: boolean                               // Whether the action can proceed
  reasonCodes: ReadonlyArray<string>             // Explanation codes (e.g., "rule:max_trade_size", "requires_advisor_approval")
  matchedRules: ReadonlyArray<string>            // IDs of policy rules that matched
  requiredApprovals: ReadonlyArray<"none" | "user" | "advisor">
}
```

#### Policy Rule Structure

Rules are stored in the finance data store and configured via the `policyRulesPath` config option or programmatically through the store API.

```typescript
{
  id: string
  name: string
  actionType: "trade" | "transfer" | "tax_move" | "notification" | "rebalance"
  conditions: ReadonlyArray<{
    field: string                                // Dot-notation path into candidateAction
    operator: "gt" | "lt" | "gte" | "lte" | "eq" | "neq" | "in" | "not_in"
    value: unknown
  }>
  requiredApproval: "none" | "user" | "advisor"
  isActive: boolean
}
```

#### Behavior

- Only active rules matching the given `actionType` are evaluated.
- A rule matches when all of its conditions evaluate to true against the `candidateAction` object.
- Condition evaluation supports nested field access via dot notation (e.g., `"order.notional"`).
- When no rules are configured for the action type, returns `allowed: true` with `reasonCodes: ["no_rules_configured"]`.
- Actions requiring `advisor` approval are always blocked (`allowed: false`) until explicit approval is granted.
- Actions requiring `user` approval are blocked unless there is also a matching rule with `none` approval level.

---

## Storage Layer

### Architecture

Finance Core uses `FinanceStore`, a class backed by local filesystem storage. Data is persisted as a single JSON file at `{storageDir}/finance-data.json`.

### Storage Schema

```typescript
{
  accounts: ReadonlyArray<Account>
  transactions: ReadonlyArray<Transaction>
  positions: ReadonlyArray<Position>
  liabilities: ReadonlyArray<Liability>
  tax: TaxState | null
  snapshots: ReadonlyArray<Snapshot>         // Append-only audit log
  policyRules: ReadonlyArray<PolicyRule>
  subscriptions: ReadonlyArray<Subscription>
  anomalyHistory: ReadonlyArray<Anomaly>
}
```

### Key Properties

- **Append-only snapshots**: Every `finance_upsert_snapshot` call appends a `Snapshot` record to the snapshots array. Snapshots are never deleted or modified.
- **Content hashing**: Each snapshot payload is hashed with SHA-256 (deterministic key ordering) for integrity verification and deduplication.
- **Idempotent writes**: Snapshots are keyed by `idempotencyKey`. If a snapshot with the same key already exists, the write is skipped and the existing metadata is returned.
- **Merge-by-ID**: When a snapshot payload includes entities (accounts, transactions, positions, liabilities), they are merged into the store by their `id` field. Existing entities with the same ID are replaced; new entities are appended.
- **Tax state replacement**: The `tax` field in the payload replaces the stored tax state entirely (not merged).
- **Directory auto-creation**: The storage directory is created recursively on first access if it does not exist.
- **Graceful degradation**: If the data file is missing or corrupted, the store initializes with empty state.

### ID Generation

All generated IDs follow the pattern `{prefix}_{base36_timestamp}_{random_8_chars}`:
- Accounts: `acct_`
- Transactions: `txn_`
- Positions: `pos_`
- Liabilities: `liab_`
- Snapshots: `snap_`
- Subscriptions: `sub_`
- Anomalies: `anom_`

---

## Normalization Layer

The normalization layer converts provider-specific response shapes into Finance Core's canonical types. All normalizer functions are pure (no side effects) and are exported from `finance-core` for use by data-source extensions.

### Function Reference

| Function                     | Source Type          | Target Type    | Provider |
|------------------------------|----------------------|----------------|----------|
| `normalizePlaidAccount`      | `PlaidAccount`       | `Account`      | Plaid    |
| `normalizePlaidTransaction`  | `PlaidTransaction`   | `Transaction`  | Plaid    |
| `normalizePlaidHolding`      | `PlaidHolding`       | `Position`     | Plaid    |
| `normalizePlaidLiability`    | `PlaidLiability`     | `Liability`    | Plaid    |
| `normalizeAlpacaAccount`     | `AlpacaAccount`      | `Account`      | Alpaca   |
| `normalizeAlpacaPosition`    | `AlpacaPosition`     | `Position`     | Alpaca   |
| `normalizeIbkrAccount`       | `IbkrAccount`        | `Account`      | IBKR     |
| `normalizeIbkrPosition`      | `IbkrPosition`       | `Position`     | IBKR     |

### Plaid Normalizers

**`normalizePlaidAccount(plaidAccount, institutionId, institutionName)`**

Maps Plaid account types (depository, credit, loan, investment, mortgage, brokerage) and subtypes (checking, savings, money market, CD, credit card, auto loan, student loan, 401k, IRA, Roth, HSA, 529) to canonical enums. Sets `source: "plaid"` and captures the Plaid `account_id` as `sourceAccountId`.

**`normalizePlaidTransaction(plaidTx, accountId)`**

Maps Plaid's `personal_finance_category.primary` field to canonical `TransactionCategory`. Preserves the detailed subcategory. Maps `pending: true` to `status: "pending"`, otherwise `"posted"`. Normalizes location fields (city, region, country, postalCode).

**`normalizePlaidHolding(holding, accountId)`**

Converts Plaid security types (equity, etf, mutual fund, bond, option, cryptocurrency, cash) to canonical `HoldingType`. Computes `unrealizedGainLoss` and `unrealizedGainLossPercent` from cost basis and market value. Stores the Plaid `security_id` in metadata.

**`normalizePlaidLiability(liability, accountId)`**

Maps Plaid liability types (credit, mortgage, student, auto) to canonical liability types. Extracts original principal, current balance, interest rate, minimum payment, and next payment date.

### Alpaca Normalizers

**`normalizeAlpacaAccount(alpacaAccount, env)`**

All Alpaca accounts are typed as `brokerage` / `brokerage_taxable`. The `env` parameter (`"paper"` or `"live"`) is included in the account name and metadata. Parses string-typed numeric fields (cash, equity, portfolio_value, buying_power) to numbers. Stores day trade count and PDT flag in metadata.

**`normalizeAlpacaPosition(alpacaPos, accountId)`**

Maps Alpaca asset classes: `us_equity` to `equity`, `crypto` to `crypto`, all others to `other`. Parses all string-typed numeric fields. Stores asset ID, exchange, side, last day price, and daily change in metadata.

### IBKR Normalizers

**`normalizeIbkrAccount(ibkrAccount)`**

Maps IBKR account types: INDIVIDUAL to brokerage, IRA/ROTH/401K to retirement, TRUST/CORP to investment. Maps subtypes accordingly (IRA to ira_traditional, ROTH to ira_roth, MARGIN to brokerage_margin). Uses `netliquidation` for current balance and `availablefunds` for available balance.

**`normalizeIbkrPosition(ibkrPos, accountId)`**

Maps IBKR asset classes: STK (equity), OPT (option), BOND (bond), CASH (cash), CRYPTO (crypto), FUND (mutual_fund), FUT (other). Computes cost basis as `avgCost * abs(quantity)`. Stores the IBKR `conid` (contract ID) in metadata.

---

## Usage Notes

### Typical Call Patterns

**Data ingestion flow** (used by plaid-connect, alpaca-trading, ibkr-portfolio):
1. Fetch data from provider API.
2. Normalize using the appropriate normalizer functions.
3. Call `finance_upsert_snapshot` with the normalized payload and a deterministic idempotency key (e.g., `plaid:{itemId}:{cursor}`).

**Analysis flow** (used by agent for user queries):
1. Call `finance_get_state` with targeted `include` to minimize payload size.
2. Use `finance_get_transactions` for filtered, paginated transaction queries.
3. Call `finance_get_net_worth` for a computed net worth breakdown.

**Monitoring flow** (used by cron-triggered scans):
1. Call `finance_detect_anomalies` with appropriate lookback and severity filter.
2. Call `finance_subscription_tracker` to detect new or canceled subscriptions.
3. Call `finance_generate_brief` with the desired period to create a structured summary.

**Governance flow** (used before any side-effecting action):
1. Call `finance_policy_check` with the proposed action type and details.
2. Inspect `allowed`, `requiredApprovals`, and `reasonCodes`.
3. If approval is required, route through the approval workflow before executing.

### When to Use Which Tool

| Goal                                              | Tool                           |
|---------------------------------------------------|--------------------------------|
| Persist fresh data from a provider sync           | `finance_upsert_snapshot`      |
| Get a broad view of all financial data            | `finance_get_state`            |
| Search or filter specific transactions            | `finance_get_transactions`     |
| Answer "what is my net worth?"                    | `finance_get_net_worth`        |
| Find suspicious or unusual activity               | `finance_detect_anomalies`     |
| Understand spending vs. income for a period       | `finance_cash_flow_summary`    |
| Identify and track recurring charges              | `finance_subscription_tracker` |
| Generate a periodic financial report              | `finance_generate_brief`       |
| Check if a proposed action is allowed by policy   | `finance_policy_check`         |

### Important Conventions

- **Amount sign convention**: Following the Plaid convention, negative amounts represent money flowing into the user's account (income, deposits), and positive amounts represent money flowing out (expenses, charges).
- **Currency**: All monetary calculations default to `"USD"`. Multi-currency support is tracked at the entity level but aggregation assumes USD.
- **Dates**: Date-only fields use `YYYY-MM-DD` format. Timestamp fields use full ISO 8601 format.
- **Immutability**: All canonical types use `readonly` properties. Normalizer functions return new objects and never mutate inputs.

---

## Cross-References

- **Canonical type definitions**: `extensions/finance-core/src/types.ts` -- full TypeScript interfaces for all data models (Account, Transaction, Position, Liability, TaxState, Snapshot, Anomaly, Subscription, PolicyRule, and all tool input/output contracts).
- **Architecture design**: `~/.agents/skills/personal-finance/skill-architecture-design.md` -- overall skill pack architecture, extension composition model, data flow diagrams, and build plan.
- **OpenClaw extension patterns**: `references/api-openclaw-extension-patterns.md` -- plugin manifest format, tool registration, hook lifecycle, cron configuration.
- **OpenClaw framework**: `references/api-openclaw-framework.md` -- gateway architecture, session management, channel configuration.
- **Data models and schemas**: `references/data-models-and-schemas.md` (planned) -- canonical JSON schemas with versioning and backward compatibility rules.
- **Risk and policy guardrails**: `references/risk-and-policy-guardrails.md` (planned) -- approval tiers, disallowed action classes, evidence/citation minimums.
