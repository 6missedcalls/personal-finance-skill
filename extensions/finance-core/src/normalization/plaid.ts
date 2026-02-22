import { generateId } from "../storage/store.js"
import type {
  Account,
  AccountSubtype,
  AccountType,
  Liability,
  Position,
  Transaction,
  TransactionCategory,
} from "../types.js"

// --- Plaid Type Mappings ---

const PLAID_ACCOUNT_TYPE_MAP: Record<string, AccountType> = {
  depository: "depository",
  credit: "credit",
  loan: "loan",
  investment: "investment",
  mortgage: "mortgage",
  brokerage: "brokerage",
  other: "other",
}

const PLAID_SUBTYPE_MAP: Record<string, AccountSubtype> = {
  checking: "checking",
  savings: "savings",
  "money market": "money_market",
  cd: "cd",
  "credit card": "credit_card",
  "auto loan": "auto_loan",
  "student loan": "student_loan",
  mortgage: "mortgage_30",
  "home equity": "heloc",
  "401k": "401k",
  ira: "ira_traditional",
  roth: "ira_roth",
  brokerage: "brokerage_taxable",
  hsa: "hsa",
  "529": "529",
}

const PLAID_CATEGORY_MAP: Record<string, TransactionCategory> = {
  INCOME: "income",
  TRANSFER_IN: "transfer",
  TRANSFER_OUT: "transfer",
  LOAN_PAYMENTS: "payment",
  BANK_FEES: "fees",
  ENTERTAINMENT: "entertainment",
  FOOD_AND_DRINK: "food_and_drink",
  GENERAL_MERCHANDISE: "shopping",
  GENERAL_SERVICES: "other",
  GOVERNMENT_AND_NON_PROFIT: "other",
  HOME_IMPROVEMENT: "housing",
  MEDICAL: "healthcare",
  PERSONAL_CARE: "personal_care",
  RENT_AND_UTILITIES: "utilities",
  TRANSPORTATION: "transportation",
  TRAVEL: "travel",
}

// --- Normalizers ---

export interface PlaidAccount {
  readonly account_id: string
  readonly name: string
  readonly official_name: string | null
  readonly type: string
  readonly subtype: string | null
  readonly balances: {
    readonly current: number | null
    readonly available: number | null
    readonly limit: number | null
    readonly iso_currency_code: string | null
  }
  readonly institution_id?: string
  readonly institution_name?: string
}

export function normalizePlaidAccount(
  plaidAccount: PlaidAccount,
  institutionId: string,
  institutionName: string
): Account {
  return {
    id: generateId("acct"),
    source: "plaid",
    sourceAccountId: plaidAccount.account_id,
    institutionId,
    institutionName,
    name: plaidAccount.name,
    officialName: plaidAccount.official_name,
    type: PLAID_ACCOUNT_TYPE_MAP[plaidAccount.type] ?? "other",
    subtype: PLAID_SUBTYPE_MAP[plaidAccount.subtype ?? ""] ?? "other",
    balances: {
      current: plaidAccount.balances.current ?? 0,
      available: plaidAccount.balances.available,
      limit: plaidAccount.balances.limit,
      lastUpdated: new Date().toISOString(),
    },
    currency: plaidAccount.balances.iso_currency_code ?? "USD",
    lastSyncedAt: new Date().toISOString(),
    isActive: true,
    metadata: {},
  }
}

export interface PlaidTransaction {
  readonly transaction_id: string
  readonly account_id: string
  readonly date: string
  readonly authorized_date: string | null
  readonly amount: number
  readonly iso_currency_code: string | null
  readonly name: string
  readonly merchant_name: string | null
  readonly personal_finance_category: {
    readonly primary: string
    readonly detailed: string
  } | null
  readonly pending: boolean
  readonly payment_channel: string | null
  readonly location: {
    readonly city: string | null
    readonly region: string | null
    readonly country: string | null
    readonly postal_code: string | null
  } | null
}

