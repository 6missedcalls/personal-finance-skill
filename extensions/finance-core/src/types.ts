// ============================================================================
// Canonical Financial Data Models
// All provider data (Plaid, Alpaca, IBKR) normalizes INTO these types.
// ============================================================================

// --- Enums & Literals ---

export type DataSource = "plaid" | "alpaca" | "ibkr" | "tax" | "manual" | "finnhub" | "sec" | "fred" | "bls" | "stocktwits" | "x"

export type AccountType =
  | "depository"
  | "credit"
  | "loan"
  | "investment"
  | "brokerage"
  | "retirement"
  | "mortgage"
  | "other"

export type AccountSubtype =
  | "checking"
  | "savings"
  | "money_market"
  | "cd"
  | "credit_card"
  | "auto_loan"
  | "student_loan"
  | "personal_loan"
  | "mortgage_30"
  | "mortgage_15"
  | "heloc"
  | "ira_traditional"
  | "ira_roth"
  | "401k"
  | "brokerage_taxable"
  | "brokerage_margin"
  | "hsa"
  | "529"
  | "other"

export type TransactionStatus = "posted" | "pending" | "canceled"

export type TransactionCategory =
  | "income"
  | "transfer"
  | "payment"
  | "food_and_drink"
  | "shopping"
  | "transportation"
  | "housing"
  | "utilities"
  | "healthcare"
  | "entertainment"
  | "education"
  | "personal_care"
  | "travel"
  | "fees"
  | "taxes"
  | "investment"
  | "subscription"
  | "other"

export type HoldingType = "equity" | "etf" | "mutual_fund" | "bond" | "option" | "crypto" | "cash" | "other"

export type PolicyActionType = "trade" | "transfer" | "tax_move" | "notification" | "rebalance"

export type ApprovalLevel = "none" | "user" | "advisor"

export type AnomalySeverity = "low" | "medium" | "high" | "critical"

export type BriefPeriod = "daily" | "weekly" | "monthly" | "quarterly"

// --- Core Entities ---

export interface Account {
  readonly id: string
  readonly source: DataSource
  readonly sourceAccountId: string
  readonly institutionId: string
  readonly institutionName: string
  readonly name: string
  readonly officialName: string | null
  readonly type: AccountType
  readonly subtype: AccountSubtype
  readonly balances: AccountBalances
  readonly currency: string
  readonly lastSyncedAt: string
  readonly isActive: boolean
  readonly metadata: Record<string, unknown>
}

export interface AccountBalances {
  readonly current: number
  readonly available: number | null
  readonly limit: number | null
  readonly lastUpdated: string
}

export interface Transaction {
  readonly id: string
  readonly accountId: string
  readonly source: DataSource
  readonly sourceTransactionId: string
  readonly date: string
  readonly authorizedDate: string | null
  readonly amount: number
  readonly currency: string
  readonly name: string
  readonly merchantName: string | null
  readonly category: TransactionCategory
  readonly subcategory: string | null
  readonly status: TransactionStatus
  readonly isRecurring: boolean
  readonly recurringGroupId: string | null
  readonly counterpartyName: string | null
  readonly paymentChannel: string | null
  readonly location: TransactionLocation | null
  readonly metadata: Record<string, unknown>
}

export interface TransactionLocation {
  readonly city: string | null
  readonly region: string | null
  readonly country: string | null
  readonly postalCode: string | null
}

export interface Position {
  readonly id: string
  readonly accountId: string
  readonly source: DataSource
  readonly symbol: string
  readonly name: string
  readonly holdingType: HoldingType
  readonly quantity: number
  readonly costBasis: number | null
  readonly costBasisPerShare: number | null
  readonly currentPrice: number
  readonly marketValue: number
  readonly unrealizedGainLoss: number | null
  readonly unrealizedGainLossPercent: number | null
  readonly currency: string
  readonly lastUpdated: string
  readonly taxLots: ReadonlyArray<TaxLot>
  readonly metadata: Record<string, unknown>
}

export interface TaxLot {
  readonly acquiredDate: string
  readonly quantity: number
  readonly costBasis: number
  readonly isLongTerm: boolean
}

