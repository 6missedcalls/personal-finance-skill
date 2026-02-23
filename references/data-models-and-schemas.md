# Personal Finance Skill -- Canonical Data Models & Schemas

> **Last updated:** 2026-02-23
> **Source files:**
> - `extensions/finance-core/src/types.ts` -- canonical models, derived types, tool contracts
> - `extensions/tax-engine/src/types.ts` -- tax form schemas, tax strategy types

All provider-specific data (Plaid, Alpaca, IBKR) is normalized into the canonical types defined in `finance-core`. The `tax-engine` extension defines additional types for IRS form parsing, tax liability computation, tax-loss harvesting, and quarterly estimate planning. Every interface in both files uses `readonly` properties to enforce immutability.

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
| `DataSource` | `"plaid"` \| `"alpaca"` \| `"ibkr"` \| `"tax"` \| `"manual"` | Identifies the upstream provider that produced a record |
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

### tax-engine Tools

| Tool | Input Type | Output Type | Description |
|------|-----------|-------------|-------------|
| Parse Form | `ParseFormInput` | `ParseFormOutput<T>` | Parse raw tax form data into typed schema |
| Estimate Liability | `EstimateLiabilityInput` | `TaxLiabilityResult` | Compute estimated tax liability |
| Find TLH Candidates | `FindTlhInput` | `ReadonlyArray<TlhCandidate>` | Identify tax-loss harvesting opportunities |
| Check Wash Sales | `CheckWashSalesInput` | `WashSaleCheckResult` | Detect wash sale violations |
| Lot Selection | `LotSelectionInput` | `LotSelectionResult` | Optimize which lots to sell |
| Quarterly Estimates | `QuarterlyEstimateInput` | `QuarterlyEstimateResult` | Plan quarterly estimated tax payments |

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
| Plaid API Reference | `references/api-plaid.md` | Plaid endpoint schemas, webhook payloads, error codes |
| Alpaca Trading API Reference | `references/api-alpaca-trading.md` | Alpaca account, order, and position schemas |
| IBKR Client Portal API Reference | `references/api-ibkr-client-portal.md` | IBKR Web API endpoints and response formats |
| IRS Tax Forms & Rules | `references/api-irs-tax-forms.md` | Form field definitions, tax brackets, filing rules |
| OpenClaw Extension Patterns | `references/api-openclaw-extension-patterns.md` | How to build extensions, tool registration format |
| OpenClaw Framework | `references/api-openclaw-framework.md` | Architecture, plugin lifecycle, agent integration |
| Skill Architecture Design | `~/.agents/skills/personal-finance/skill-architecture-design.md` | System design, data flow diagrams, extension boundaries |
