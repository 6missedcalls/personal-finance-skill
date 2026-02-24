# Personal Finance Skill -- Canonical Data Models & Schemas

> **Last updated:** 2026-02-23
> **Source files:**
> - `extensions/finance-core/src/types.ts` -- canonical models, derived types, tool contracts
> - `extensions/tax-engine/src/types.ts` -- tax form schemas, tax strategy types
> - `extensions/market-intel/src/types.ts` -- market intelligence provider types
> - `extensions/social-sentiment/src/types.ts` -- social sentiment provider types

All provider-specific data (Plaid, Alpaca, IBKR) is normalized into the canonical types defined in `finance-core`. The `tax-engine` extension defines additional types for IRS form parsing (15 forms), tax liability computation, tax-loss harvesting, and quarterly estimate planning. The `market-intel` extension defines types for financial news, SEC filings, economic indicators, and analyst data. The `social-sentiment` extension defines types for social media sentiment from StockTwits, X/Twitter, and Quiver Quantitative. Every interface uses `readonly` properties to enforce immutability.

---

## Table of Contents

1. [Enums & Literal Types](#1-enums--literal-types)
2. [Core Entities](#2-core-entities)
3. [Tax Entities](#3-tax-entities)
4. [Snapshot & Storage Model](#4-snapshot--storage-model)
5. [Derived / Computed Types](#5-derived--computed-types)
6. [Policy Types](#6-policy-types)
7. [Tax Form Schemas](#7-tax-form-schemas)
8. [Tax Strategy Types](#8-tax-strategy-types)
9. [Tool Input/Output Contracts](#9-tool-inputoutput-contracts)
10. [Normalization Mappings](#10-normalization-mappings)
11. [Cross-References](#11-cross-references)

---

## 1. Enums & Literal Types

All enums are TypeScript string literal union types. No runtime enum objects exist.

### finance-core enums

| Type | Values | Purpose |
|------|--------|---------|
| `DataSource` | `"plaid"` \| `"alpaca"` \| `"ibkr"` \| `"tax"` \| `"manual"` \| `"finnhub"` \| `"sec"` \| `"fred"` \| `"bls"` \| `"stocktwits"` \| `"x"` | Identifies the upstream provider that produced a record |
| `AccountType` | `"depository"` \| `"credit"` \| `"loan"` \| `"investment"` \| `"brokerage"` \| `"retirement"` \| `"mortgage"` \| `"other"` | Broad classification of financial account |
| `AccountSubtype` | `"checking"` \| `"savings"` \| `"money_market"` \| `"cd"` \| `"credit_card"` \| `"auto_loan"` \| `"student_loan"` \| `"personal_loan"` \| `"mortgage_30"` \| `"mortgage_15"` \| `"heloc"` \| `"ira_traditional"` \| `"ira_roth"` \| `"401k"` \| `"brokerage_taxable"` \| `"brokerage_margin"` \| `"hsa"` \| `"529"` \| `"other"` | Granular account classification |
| `TransactionStatus` | `"posted"` \| `"pending"` \| `"canceled"` | Lifecycle state of a transaction |
| `TransactionCategory` | `"income"` \| `"transfer"` \| `"payment"` \| `"food_and_drink"` \| `"shopping"` \| `"transportation"` \| `"housing"` \| `"utilities"` \| `"healthcare"` \| `"entertainment"` \| `"education"` \| `"personal_care"` \| `"travel"` \| `"fees"` \| `"taxes"` \| `"investment"` \| `"subscription"` \| `"other"` | Spending/income classification |
| `HoldingType` | `"equity"` \| `"etf"` \| `"mutual_fund"` \| `"bond"` \| `"option"` \| `"crypto"` \| `"cash"` \| `"other"` | Security/asset classification |
| `PolicyActionType` | `"trade"` \| `"transfer"` \| `"tax_move"` \| `"notification"` \| `"rebalance"` | Actions that policy rules govern |
| `ApprovalLevel` | `"none"` \| `"user"` \| `"advisor"` | Who must approve a policy-gated action |
| `AnomalySeverity` | `"low"` \| `"medium"` \| `"high"` \| `"critical"` | Severity of detected anomaly |
| `AnomalyType` | `"large_transaction"` \| `"unusual_merchant"` \| `"balance_drop"` \| `"duplicate_charge"` \| `"new_recurring_charge"` \| `"missing_expected_deposit"` \| `"unusual_location"` \| `"fee_spike"` | Classification of anomaly pattern |
| `BriefPeriod` | `"daily"` \| `"weekly"` \| `"monthly"` \| `"quarterly"` | Report cadence for financial briefs |

### tax-engine enums

| Type | Values | Purpose |
|------|--------|---------|
| `FilingStatus` | `"single"` \| `"married_filing_jointly"` \| `"married_filing_separately"` \| `"head_of_household"` | IRS filing status |
| `GainType` | `"short_term"` \| `"long_term"` | Capital gain holding period classification |
| `LotSelectionMethod` | `"fifo"` \| `"lifo"` \| `"specific_id"` | Method for selecting tax lots to sell |

---

## 2. Core Entities

These are the canonical representations that all provider data normalizes into. Defined in `finance-core/src/types.ts`.

### Account

Represents any financial account across all providers.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Internal canonical ID (prefixed `acct_`) |
| `source` | `DataSource` | No | Provider that owns this account |
| `sourceAccountId` | `string` | No | ID in the upstream provider's system |
| `institutionId` | `string` | No | Institution identifier |
| `institutionName` | `string` | No | Human-readable institution name (e.g., "Chase", "Alpaca (paper)", "Interactive Brokers") |
| `name` | `string` | No | User-facing account name |
| `officialName` | `string \| null` | Yes | Official account name from the institution |
| `type` | `AccountType` | No | Broad account category |
| `subtype` | `AccountSubtype` | No | Granular account type |
| `balances` | `AccountBalances` | No | Current balance information |
| `currency` | `string` | No | ISO 4217 currency code (defaults to `"USD"`) |
| `lastSyncedAt` | `string` | No | ISO 8601 timestamp of last sync |
| `isActive` | `boolean` | No | Whether the account is active |
| `metadata` | `Record<string, unknown>` | No | Provider-specific fields preserved as-is |

### AccountBalances

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `current` | `number` | No | Current balance |
| `available` | `number \| null` | Yes | Available balance (null for investment accounts) |
| `limit` | `number \| null` | Yes | Credit limit (null for non-credit accounts) |
| `lastUpdated` | `string` | No | ISO 8601 timestamp |

### Transaction

Represents a financial transaction from any source.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Internal canonical ID |
| `accountId` | `string` | No | References the canonical `Account.id` |
| `source` | `DataSource` | No | Provider origin |
| `sourceTransactionId` | `string` | No | ID in the upstream provider's system |
| `date` | `string` | No | Transaction date (ISO 8601 date) |
| `authorizedDate` | `string \| null` | Yes | Date the transaction was authorized |
| `amount` | `number` | No | Transaction amount (positive = debit/spend, follows Plaid convention) |
| `currency` | `string` | No | ISO 4217 currency code |
| `name` | `string` | No | Transaction description |
| `merchantName` | `string \| null` | Yes | Cleaned merchant name |
| `category` | `TransactionCategory` | No | Canonical spending category |
| `subcategory` | `string \| null` | Yes | Finer-grained category label |
| `status` | `TransactionStatus` | No | Posted, pending, or canceled |
| `isRecurring` | `boolean` | No | Whether detected as recurring |
| `recurringGroupId` | `string \| null` | Yes | Groups related recurring charges |
| `counterpartyName` | `string \| null` | Yes | Name of the other party |
| `paymentChannel` | `string \| null` | Yes | Channel (e.g., "in_store", "online") |
| `location` | `TransactionLocation \| null` | Yes | Geographic location if available |
| `metadata` | `Record<string, unknown>` | No | Provider-specific fields |

### TransactionLocation

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `city` | `string \| null` | Yes | City name |
| `region` | `string \| null` | Yes | State/region code |
| `country` | `string \| null` | Yes | Country code |
| `postalCode` | `string \| null` | Yes | Postal/ZIP code |

### Position

Represents a securities holding in an investment or brokerage account.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Internal canonical ID |
| `accountId` | `string` | No | References the canonical `Account.id` |
| `source` | `DataSource` | No | Provider origin |
| `symbol` | `string` | No | Ticker symbol |
| `name` | `string` | No | Security name |
| `holdingType` | `HoldingType` | No | Asset class |
| `quantity` | `number` | No | Number of shares/units held |
| `costBasis` | `number \| null` | Yes | Total cost basis |
| `costBasisPerShare` | `number \| null` | Yes | Cost basis per share |
| `currentPrice` | `number` | No | Latest market price |
| `marketValue` | `number` | No | Current market value (`quantity * currentPrice`) |
| `unrealizedGainLoss` | `number \| null` | Yes | Unrealized P&L in currency units |
| `unrealizedGainLossPercent` | `number \| null` | Yes | Unrealized P&L as a decimal percentage |
| `currency` | `string` | No | ISO 4217 currency code |
| `lastUpdated` | `string` | No | ISO 8601 timestamp |
| `taxLots` | `ReadonlyArray<TaxLot>` | No | Individual tax lots for this position |
| `metadata` | `Record<string, unknown>` | No | Provider-specific fields |

### TaxLot (finance-core)

A simplified tax lot attached to a `Position`. For detailed lot tracking with wash sale adjustments, see the `TaxLot` type in the tax-engine section.

| Field | Type | Description |
|-------|------|-------------|
| `acquiredDate` | `string` | ISO 8601 date the lot was acquired |
| `quantity` | `number` | Number of shares in this lot |
| `costBasis` | `number` | Total cost basis for this lot |
| `isLongTerm` | `boolean` | `true` if held > 1 year |

### Liability

Represents a debt obligation (credit card, mortgage, loan).

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `id` | `string` | No | Internal canonical ID |
| `accountId` | `string` | No | References the canonical `Account.id` |
| `source` | `DataSource` | No | Provider origin |
| `type` | `"credit"` \| `"mortgage"` \| `"student"` \| `"auto"` \| `"personal"` \| `"other"` | No | Liability category |
| `originalPrincipal` | `number \| null` | Yes | Original loan amount |
| `currentBalance` | `number` | No | Outstanding balance |
| `interestRate` | `number \| null` | Yes | Annual interest rate (e.g., `22.99` for 22.99%) |
| `minimumPayment` | `number \| null` | Yes | Minimum monthly payment |
| `nextPaymentDate` | `string \| null` | Yes | Next due date (ISO 8601 date) |
| `currency` | `string` | No | ISO 4217 currency code |
| `lastUpdated` | `string` | No | ISO 8601 timestamp |
| `metadata` | `Record<string, unknown>` | No | Provider-specific fields |

---

## 3. Tax Entities

These types live in `finance-core/src/types.ts` and represent the normalized tax state. They are populated by the `tax-engine` extension after parsing tax documents.

### TaxState

Top-level container for a user's tax situation in a given year.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `taxYear` | `number` | No | Tax year (e.g., `2025`) |
| `filingStatus` | `string \| null` | Yes | Filing status if known |
| `documents` | `ReadonlyArray<TaxDocument>` | No | Parsed tax documents |
| `facts` | `ReadonlyArray<TaxFact>` | No | Individual data points extracted from documents |
| `estimatedLiability` | `TaxLiabilityEstimate \| null` | Yes | Computed liability estimate |
| `lastUpdated` | `string` | No | ISO 8601 timestamp |

### TaxDocument

A parsed tax form (W-2, 1099-B, etc.).

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique document ID |
| `taxYear` | `number` | Tax year the form covers |
| `formType` | `string` | Form identifier (e.g., `"W-2"`, `"1099-B"`, `"K-1"`) |
| `source` | `string` | Where the document came from (e.g., `"upload"`, `"plaid"`) |
| `extractedAt` | `string` | ISO 8601 timestamp of extraction |
| `confidence` | `number` | Extraction confidence score (0.0 -- 1.0) |
| `fields` | `Record<string, unknown>` | All extracted key-value pairs from the form |

### TaxFact

A single data point extracted from a tax document, tied to a specific form line.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique fact ID |
| `taxYear` | `number` | Tax year |
| `formType` | `string` | Source form type |
| `lineNumber` | `string` | Line or box number on the form |
| `fieldName` | `string` | Human-readable field name |
| `value` | `number \| string` | Extracted value |
| `confidence` | `number` | Extraction confidence (0.0 -- 1.0) |
| `sourceDocumentId` | `string` | References `TaxDocument.id` |

### TaxLiabilityEstimate

A high-level tax liability estimate stored in the canonical state.

| Field | Type | Description |
|-------|------|-------------|
| `federal` | `number` | Estimated federal tax |
| `state` | `number` | Estimated state tax |
| `total` | `number` | Total estimated tax (`federal + state`) |
| `effectiveRate` | `number` | Effective tax rate as a decimal |
| `assumptions` | `ReadonlyArray<string>` | List of assumptions used in the estimate |
| `computedAt` | `string` | ISO 8601 timestamp |

---

## 4. Snapshot & Storage Model

The snapshot model provides idempotent, versioned ingestion of financial data. Each sync from a provider produces a `Snapshot`. Snapshots are merged into the unified `FinancialState`.

### Snapshot

| Field | Type | Description |
|-------|------|-------------|
| `snapshotId` | `string` | Unique snapshot identifier |
| `userId` | `string` | User who owns this data |
| `source` | `DataSource` | Provider that produced the snapshot |
| `asOf` | `string` | ISO 8601 timestamp -- the point in time this snapshot represents |
| `contentSha256` | `string` | SHA-256 hash of the payload for deduplication |
| `idempotencyKey` | `string` | Caller-provided key to prevent duplicate writes |
| `payload` | `SnapshotPayload` | The actual financial data |
| `createdAt` | `string` | ISO 8601 timestamp of snapshot creation |

**Idempotency:** If a snapshot is upserted with an `idempotencyKey` that already exists, the write is a no-op and the existing snapshot is returned. The `contentSha256` field enables detecting whether the data has actually changed between syncs.

### SnapshotPayload

All fields are optional. A snapshot may contain any combination of entity arrays.

| Field | Type | Description |
|-------|------|-------------|
| `accounts` | `ReadonlyArray<Account>` | Account records from this sync |
| `transactions` | `ReadonlyArray<Transaction>` | Transaction records |
| `positions` | `ReadonlyArray<Position>` | Investment positions |
| `liabilities` | `ReadonlyArray<Liability>` | Debt/liability records |
| `tax` | `TaxState` | Tax state data |

### FinancialState

The unified, materialized view of a user's complete financial picture. Assembled by merging all snapshots.

| Field | Type | Description |
|-------|------|-------------|
| `stateVersion` | `string` | Version identifier for the state shape |
| `userId` | `string` | User who owns this state |
| `asOf` | `string` | ISO 8601 timestamp of the state |
| `accounts` | `ReadonlyArray<Account>` | All accounts across providers |
| `transactions` | `ReadonlyArray<Transaction>` | All transactions across providers |
| `positions` | `ReadonlyArray<Position>` | All investment positions across providers |
| `liabilities` | `ReadonlyArray<Liability>` | All liabilities across providers |
| `tax` | `TaxState \| null` | Tax state (null if no tax data ingested) |

---

## 5. Derived / Computed Types

These types are computed from the core entities by the finance-core tools. They are output-only -- never stored as snapshots.

### NetWorthBreakdown

| Field | Type | Description |
|-------|------|-------------|
| `totalAssets` | `number` | Sum of all asset balances and market values |
| `totalLiabilities` | `number` | Sum of all liability balances |
| `netWorth` | `number` | `totalAssets - totalLiabilities` |
| `currency` | `string` | ISO 4217 currency code |
| `asOf` | `string` | ISO 8601 timestamp |
| `byCategory` | `ReadonlyArray<NetWorthCategory>` | Breakdown by `AccountType` |
| `byAccount` | `ReadonlyArray<NetWorthAccountEntry>` | Breakdown by individual account |

### NetWorthCategory

| Field | Type | Description |
|-------|------|-------------|
| `category` | `AccountType` | Account type category |
| `totalValue` | `number` | Sum of balances in this category |
| `accountCount` | `number` | Number of accounts in this category |

### NetWorthAccountEntry

| Field | Type | Description |
|-------|------|-------------|
| `accountId` | `string` | Canonical account ID |
| `accountName` | `string` | Account display name |
| `institutionName` | `string` | Institution name |
| `type` | `AccountType` | Account type |
| `balance` | `number` | Current balance |
| `isLiability` | `boolean` | `true` if this account represents a liability |

### Anomaly

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Anomaly identifier |
| `type` | `AnomalyType` | Classification of the anomaly pattern |
| `severity` | `AnomalySeverity` | Severity level |
| `title` | `string` | Short title for display |
| `description` | `string` | Detailed description |
| `detectedAt` | `string` | ISO 8601 timestamp |
| `relatedEntityId` | `string` | ID of the related transaction, account, or position |
| `relatedEntityType` | `"transaction"` \| `"account"` \| `"position"` | Entity type of the related record |
| `dataPoints` | `Record<string, unknown>` | Supporting data for the anomaly |

### CashFlowSummary

| Field | Type | Description |
|-------|------|-------------|
| `period` | `{ start: string; end: string }` | Date range (ISO 8601 dates) |
| `totalIncome` | `number` | Total income in the period |
| `totalExpenses` | `number` | Total expenses in the period |
| `netCashFlow` | `number` | `totalIncome - totalExpenses` |
| `currency` | `string` | ISO 4217 currency code |
| `incomeByCategory` | `ReadonlyArray<CategoryAmount>` | Income breakdown |
| `expensesByCategory` | `ReadonlyArray<CategoryAmount>` | Expense breakdown |
| `topMerchants` | `ReadonlyArray<MerchantSpend>` | Highest-spend merchants |
| `savingsRate` | `number` | `netCashFlow / totalIncome` as a decimal |

### CategoryAmount

| Field | Type | Description |
|-------|------|-------------|
| `category` | `TransactionCategory` | Spending category |
| `amount` | `number` | Total amount |
| `transactionCount` | `number` | Number of transactions |
| `percentOfTotal` | `number` | Fraction of total (0.0 -- 1.0) |

### MerchantSpend

| Field | Type | Description |
|-------|------|-------------|
| `merchantName` | `string` | Merchant display name |
| `totalAmount` | `number` | Total spend at this merchant |
| `transactionCount` | `number` | Number of transactions |

### Subscription

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Subscription identifier |
| `merchantName` | `string` | Merchant name |
| `estimatedAmount` | `number` | Estimated charge amount |
| `frequency` | `"weekly"` \| `"biweekly"` \| `"monthly"` \| `"quarterly"` \| `"annual"` | Billing frequency |
| `currency` | `string` | ISO 4217 currency code |
| `category` | `TransactionCategory` | Spending category |
| `lastChargeDate` | `string` | Date of last observed charge |
| `nextExpectedDate` | `string \| null` | Projected next charge date |
| `accountId` | `string` | Account where charges appear |
| `transactionIds` | `ReadonlyArray<string>` | Transaction IDs that form this subscription |
| `isActive` | `boolean` | Whether the subscription appears active |
| `confidenceScore` | `number` | Detection confidence (0.0 -- 1.0) |

### SubscriptionSummary

| Field | Type | Description |
|-------|------|-------------|
| `activeSubscriptions` | `ReadonlyArray<Subscription>` | Currently active subscriptions |
| `totalMonthlyEstimate` | `number` | Estimated total monthly cost |
| `totalAnnualEstimate` | `number` | Estimated total annual cost |
| `currency` | `string` | ISO 4217 currency code |
| `newSinceLastCheck` | `ReadonlyArray<Subscription>` | Newly detected subscriptions |
| `canceledSinceLastCheck` | `ReadonlyArray<Subscription>` | Recently canceled subscriptions |

### FinancialBrief

| Field | Type | Description |
|-------|------|-------------|
| `period` | `BriefPeriod` | Report period (`"daily"`, `"weekly"`, etc.) |
| `generatedAt` | `string` | ISO 8601 timestamp |
| `sections` | `ReadonlyArray<BriefSection>` | Narrative sections |
| `actionItems` | `ReadonlyArray<BriefActionItem>` | Recommended actions |
| `highlights` | `ReadonlyArray<string>` | Key highlights as short strings |

### BriefSection

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Section heading |
| `content` | `string` | Narrative content |
| `dataPoints` | `Record<string, unknown>` | Structured data supporting the section |

### BriefActionItem

| Field | Type | Description |
|-------|------|-------------|
| `priority` | `"low"` \| `"medium"` \| `"high"` | Action priority |
| `title` | `string` | Short action title |
| `description` | `string` | Detailed description |
| `actionType` | `PolicyActionType \| null` | Related policy action type, if applicable |

---

## 6. Policy Types

The policy system governs automated actions. Rules define conditions under which an action requires approval or is blocked entirely.

### PolicyRule

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Rule identifier |
| `name` | `string` | Human-readable rule name |
| `actionType` | `PolicyActionType` | Type of action this rule applies to |
| `conditions` | `ReadonlyArray<PolicyCondition>` | All conditions must match for the rule to trigger |
| `requiredApproval` | `ApprovalLevel` | Approval needed when this rule matches |
| `isActive` | `boolean` | Whether this rule is currently enforced |

### PolicyCondition

| Field | Type | Description |
|-------|------|-------------|
| `field` | `string` | Dot-path to the field being evaluated (e.g., `"amount"`, `"position.marketValue"`) |
| `operator` | `"gt"` \| `"lt"` \| `"gte"` \| `"lte"` \| `"eq"` \| `"neq"` \| `"in"` \| `"not_in"` | Comparison operator |
| `value` | `unknown` | Value to compare against |

### PolicyCheckResult

| Field | Type | Description |
|-------|------|-------------|
| `allowed` | `boolean` | Whether the action is permitted |
| `reasonCodes` | `ReadonlyArray<string>` | Codes explaining the decision |
| `matchedRules` | `ReadonlyArray<string>` | IDs of rules that matched |
| `requiredApprovals` | `ReadonlyArray<ApprovalLevel>` | Approval levels needed to proceed |

---

## 7. Tax Form Schemas

Defined in `tax-engine/src/types.ts`. These types map directly to IRS tax forms. Each field is annotated with its corresponding box number.

### Form1099B

Reporting of proceeds from broker and barter exchange transactions.

**Header fields:** `payerName`, `payerTin`, `recipientName`, `recipientTin`, `accountNumber`, `taxYear`

**Transactions** (`ReadonlyArray<Form1099BTransaction>`):

| Field | Box | Type | Description |
|-------|-----|------|-------------|
| `description` | 1a | `string` | Description of property |
| `dateAcquired` | 1b | `string \| null` | Acquisition date (null if "various") |
| `dateSold` | 1c | `string` | Sale date |
| `proceeds` | 1d | `number` | Gross proceeds |
| `costBasis` | 1e | `number` | Cost or other basis |
| `accruedMarketDiscount` | 1f | `number` | Accrued market discount |
| `washSaleLossDisallowed` | 1g | `number` | Wash sale loss disallowed |
| `gainType` | 2 | `GainType` | Short-term or long-term |
| `basisReportedToIrs` | 3 | `boolean` | Whether cost basis was reported to the IRS |
| `federalTaxWithheld` | 4 | `number` | Federal income tax withheld |
| `noncoveredSecurity` | 5 | `boolean` | Noncovered security flag |
| `reportedGrossOrNet` | 6 | `"gross"` \| `"net"` | Gross or net proceeds |
| `lossNotAllowed` | 7 | `number` | Loss not allowed based on amount in 1d |
| `section1256ProfitLoss` | 8 | `number` | Profit or loss on Section 1256 contracts |
| `section1256UnrealizedPl` | 9 | `number` | Unrealized P&L on open Section 1256 contracts |
| `section1256BasisOfPositions` | 10 | `number` | Basis of Section 1256 positions |

### Form1099DIV

Reporting of dividends and distributions.

**Header fields:** `payerName`, `payerTin`, `recipientName`, `recipientTin`, `accountNumber`, `taxYear`

| Field | Box | Type | Description |
|-------|-----|------|-------------|
| `totalOrdinaryDividends` | 1a | `number` | Total ordinary dividends |
| `qualifiedDividends` | 1b | `number` | Qualified dividends (taxed at capital gains rate) |
| `totalCapitalGainDistributions` | 2a | `number` | Total capital gain distributions |
| `unrecapSec1250Gain` | 2b | `number` | Unrecaptured Section 1250 gain |
| `section1202Gain` | 2c | `number` | Section 1202 gain |
| `collectibles28RateGain` | 2d | `number` | Collectibles (28%) rate gain |
| `nondividendDistributions` | 3 | `number` | Nondividend distributions (return of capital) |
| `federalTaxWithheld` | 4 | `number` | Federal income tax withheld |
| `section199aDividends` | 5 | `number` | Section 199A dividends |
| `foreignTaxPaid` | 7 | `number` | Foreign tax paid |
| `foreignCountry` | 8 | `string` | Foreign country or U.S. possession |
| `cashLiquidationDistributions` | 9 | `number` | Cash liquidation distributions |
| `noncashLiquidationDistributions` | 10 | `number` | Noncash liquidation distributions |
| `exemptInterestDividends` | 11 | `number` | Exempt-interest dividends |
| `privateActivityBondInterest` | 12 | `number` | Specified private activity bond interest dividends |

### Form1099INT

Reporting of interest income.

**Header fields:** `payerName`, `payerTin`, `recipientName`, `recipientTin`, `accountNumber`, `taxYear`

| Field | Box | Type | Description |
|-------|-----|------|-------------|
| `interestIncome` | 1 | `number` | Interest income |
| `earlyWithdrawalPenalty` | 2 | `number` | Early withdrawal penalty |
| `usSavingsBondInterest` | 3 | `number` | Interest on U.S. Savings Bonds and Treasury obligations |
| `federalTaxWithheld` | 4 | `number` | Federal income tax withheld |
| `investmentExpenses` | 5 | `number` | Investment expenses |
| `foreignTaxPaid` | 6 | `number` | Foreign tax paid |
| `foreignCountry` | 7 | `string` | Foreign country or U.S. possession |
| `taxExemptInterest` | 8 | `number` | Tax-exempt interest |
| `privateActivityBondInterest` | 9 | `number` | Specified private activity bond interest |
| `marketDiscount` | 10 | `number` | Market discount |
| `bondPremium` | 11 | `number` | Bond premium |
| `bondPremiumTreasury` | 12 | `number` | Bond premium on Treasury obligations |
| `bondPremiumTaxExempt` | 13 | `number` | Bond premium on tax-exempt bond |

### FormW2

Wage and tax statement.

**Header fields:** `employerName`, `employerEin`, `employeeName`, `employeeSsn`, `taxYear`

| Field | Box | Type | Description |
|-------|-----|------|-------------|
| `wagesTipsOtherComp` | 1 | `number` | Wages, tips, other compensation |
| `federalTaxWithheld` | 2 | `number` | Federal income tax withheld |
| `socialSecurityWages` | 3 | `number` | Social security wages |
| `socialSecurityTaxWithheld` | 4 | `number` | Social security tax withheld |
| `medicareWagesAndTips` | 5 | `number` | Medicare wages and tips |
| `medicareTaxWithheld` | 6 | `number` | Medicare tax withheld |
| `socialSecurityTips` | 7 | `number` | Social security tips |
| `allocatedTips` | 8 | `number` | Allocated tips |
| `dependentCareBenefits` | 10 | `number` | Dependent care benefits |
| `nonqualifiedPlans` | 11 | `number` | Nonqualified plans |
| `box12Codes` | 12 | `ReadonlyArray<W2Box12Entry>` | Box 12 coded entries (see below) |
| `statutoryEmployee` | 13 | `boolean` | Statutory employee checkbox |
| `retirementPlan` | 13 | `boolean` | Retirement plan checkbox |
| `thirdPartySickPay` | 13 | `boolean` | Third-party sick pay checkbox |
| `other` | 14 | `string` | Other information |
| `stateWages` | 16 | `number` | State wages, tips, etc. |
| `stateIncomeTax` | 17 | `number` | State income tax |
| `localWages` | 18 | `number` | Local wages, tips, etc. |
| `localIncomeTax` | 19 | `number` | Local income tax |
| `localityName` | 20 | `string` | Locality name |

**W2Box12Entry:** `{ code: string, amount: number }` -- Common codes include D (401k), W (HSA), DD (health insurance cost).

### FormK1

Schedule K-1 for partnership income.

**Header fields:** `partnershipName`, `partnershipEin`, `partnerName`, `partnerTin`, `taxYear`

| Field | Type | Description |
|-------|------|-------------|
| `partnerType` | `"general"` \| `"limited"` \| `"llc_member"` | Type of partner |
| `profitSharingPercent` | `number` | Partner's share of profit |
| `lossSharingPercent` | `number` | Partner's share of loss |
| `capitalSharingPercent` | `number` | Partner's share of capital |
| `beginningCapitalAccount` | `number` | Beginning capital account balance |
| `endingCapitalAccount` | `number` | Ending capital account balance |
| `ordinaryBusinessIncomeLoss` | `number` | Ordinary business income (loss) |
| `netRentalRealEstateIncomeLoss` | `number` | Net rental real estate income (loss) |
| `otherNetRentalIncomeLoss` | `number` | Other net rental income (loss) |
| `guaranteedPayments` | `number` | Guaranteed payments |
| `interestIncome` | `number` | Interest income |
| `ordinaryDividends` | `number` | Ordinary dividends |
| `qualifiedDividends` | `number` | Qualified dividends |
| `netShortTermCapitalGainLoss` | `number` | Net short-term capital gain (loss) |
| `netLongTermCapitalGainLoss` | `number` | Net long-term capital gain (loss) |
| `section1231GainLoss` | `number` | Net Section 1231 gain (loss) |
| `otherIncome` | `number` | Other income (loss) |
| `section179Deduction` | `number` | Section 179 deduction |
| `otherDeductions` | `number` | Other deductions |
| `selfEmploymentEarnings` | `number` | Self-employment earnings (loss) |

### Form1040

Main individual income tax return (Form 1040).

**Header fields:** `filingStatus`, `taxYear`, `firstName`, `lastName`, `ssn`

| Field | Line | Type | Description |
|-------|------|------|-------------|
| `wages` | 1a | `number` | Wages, salaries, tips |
| `taxExemptInterest` | 2a | `number` | Tax-exempt interest |
| `taxableInterest` | 2b | `number` | Taxable interest |
| `qualifiedDividends` | 3a | `number` | Qualified dividends |
| `ordinaryDividends` | 3b | `number` | Ordinary dividends |
| `iraDistributions` | 4a | `number` | IRA distributions |
| `taxableIraDistributions` | 4b | `number` | Taxable IRA distributions |
| `pensions` | 5a | `number` | Pensions and annuities |
| `taxablePensions` | 5b | `number` | Taxable pensions |
| `socialSecurity` | 6a | `number` | Social security benefits |
| `taxableSocialSecurity` | 6b | `number` | Taxable social security |
| `capitalGainOrLoss` | 7 | `number` | Capital gain or loss |
| `otherIncome` | 8 | `number` | Other income |
| `totalIncome` | 9 | `number` | Total income |
| `adjustmentsToIncome` | 10 | `number` | Adjustments to income |
| `adjustedGrossIncome` | 11 | `number` | AGI |
| `standardOrItemizedDeduction` | 12 | `number` | Standard or itemized deduction |
| `qualifiedBusinessDeduction` | 13 | `number` | Qualified business income deduction |
| `totalDeductions` | 14 | `number` | Total deductions |
| `taxableIncome` | 15 | `number` | Taxable income |
| `totalTax` | 24 | `number` | Total tax |
| `totalPayments` | 33 | `number` | Total payments |
| `amountOwed` | 37 | `number` | Amount owed |
| `overpaid` | 34 | `number` | Amount overpaid |

### ScheduleA

Itemized deductions.

| Field | Line | Type | Description |
|-------|------|------|-------------|
| `medicalAndDentalExpenses` | 1 | `number` | Medical and dental expenses |
| `medicalThreshold` | 3 | `number` | 7.5% of AGI threshold |
| `deductibleMedical` | 4 | `number` | Deductible medical expenses |
| `stateAndLocalTaxes` | 5a-5d | `number` | State and local taxes |
| `saltDeductionCapped` | 5e | `number` | SALT deduction (capped at $10,000) |
| `homeInterest` | 8a-8c | `number` | Home mortgage interest |
| `charitableCashContributions` | 11 | `number` | Charitable cash contributions |
| `charitableNonCash` | 12 | `number` | Charitable non-cash contributions |
| `charitableCarryover` | 13 | `number` | Charitable carryover from prior year |
| `totalCharitable` | 14 | `number` | Total charitable deductions |
| `casualtyAndTheftLosses` | 15 | `number` | Casualty and theft losses |
| `otherItemizedDeductions` | 16 | `number` | Other itemized deductions |
| `totalItemizedDeductions` | 17 | `number` | Total itemized deductions |

### ScheduleB

Interest and ordinary dividends.

| Field | Type | Description |
|-------|------|-------------|
| `interestPayors` | `ReadonlyArray<{ name: string; amount: number }>` | Interest payor list |
| `totalInterest` | `number` | Total interest income |
| `dividendPayors` | `ReadonlyArray<{ name: string; amount: number }>` | Dividend payor list |
| `totalOrdinaryDividends` | `number` | Total ordinary dividends |
| `hasForeignAccountOrTrust` | `boolean` | Foreign account reporting flag |
| `foreignCountries` | `ReadonlyArray<string>` | Foreign countries list |

### ScheduleC

Profit or loss from business (sole proprietorship).

**Header fields:** `businessName`, `principalBusinessCode`, `businessEin`, `accountingMethod`

| Field | Type | Description |
|-------|------|-------------|
| `grossReceipts` | `number` | Gross receipts or sales |
| `returnsAndAllowances` | `number` | Returns and allowances |
| `costOfGoodsSold` | `number` | Cost of goods sold |
| `grossProfit` | `number` | Gross profit |
| `otherIncome` | `number` | Other business income |
| `grossIncome` | `number` | Gross income |
| `expenses` | `ScheduleCExpenses` | Itemized business expenses (23 categories) |
| `totalExpenses` | `number` | Total business expenses |
| `netProfitOrLoss` | `number` | Net profit or loss |

**ScheduleCExpenses** includes: `advertising`, `carAndTruckExpenses`, `commissions`, `contractLabor`, `depletion`, `depreciation`, `employeeBenefits`, `insurance`, `interestMortgage`, `interestOther`, `legalAndProfessional`, `officeExpense`, `pensionAndProfitSharing`, `rentVehicles`, `rentOther`, `repairs`, `supplies`, `taxesAndLicenses`, `travel`, `meals`, `utilities`, `wages`, `otherExpenses` -- all `number`.

### ScheduleD

Capital gains and losses (netting).

| Field | Type | Description |
|-------|------|-------------|
| `shortTermFromForm8949` | `number` | Short-term gain/loss from Form 8949 |
| `shortTermFromScheduleK1` | `number` | Short-term from Schedule K-1 |
| `shortTermCapitalLossCarryover` | `number` | Short-term capital loss carryover |
| `netShortTermGainLoss` | `number` | Net short-term gain or loss |
| `longTermFromForm8949` | `number` | Long-term gain/loss from Form 8949 |
| `longTermFromScheduleK1` | `number` | Long-term from Schedule K-1 |
| `longTermCapitalGainDistributions` | `number` | Long-term capital gain distributions |
| `longTermCapitalLossCarryover` | `number` | Long-term capital loss carryover |
| `netLongTermGainLoss` | `number` | Net long-term gain or loss |
| `netGainLoss` | `number` | Combined net gain or loss |
| `qualifiesForExceptionToForm4952` | `boolean` | Exception to Form 4952 |
| `taxComputationMethod` | `"regular"` \| `"schedule_d_worksheet"` \| `"qualified_dividends_worksheet"` | Tax computation method |

### ScheduleE

Supplemental income and loss (rental, royalty, partnerships, S corporations).

| Field | Type | Description |
|-------|------|-------------|
| `rentalProperties` | `ReadonlyArray<ScheduleERental>` | Rental property details |
| `partnershipAndSCorpIncome` | `ReadonlyArray<ScheduleEPartnership>` | Partnership/S corp details |
| `totalRentalIncomeLoss` | `number` | Total rental income or loss |
| `totalPartnershipIncomeLoss` | `number` | Total partnership income or loss |
| `totalScheduleEIncomeLoss` | `number` | Total Schedule E income or loss |

**ScheduleERental:** `propertyAddress`, `propertyType`, `personalUseDays`, `fairRentalDays`, `rentsReceived`, `expenses` (15 categories: advertising, auto, cleaning, commissions, insurance, legal, management, mortgage, otherInterest, repairs, supplies, taxes, utilities, depreciation, other), `totalExpenses`, `netIncomeLoss`.

**ScheduleEPartnership:** `entityName`, `entityEin`, `isPassiveActivity`, `ordinaryIncomeLoss`, `netRentalIncomeLoss`, `otherIncomeLoss`.

### ScheduleSE

Self-employment tax.

| Field | Type | Description |
|-------|------|-------------|
| `netEarningsFromSelfEmployment` | `number` | Net SE earnings (92.35% of Schedule C net profit) |
| `socialSecurityWageBase` | `number` | SS wage base for the tax year |
| `socialSecurityTax` | `number` | Social security tax (12.4% up to wage base) |
| `medicareTax` | `number` | Medicare tax (2.9% on all SE earnings) |
| `additionalMedicareTax` | `number` | Additional Medicare tax (0.9% over $200K/$250K) |
| `totalSelfEmploymentTax` | `number` | Total SE tax |
| `deductiblePartOfSeTax` | `number` | Deductible half of SE tax |

### Form8949

Sales and other dispositions of capital assets.

| Field | Type | Description |
|-------|------|-------------|
| `shortTermPartI` | `ReadonlyArray<Form8949Transaction>` | Short-term transactions (Part I) |
| `longTermPartII` | `ReadonlyArray<Form8949Transaction>` | Long-term transactions (Part II) |
| `totalShortTermProceeds` | `number` | Total short-term proceeds |
| `totalShortTermBasis` | `number` | Total short-term basis |
| `totalShortTermAdjustments` | `number` | Total short-term adjustments |
| `totalShortTermGainLoss` | `number` | Total short-term gain/loss |
| `totalLongTermProceeds` | `number` | Total long-term proceeds |
| `totalLongTermBasis` | `number` | Total long-term basis |
| `totalLongTermAdjustments` | `number` | Total long-term adjustments |
| `totalLongTermGainLoss` | `number` | Total long-term gain/loss |

**Form8949Transaction:** `description`, `dateAcquired` (string \| null), `dateSold`, `proceeds`, `costBasis`, `adjustmentCode`, `adjustmentAmount`, `gainOrLoss`.

### StateReturn

Generic state income tax return (supports any state form: CA 540, NY IT-201, etc.).

| Field | Type | Description |
|-------|------|-------------|
| `stateCode` | `string` | Two-letter state code (e.g., "CA", "NY") |
| `formId` | `string` | State form identifier |
| `filingStatus` | `FilingStatus` | Filing status |
| `federalAGI` | `number` | Federal AGI |
| `stateAdditions` | `number` | State additions to income |
| `stateSubtractions` | `number` | State subtractions from income |
| `stateAGI` | `number` | State AGI |
| `stateDeductions` | `number` | State deductions |
| `stateTaxableIncome` | `number` | State taxable income |
| `stateTaxComputed` | `number` | Computed state tax |
| `stateCredits` | `number` | State tax credits |
| `stateWithholding` | `number` | State tax withholding |
| `stateEstimatedPayments` | `number` | State estimated payments |
| `stateBalanceDue` | `number` | State balance due |
| `stateOverpayment` | `number` | State overpayment |

### Form6251

Alternative Minimum Tax (AMT).

| Field | Type | Description |
|-------|------|-------------|
| `taxableIncomeFromForm1040` | `number` | Taxable income from Form 1040 |
| `stateAndLocalTaxDeduction` | `number` | SALT deduction add-back |
| `taxExemptInterest` | `number` | Tax-exempt interest from private activity bonds |
| `incentiveStockOptions` | `number` | ISO bargain element |
| `otherAdjustments` | `number` | Other AMT adjustments |
| `alternativeMinimumTaxableIncome` | `number` | AMTI |
| `exemptionAmount` | `number` | AMT exemption amount |
| `amtExemptionPhaseout` | `number` | Exemption phaseout amount |
| `reducedExemption` | `number` | Reduced exemption after phaseout |
| `amtTaxableAmount` | `number` | AMT taxable amount |
| `tentativeMinimumTax` | `number` | Tentative minimum tax |
| `regularTax` | `number` | Regular tax from Form 1040 |
| `alternativeMinimumTax` | `number` | AMT = max(0, TMT - regular tax) |

---

## 8. Tax Strategy Types

Defined in `tax-engine/src/types.ts`. These types support tax-loss harvesting analysis, lot selection optimization, wash sale detection, and quarterly estimated tax planning.

### TaxLot (tax-engine)

Extended tax lot with wash sale tracking. Distinct from the simplified `TaxLot` in finance-core.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Lot identifier |
| `symbol` | `string` | Ticker symbol |
| `dateAcquired` | `string` | ISO 8601 acquisition date |
| `quantity` | `number` | Number of shares |
| `costBasisPerShare` | `number` | Per-share cost basis |
| `totalCostBasis` | `number` | Total cost basis |
| `adjustedBasis` | `number` | Basis after wash sale adjustments |
| `washSaleAdjustment` | `number` | Amount of wash sale basis adjustment |
| `accountId` | `string` | Account holding this lot |

### WashSaleViolation

| Field | Type | Description |
|-------|------|-------------|
| `soldLotId` | `string` | ID of the lot that was sold at a loss |
| `replacementLotId` | `string` | ID of the replacement lot triggering the violation |
| `symbol` | `string` | Ticker symbol |
| `saleDate` | `string` | Date the loss sale occurred |
| `replacementDate` | `string` | Date the replacement was purchased |
| `disallowedLoss` | `number` | Amount of loss disallowed |
| `basisAdjustment` | `number` | Basis increase applied to the replacement lot |

### WashSaleCheckResult

| Field | Type | Description |
|-------|------|-------------|
| `violations` | `ReadonlyArray<WashSaleViolation>` | All detected violations |
| `totalDisallowedLoss` | `number` | Sum of all disallowed losses |
| `compliant` | `boolean` | `true` if no violations detected |

### IncomeSummary

Aggregated income across all sources, used as input to the tax liability calculator.

| Field | Type | Description |
|-------|------|-------------|
| `wages` | `number` | W-2 wage income |
| `ordinaryDividends` | `number` | Total ordinary dividends |
| `qualifiedDividends` | `number` | Qualified dividends (subset of ordinary) |
| `interestIncome` | `number` | Taxable interest income |
| `taxExemptInterest` | `number` | Tax-exempt interest (informational, not taxed) |
| `shortTermGains` | `number` | Net short-term capital gains |
| `longTermGains` | `number` | Net long-term capital gains |
| `businessIncome` | `number` | K-1 / Schedule C business income |
| `rentalIncome` | `number` | Net rental income |
| `otherIncome` | `number` | All other income |
| `totalWithholding` | `number` | Total federal tax withheld across all forms |
| `estimatedPayments` | `number` | Quarterly estimated tax payments made |
| `deductions` | `number` | Total deductions (standard or itemized) |
| `foreignTaxCredit` | `number` | Foreign tax credit amount |

### TaxLiabilityResult

Full federal + state tax computation result.

| Field | Type | Description |
|-------|------|-------------|
| `taxYear` | `number` | Tax year |
| `filingStatus` | `FilingStatus` | Filing status used |
| `grossIncome` | `number` | Total gross income |
| `adjustedGrossIncome` | `number` | AGI after above-the-line deductions |
| `taxableOrdinaryIncome` | `number` | Ordinary income after deductions |
| `ordinaryTax` | `number` | Tax on ordinary income |
| `qualifiedDividendTax` | `number` | Tax on qualified dividends |
| `longTermCapitalGainsTax` | `number` | Tax on long-term capital gains |
| `netInvestmentIncomeTax` | `number` | 3.8% NIIT if applicable |
| `selfEmploymentTax` | `number` | Self-employment tax |
| `totalFederalTax` | `number` | Total federal tax |
| `stateTax` | `number` | Estimated state tax |
| `totalTax` | `number` | `totalFederalTax + stateTax` |
| `totalWithholding` | `number` | Total withholding applied |
| `estimatedPayments` | `number` | Quarterly payments applied |
| `balanceDue` | `number` | `totalTax - totalWithholding - estimatedPayments` |
| `effectiveRate` | `number` | `totalTax / grossIncome` |
| `marginalRate` | `number` | Marginal tax rate on next dollar of ordinary income |
| `assumptions` | `ReadonlyArray<string>` | Assumptions made during computation |

### TlhCandidate

A position identified as a candidate for tax-loss harvesting.

| Field | Type | Description |
|-------|------|-------------|
| `symbol` | `string` | Ticker symbol |
| `lotId` | `string` | Specific lot to sell |
| `currentPrice` | `number` | Current market price |
| `costBasis` | `number` | Lot cost basis |
| `unrealizedLoss` | `number` | Unrealized loss amount (negative) |
| `quantity` | `number` | Number of shares in the lot |
| `holdingPeriod` | `GainType` | Short-term or long-term |
| `washSaleRisk` | `boolean` | `true` if selling this lot risks a wash sale |
| `estimatedTaxSavings` | `number` | Estimated tax savings from harvesting |
| `rationale` | `string` | Human-readable explanation |

### LotSelectionResult

Result of computing optimal lots to sell for a given trade.

| Field | Type | Description |
|-------|------|-------------|
| `method` | `LotSelectionMethod` | Method used (`"fifo"`, `"lifo"`, or `"specific_id"`) |
| `selectedLots` | `ReadonlyArray<SelectedLot>` | Lots selected for sale |
| `totalProceeds` | `number` | Total sale proceeds |
| `totalBasis` | `number` | Total cost basis of selected lots |
| `totalGainLoss` | `number` | Net gain or loss |
| `shortTermGainLoss` | `number` | Short-term portion |
| `longTermGainLoss` | `number` | Long-term portion |
| `estimatedTaxImpact` | `number` | Estimated tax impact |

### SelectedLot

| Field | Type | Description |
|-------|------|-------------|
| `lotId` | `string` | Tax lot ID |
| `dateAcquired` | `string` | Acquisition date |
| `quantitySold` | `number` | Shares sold from this lot |
| `costBasisPerShare` | `number` | Per-share basis |
| `totalBasis` | `number` | Total basis for shares sold |
| `proceeds` | `number` | Sale proceeds |
| `gainLoss` | `number` | Gain or loss |
| `gainType` | `GainType` | Short-term or long-term |

### QuarterlyEstimateResult

| Field | Type | Description |
|-------|------|-------------|
| `taxYear` | `number` | Tax year |
| `quarters` | `ReadonlyArray<QuarterPayment>` | Breakdown by quarter |
| `totalEstimatedTax` | `number` | Total estimated tax for the year |
| `totalPaid` | `number` | Total quarterly payments made so far |
| `totalRemaining` | `number` | Remaining amount due |
| `safeHarborMet` | `boolean` | Whether IRS safe harbor threshold is met |
| `underpaymentRisk` | `"low"` \| `"medium"` \| `"high"` | Risk of underpayment penalty |
| `nextDueDate` | `string` | Next quarterly payment due date |
| `suggestedNextPayment` | `number` | Recommended next payment amount |

### QuarterPayment

| Field | Type | Description |
|-------|------|-------------|
| `quarter` | `1 \| 2 \| 3 \| 4` | Quarter number |
| `dueDate` | `string` | Payment due date |
| `amountDue` | `number` | Amount due for this quarter |
| `amountPaid` | `number` | Amount actually paid |
| `status` | `"paid"` \| `"due"` \| `"overdue"` \| `"upcoming"` | Payment status |

### TaxBracket

| Field | Type | Description |
|-------|------|-------------|
| `min` | `number` | Lower bound of the bracket |
| `max` | `number \| null` | Upper bound (null for the top bracket) |
| `rate` | `number` | Tax rate for this bracket |

### ScheduleDResult

Result of Schedule D capital gains computation (from `tax_compute_schedule_d`).

| Field | Type | Description |
|-------|------|-------------|
| `netShortTermGainLoss` | `number` | Net short-term gain or loss |
| `netLongTermGainLoss` | `number` | Net long-term gain or loss |
| `netCapitalGainLoss` | `number` | Combined net capital gain or loss |
| `capitalLossDeduction` | `number` | Capital loss deduction (capped at $3,000; $1,500 MFS) |
| `carryoverToNextYear` | `{ shortTerm: number; longTerm: number }` | Character-preserving carryover |
| `qualifiesForPreferentialRates` | `boolean` | Whether long-term gains qualify for preferential rates |

### StateTaxResult

Result of state tax computation (from `tax_compute_state_tax`). Supports 8 states: CA, NY, NJ (progressive), IL, PA (flat), MA (flat + millionaire's surtax), TX, FL (no income tax).

| Field | Type | Description |
|-------|------|-------------|
| `stateCode` | `string` | Two-letter state code |
| `taxableIncome` | `number` | State taxable income |
| `stateTax` | `number` | Computed state tax |
| `effectiveRate` | `number` | Effective tax rate |
| `marginalRate` | `number` | Marginal tax rate |
| `brackets` | `ReadonlyArray<{ min: number; max: number \| null; rate: number }>` | State tax brackets used |
| `notes` | `ReadonlyArray<string>` | Notable conditions (e.g., "MA millionaire's surtax applies") |

### AmtResult

Result of AMT computation (from `tax_compute_amt`). Uses 2025 parameters.

| Field | Type | Description |
|-------|------|-------------|
| `amti` | `number` | Alternative Minimum Taxable Income |
| `exemptionAmount` | `number` | AMT exemption for filing status |
| `exemptionPhaseoutStart` | `number` | Phaseout threshold for filing status |
| `reducedExemption` | `number` | Exemption after phaseout (25% reduction rate) |
| `amtBase` | `number` | AMTI minus reduced exemption |
| `tentativeMinimumTax` | `number` | TMT (26% on first $248,300; 28% above) |
| `alternativeMinimumTax` | `number` | max(0, TMT - regular tax) |
| `isSubjectToAmt` | `boolean` | Whether AMT applies |

---

## 9. Tool Input/Output Contracts

These types define the structured inputs and outputs for OpenClaw tools. All tools accept and return strict JSON.

### finance-core Tools

| Tool | Input Type | Output Type | Description |
|------|-----------|-------------|-------------|
| Upsert Snapshot | `UpsertSnapshotInput` | `UpsertSnapshotOutput` | Ingest a provider sync snapshot |
| Get State | `GetStateInput` | `FinancialState` | Retrieve unified financial state |
| Get Transactions | `GetTransactionsInput` | `GetTransactionsOutput` | Query transactions with filters |
| Get Net Worth | `GetNetWorthInput` | `NetWorthBreakdown` | Compute net worth breakdown |
| Detect Anomalies | `DetectAnomaliesInput` | `DetectAnomaliesOutput` | Scan for anomalies |
| Cash Flow | `CashFlowInput` | `CashFlowSummary` | Compute cash flow summary |
| Subscription Tracker | `SubscriptionTrackerInput` | `SubscriptionSummary` | Detect recurring subscriptions |
| Generate Brief | `GenerateBriefInput` | `FinancialBrief` | Generate a periodic financial brief |
| Policy Check | `PolicyCheckInput` | `PolicyCheckResult` | Evaluate an action against policy rules |

### tax-engine Tools (23 tools: 15 parsers + 8 calculators)

**Parsers** — all accept `ParseFormInput` and return `ParseFormOutput<T>`:

| Tool | Output Schema | Description |
|------|--------------|-------------|
| `tax_parse_w2` | `FormW2` | Parse W-2 wage and tax statement |
| `tax_parse_1099b` | `Form1099B` | Parse 1099-B broker transactions |
| `tax_parse_1099div` | `Form1099DIV` | Parse 1099-DIV dividends |
| `tax_parse_1099int` | `Form1099INT` | Parse 1099-INT interest income |
| `tax_parse_k1` | `FormK1` | Parse Schedule K-1 partnership income |
| `tax_parse_1040` | `Form1040` | Parse Form 1040 main return |
| `tax_parse_schedule_a` | `ScheduleA` | Parse Schedule A itemized deductions |
| `tax_parse_schedule_b` | `ScheduleB` | Parse Schedule B interest/dividends |
| `tax_parse_schedule_c` | `ScheduleC` | Parse Schedule C self-employment |
| `tax_parse_schedule_d` | `ScheduleD` | Parse Schedule D capital gains netting |
| `tax_parse_schedule_e` | `ScheduleE` | Parse Schedule E rental/partnership income |
| `tax_parse_schedule_se` | `ScheduleSE` | Parse Schedule SE self-employment tax |
| `tax_parse_form_8949` | `Form8949` | Parse Form 8949 capital asset dispositions |
| `tax_parse_state_return` | `StateReturn` | Parse generic state income tax return |
| `tax_parse_form_6251` | `Form6251` | Parse Form 6251 AMT |

**Calculators:**

| Tool | Input Type | Output Type | Description |
|------|-----------|-------------|-------------|
| `tax_estimate_liability` | `EstimateLiabilityInput` | `TaxLiabilityResult` | Compute estimated federal + state tax liability |
| `tax_find_tlh_candidates` | `FindTlhInput` | `ReadonlyArray<TlhCandidate>` | Identify tax-loss harvesting opportunities |
| `tax_check_wash_sales` | `CheckWashSalesInput` | `WashSaleCheckResult` | Detect wash sale violations |
| `tax_lot_selection` | `LotSelectionInput` | `LotSelectionResult` | Optimize which lots to sell |
| `tax_quarterly_estimates` | `QuarterlyEstimateInput` | `QuarterlyEstimateResult` | Plan quarterly estimated tax payments |
| `tax_compute_schedule_d` | `ScheduleDInput` | `ScheduleDResult` | Compute Schedule D capital gains netting with $3K loss cap and carryover |
| `tax_compute_state_tax` | `{ stateCode, taxableIncome, filingStatus }` | `StateTaxResult` | Compute state income tax (8 states: CA, NY, NJ, IL, PA, MA, TX, FL) |
| `tax_compute_amt` | `AmtInput` | `AmtResult` | Compute Alternative Minimum Tax with 2025 parameters |

### market-intel Tools (10 tools)

All tools are read-only. Each accepts provider-specific input and returns `ToolResult<T>`.

| Tool | Provider | Description |
|------|----------|-------------|
| `intel_company_news` | Finnhub | Company-specific news articles by ticker |
| `intel_market_news` | Finnhub | General/forex/crypto/merger market news |
| `intel_stock_fundamentals` | Finnhub | Financial statements (annual/quarterly) |
| `intel_analyst_recommendations` | Finnhub | Analyst buy/hold/sell recommendations |
| `intel_sec_filings` | SEC EDGAR | SEC filing history by company CIK |
| `intel_sec_search` | SEC EDGAR | Full-text search of SEC filings |
| `intel_fred_series` | FRED | Economic data series observations |
| `intel_fred_search` | FRED | Search for economic data series |
| `intel_bls_data` | BLS | Bureau of Labor Statistics time series |
| `intel_news_sentiment` | Alpha Vantage | News sentiment analysis by ticker/topic |

### social-sentiment Tools (6 tools)

All tools are read-only. Each accepts provider-specific input and returns `ToolResult<T>`.

| Tool | Provider | Description |
|------|----------|-------------|
| `social_stocktwits_sentiment` | StockTwits | Sentiment aggregation (bullish/bearish) for a ticker |
| `social_stocktwits_trending` | StockTwits | Trending symbols on StockTwits |
| `social_x_search` | X/Twitter | Search recent tweets with financial query |
| `social_x_user_timeline` | X/Twitter | Fetch a user's recent tweets |
| `social_x_cashtag` | X/Twitter | Cashtag search ($AAPL) with basic sentiment |
| `social_quiver_congress` | Quiver Quantitative | Congressional stock trading activity |

---

## 10. Normalization Mappings

The normalization layer converts provider-specific data formats into canonical types. Each function is a pure function (no side effects, no mutation).

| Function | Source File | Provider Input | Canonical Output | Notes |
|----------|-----------|----------------|-----------------|-------|
| `normalizePlaidAccount` | `normalization/plaid.ts` | Plaid Account object | `Account` | Accepts `institutionId` and `institutionName` as extra params |
| `normalizePlaidTransaction` | `normalization/plaid.ts` | Plaid Transaction object | `Transaction` | Accepts canonical `accountId` as extra param; maps `personal_finance_category.primary` to `TransactionCategory` |
| `normalizePlaidHolding` | `normalization/plaid.ts` | Plaid Holding + Security object | `Position` | Accepts canonical `accountId`; computes `costBasisPerShare` and `unrealizedGainLoss` |
| `normalizePlaidLiability` | `normalization/plaid.ts` | Plaid Liability object | `Liability` | Accepts canonical `accountId` |
| `normalizeAlpacaAccount` | `normalization/alpaca.ts` | Alpaca Account object | `Account` | Accepts trading mode (`"paper"` or `"live"`) to set `institutionName` |
| `normalizeAlpacaPosition` | `normalization/alpaca.ts` | Alpaca Position object | `Position` | Accepts canonical `accountId`; parses numeric strings |
| `normalizeIbkrAccount` | `normalization/ibkr.ts` | IBKR Account object | `Account` | Maps `accountType` to `AccountType`/`AccountSubtype` (e.g., `"IRA"` to `"retirement"` / `"ira_traditional"`) |
| `normalizeIbkrPosition` | `normalization/ibkr.ts` | IBKR Position object | `Position` | Accepts canonical `accountId`; maps `assetClass` (e.g., `"STK"`, `"OPT"`) to `HoldingType` |

---

## 11. Cross-References

| Document | Location | Relevance |
|----------|----------|-----------|
| Finance-Core Extension | `references/ext-finance-core.md` | 9 tools — storage, normalization, policy, briefs |
| Plaid Connect Extension | `references/ext-plaid-connect.md` | 8 tools — Plaid Link, accounts, transactions |
| Alpaca Trading Extension | `references/ext-alpaca-trading.md` | 10 tools — trading, positions, market data |
| IBKR Portfolio Extension | `references/ext-ibkr-portfolio.md` | 9 tools — portfolio, allocation, performance |
| Tax Engine Extension | `references/ext-tax-engine.md` | 23 tools — 15 parsers + 8 calculators |
| Market Intel Extension | `references/ext-market-intel.md` | 10 tools — news, SEC filings, economic data, sentiment |
| Social Sentiment Extension | `references/ext-social-sentiment.md` | 6 tools — StockTwits, X/Twitter, Quiver |
| Risk and Policy Guardrails | `references/risk-and-policy-guardrails.md` | Policy engine, approval tiers, hard rules |
| Plaid API Reference | `references/api-plaid.md` | Plaid endpoint schemas, webhook payloads, error codes |
| Alpaca Trading API Reference | `references/api-alpaca-trading.md` | Alpaca account, order, and position schemas |
| IBKR Client Portal API Reference | `references/api-ibkr-client-portal.md` | IBKR Web API endpoints and response formats |
| IRS Tax Forms & Rules | `references/api-irs-tax-forms.md` | Form field definitions, tax brackets, filing rules |
| OpenClaw Extension Patterns | `references/api-openclaw-extension-patterns.md` | How to build extensions, tool registration format |
| OpenClaw Framework | `references/api-openclaw-framework.md` | Architecture, plugin lifecycle, agent integration |