export interface Liability {
  readonly id: string
  readonly accountId: string
  readonly source: DataSource
  readonly type: "credit" | "mortgage" | "student" | "auto" | "personal" | "other"
  readonly originalPrincipal: number | null
  readonly currentBalance: number
  readonly interestRate: number | null
  readonly minimumPayment: number | null
  readonly nextPaymentDate: string | null
  readonly currency: string
  readonly lastUpdated: string
  readonly metadata: Record<string, unknown>
}

// --- Tax Entities ---

export interface TaxState {
  readonly taxYear: number
  readonly filingStatus: string | null
  readonly documents: ReadonlyArray<TaxDocument>
  readonly facts: ReadonlyArray<TaxFact>
  readonly estimatedLiability: TaxLiabilityEstimate | null
  readonly lastUpdated: string
}

export interface TaxDocument {
  readonly id: string
  readonly taxYear: number
  readonly formType: string
  readonly source: string
  readonly extractedAt: string
  readonly confidence: number
  readonly fields: Record<string, unknown>
}

export interface TaxFact {
  readonly id: string
  readonly taxYear: number
  readonly formType: string
  readonly lineNumber: string
  readonly fieldName: string
  readonly value: number | string
  readonly confidence: number
  readonly sourceDocumentId: string
}

export interface TaxLiabilityEstimate {
  readonly federal: number
  readonly state: number
  readonly total: number
  readonly effectiveRate: number
  readonly assumptions: ReadonlyArray<string>
  readonly computedAt: string
}

// --- Snapshot & Storage ---

export interface Snapshot {
  readonly snapshotId: string
  readonly userId: string
  readonly source: DataSource
  readonly asOf: string
  readonly contentSha256: string
  readonly idempotencyKey: string
  readonly payload: SnapshotPayload
  readonly createdAt: string
}

export interface SnapshotPayload {
  readonly accounts?: ReadonlyArray<Account>
  readonly transactions?: ReadonlyArray<Transaction>
  readonly positions?: ReadonlyArray<Position>
  readonly liabilities?: ReadonlyArray<Liability>
  readonly tax?: TaxState
}

// --- Financial State ---

export interface FinancialState {
  readonly stateVersion: string
  readonly userId: string
  readonly asOf: string
  readonly accounts: ReadonlyArray<Account>
  readonly transactions: ReadonlyArray<Transaction>
  readonly positions: ReadonlyArray<Position>
  readonly liabilities: ReadonlyArray<Liability>
  readonly tax: TaxState | null
}

// --- Net Worth ---

export interface NetWorthBreakdown {
  readonly totalAssets: number
  readonly totalLiabilities: number
  readonly netWorth: number
  readonly currency: string
  readonly asOf: string
  readonly byCategory: ReadonlyArray<NetWorthCategory>
  readonly byAccount: ReadonlyArray<NetWorthAccountEntry>
}

export interface NetWorthCategory {
  readonly category: AccountType
  readonly totalValue: number
  readonly accountCount: number
}

export interface NetWorthAccountEntry {
  readonly accountId: string
  readonly accountName: string
  readonly institutionName: string
  readonly type: AccountType
  readonly balance: number
  readonly isLiability: boolean
}

// --- Anomaly Detection ---

export interface Anomaly {
  readonly id: string
  readonly type: AnomalyType
  readonly severity: AnomalySeverity
  readonly title: string
  readonly description: string
  readonly detectedAt: string
  readonly relatedEntityId: string
  readonly relatedEntityType: "transaction" | "account" | "position"
  readonly dataPoints: Record<string, unknown>
}

export type AnomalyType =
  | "large_transaction"
  | "unusual_merchant"
  | "balance_drop"
  | "duplicate_charge"
  | "new_recurring_charge"
  | "missing_expected_deposit"
  | "unusual_location"
  | "fee_spike"

// --- Cash Flow ---

export interface CashFlowSummary {
  readonly period: { readonly start: string; readonly end: string }
  readonly totalIncome: number
  readonly totalExpenses: number
  readonly netCashFlow: number
  readonly currency: string
  readonly incomeByCategory: ReadonlyArray<CategoryAmount>
  readonly expensesByCategory: ReadonlyArray<CategoryAmount>
  readonly topMerchants: ReadonlyArray<MerchantSpend>
  readonly savingsRate: number
}

export interface CategoryAmount {
  readonly category: TransactionCategory
  readonly amount: number
  readonly transactionCount: number
  readonly percentOfTotal: number
}