export function normalizePlaidTransaction(
  plaidTx: PlaidTransaction,
  accountId: string
): Transaction {
  const categoryKey = plaidTx.personal_finance_category?.primary ?? ""

  return {
    id: generateId("txn"),
    accountId,
    source: "plaid",
    sourceTransactionId: plaidTx.transaction_id,
    date: plaidTx.date,
    authorizedDate: plaidTx.authorized_date,
    amount: plaidTx.amount,
    currency: plaidTx.iso_currency_code ?? "USD",
    name: plaidTx.name,
    merchantName: plaidTx.merchant_name,
    category: PLAID_CATEGORY_MAP[categoryKey] ?? "other",
    subcategory: plaidTx.personal_finance_category?.detailed ?? null,
    status: plaidTx.pending ? "pending" : "posted",
    isRecurring: false,
    recurringGroupId: null,
    counterpartyName: plaidTx.merchant_name,
    paymentChannel: plaidTx.payment_channel,
    location: plaidTx.location
      ? {
          city: plaidTx.location.city,
          region: plaidTx.location.region,
          country: plaidTx.location.country,
          postalCode: plaidTx.location.postal_code,
        }
      : null,
    metadata: {},
  }
}

export interface PlaidHolding {
  readonly security_id: string
  readonly account_id: string
  readonly quantity: number
  readonly cost_basis: number | null
  readonly institution_price: number
  readonly institution_value: number
  readonly iso_currency_code: string | null
  readonly security: {
    readonly ticker_symbol: string | null
    readonly name: string | null
    readonly type: string | null
  } | null
}

export function normalizePlaidHolding(
  holding: PlaidHolding,
  accountId: string
): Position {
  const costBasis = holding.cost_basis ?? 0
  const marketValue = holding.institution_value
  const unrealizedGainLoss = costBasis > 0 ? marketValue - costBasis : null

  return {
    id: generateId("pos"),
    accountId,
    source: "plaid",
    symbol: holding.security?.ticker_symbol ?? holding.security_id,
    name: holding.security?.name ?? "Unknown Security",
    holdingType: mapPlaidSecurityType(holding.security?.type),
    quantity: holding.quantity,
    costBasis: holding.cost_basis,
    costBasisPerShare:
      holding.cost_basis !== null && holding.quantity > 0
        ? holding.cost_basis / holding.quantity
        : null,
    currentPrice: holding.institution_price,
    marketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent:
      unrealizedGainLoss !== null && costBasis > 0
        ? unrealizedGainLoss / costBasis
        : null,
    currency: holding.iso_currency_code ?? "USD",
    lastUpdated: new Date().toISOString(),
    taxLots: [],
    metadata: { securityId: holding.security_id },
  }
}

function mapPlaidSecurityType(type: string | null | undefined): Position["holdingType"] {
  const typeMap: Record<string, Position["holdingType"]> = {
    equity: "equity",
    etf: "etf",
    "mutual fund": "mutual_fund",
    bond: "bond",
    option: "option",
    cryptocurrency: "crypto",
    cash: "cash",
  }
  return typeMap[type ?? ""] ?? "other"
}

export interface PlaidLiability {
  readonly account_id: string
  readonly type: string
  readonly original_principal?: number | null
  readonly current_balance?: number | null
  readonly interest_rate?: number | null
  readonly minimum_payment?: number | null
  readonly next_payment_due_date?: string | null
}

export function normalizePlaidLiability(
  liability: PlaidLiability,
  accountId: string
): Liability {
  const typeMap: Record<string, Liability["type"]> = {
    credit: "credit",
    mortgage: "mortgage",
    student: "student",
    auto: "auto",
  }

  return {
    id: generateId("liab"),
    accountId,
    source: "plaid",
    type: typeMap[liability.type] ?? "other",
    originalPrincipal: liability.original_principal ?? null,
    currentBalance: liability.current_balance ?? 0,
    interestRate: liability.interest_rate ?? null,
    minimumPayment: liability.minimum_payment ?? null,
    nextPaymentDate: liability.next_payment_due_date ?? null,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    metadata: {},
  }
}