export interface MerchantSpend {
  readonly merchantName: string
  readonly totalAmount: number
  readonly transactionCount: number
}

// --- Subscriptions ---

export interface Subscription {
  readonly id: string
  readonly merchantName: string
  readonly estimatedAmount: number
  readonly frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "annual"
  readonly currency: string
  readonly category: TransactionCategory
  readonly lastChargeDate: string
  readonly nextExpectedDate: string | null
  readonly accountId: string
  readonly transactionIds: ReadonlyArray<string>
  readonly isActive: boolean
  readonly confidenceScore: number
}

export interface SubscriptionSummary {
  readonly activeSubscriptions: ReadonlyArray<Subscription>
  readonly totalMonthlyEstimate: number
  readonly totalAnnualEstimate: number
  readonly currency: string
  readonly newSinceLastCheck: ReadonlyArray<Subscription>
  readonly canceledSinceLastCheck: ReadonlyArray<Subscription>
}

// --- Brief ---

export interface FinancialBrief {
  readonly period: BriefPeriod
  readonly generatedAt: string
  readonly sections: ReadonlyArray<BriefSection>
  readonly actionItems: ReadonlyArray<BriefActionItem>
  readonly highlights: ReadonlyArray<string>
}

export interface BriefSection {
  readonly title: string
  readonly content: string
  readonly dataPoints: Record<string, unknown>
}

export interface BriefActionItem {
  readonly priority: "low" | "medium" | "high"
  readonly title: string
  readonly description: string
  readonly actionType: PolicyActionType | null
}

// --- Policy ---

export interface PolicyRule {
  readonly id: string
  readonly name: string
  readonly actionType: PolicyActionType
  readonly conditions: ReadonlyArray<PolicyCondition>
  readonly requiredApproval: ApprovalLevel
  readonly isActive: boolean
}

export interface PolicyCondition {
  readonly field: string
  readonly operator: "gt" | "lt" | "gte" | "lte" | "eq" | "neq" | "in" | "not_in"
  readonly value: unknown
}

export interface PolicyCheckResult {
  readonly allowed: boolean
  readonly reasonCodes: ReadonlyArray<string>
  readonly matchedRules: ReadonlyArray<string>
  readonly requiredApprovals: ReadonlyArray<ApprovalLevel>
}

// --- Tool Input/Output Contracts ---

export interface UpsertSnapshotInput {
  readonly userId: string
  readonly source: DataSource
  readonly asOf: string
  readonly payload: SnapshotPayload
  readonly idempotencyKey: string
}

export interface UpsertSnapshotOutput {
  readonly snapshotId: string
  readonly contentSha256: string
  readonly inserted: boolean
}

export interface GetStateInput {
  readonly userId: string
  readonly include?: ReadonlyArray<"accounts" | "transactions" | "positions" | "liabilities" | "tax">
  readonly asOf?: string
}

export interface GetTransactionsInput {
  readonly userId: string
  readonly startDate?: string
  readonly endDate?: string
  readonly accountId?: string
  readonly category?: TransactionCategory
  readonly minAmount?: number
  readonly maxAmount?: number
  readonly status?: TransactionStatus
  readonly limit?: number
  readonly offset?: number
}

export interface GetTransactionsOutput {
  readonly transactions: ReadonlyArray<Transaction>
  readonly total: number
  readonly hasMore: boolean
}

export interface GetNetWorthInput {
  readonly userId: string
  readonly asOf?: string
}

export interface DetectAnomaliesInput {
  readonly userId: string
  readonly lookbackDays?: number
  readonly minSeverity?: AnomalySeverity
}

export interface DetectAnomaliesOutput {
  readonly anomalies: ReadonlyArray<Anomaly>
  readonly scannedTransactions: number
  readonly scannedAccounts: number
  readonly scanTimestamp: string
}

export interface CashFlowInput {
  readonly userId: string
  readonly startDate: string
  readonly endDate: string
  readonly groupBy?: "category" | "merchant" | "account"
}

export interface SubscriptionTrackerInput {
  readonly userId: string
  readonly lookbackMonths?: number
}

export interface GenerateBriefInput {
  readonly userId: string
  readonly period: BriefPeriod
  readonly includeSections?: ReadonlyArray<string>
}

export interface PolicyCheckInput {
  readonly userId: string
  readonly actionType: PolicyActionType
  readonly candidateAction: Record<string, unknown>
}
