import { z } from 'zod'

// --- Input Schemas ---

export const CreateLinkTokenInput = z.object({
  userId: z.string().min(1),
  products: z.array(z.string()).min(1),
  redirectUri: z.string().url().optional(),
})

export const ExchangeTokenInput = z.object({
  userId: z.string().min(1),
  publicToken: z.string().min(1),
  institution: z.object({
    institutionId: z.string(),
    name: z.string(),
  }).optional(),
  accounts: z.array(z.object({
    id: z.string(),
    name: z.string(),
    type: z.string(),
    subtype: z.string().optional(),
    mask: z.string().nullable().optional(),
  })).optional(),
})

export const GetAccountsInput = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  accountIds: z.array(z.string()).optional(),
})

export const GetTransactionsInput = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  cursor: z.string().optional(),
  count: z.number().int().min(1).max(500).optional(),
})

export const GetInvestmentsInput = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export const GetLiabilitiesInput = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  accountIds: z.array(z.string()).optional(),
})

export const GetRecurringInput = z.object({
  userId: z.string().min(1),
  accessToken: z.string().min(1),
  accountIds: z.array(z.string()).optional(),
})

export const WebhookHandlerInput = z.object({
  headers: z.record(z.string()),
  body: z.record(z.unknown()),
})

// --- Output Types ---

export interface CreateLinkTokenOutput {
  readonly linkToken: string
  readonly expiresAt: string
  readonly requestId: string
}

export interface ExchangeTokenOutput {
  readonly itemId: string
  readonly accessTokenRef: string
  readonly requestId: string
}

export interface PlaidAccount {
  readonly accountId: string
  readonly name: string
  readonly officialName: string | null
  readonly type: string
  readonly subtype: string | null
  readonly mask: string | null
  readonly balances: {
    readonly available: number | null
    readonly current: number | null
    readonly limit: number | null
    readonly isoCurrencyCode: string | null
  }
}

export interface GetAccountsOutput {
  readonly accounts: readonly PlaidAccount[]
  readonly itemId: string
  readonly requestId: string
}

export interface PlaidTransaction {
  readonly transactionId: string
  readonly accountId: string
  readonly amount: number
  readonly isoCurrencyCode: string | null
  readonly date: string
  readonly name: string
  readonly merchantName: string | null
  readonly paymentChannel: string
  readonly pending: boolean
  readonly category: readonly string[] | null
  readonly personalFinanceCategory: {
    readonly primary: string
    readonly detailed: string
  } | null
}

export interface GetTransactionsOutput {
  readonly added: readonly PlaidTransaction[]
  readonly modified: readonly PlaidTransaction[]
  readonly removed: readonly string[]
  readonly nextCursor: string
  readonly hasMore: boolean
  readonly requestId: string
}

export interface PlaidHolding {
  readonly accountId: string
  readonly securityId: string
  readonly quantity: number
  readonly costBasis: number | null
  readonly institutionValue: number | null
  readonly isoCurrencyCode: string | null
}

export interface PlaidSecurity {
  readonly securityId: string
  readonly name: string | null
  readonly tickerSymbol: string | null
  readonly type: string | null
  readonly isin: string | null
  readonly cusip: string | null
  readonly closePrice: number | null
  readonly closePriceAsOf: string | null
  readonly isoCurrencyCode: string | null
}

export interface PlaidInvestmentTransaction {
  readonly investmentTransactionId: string
  readonly accountId: string
  readonly securityId: string | null
  readonly amount: number
  readonly quantity: number
  readonly price: number
  readonly type: string
  readonly subtype: string
  readonly date: string
  readonly name: string
  readonly isoCurrencyCode: string | null
}

export interface GetInvestmentsOutput {
  readonly holdings: readonly PlaidHolding[]
  readonly securities: readonly PlaidSecurity[]
  readonly investmentTransactions: readonly PlaidInvestmentTransaction[]
  readonly requestId: string
}

export interface PlaidCreditLiability {
  readonly accountId: string | null
  readonly aprs: readonly {
    readonly aprPercentage: number
    readonly aprType: string
    readonly balanceSubjectToApr: number | null
  }[]
  readonly isOverdue: boolean
  readonly lastPaymentAmount: number | null
  readonly lastPaymentDate: string | null
  readonly lastStatementBalance: number | null
  readonly minimumPaymentAmount: number | null
  readonly nextPaymentDueDate: string | null
}

export interface PlaidStudentLoanLiability {
  readonly accountId: string | null
  readonly accountNumber: string | null
  readonly disbursementDates: readonly string[]
  readonly expectedPayoffDate: string | null
  readonly interestRatePercentage: number
  readonly isOverdue: boolean
  readonly lastPaymentAmount: number | null
  readonly lastPaymentDate: string | null
  readonly loanName: string | null
  readonly loanStatus: {
    readonly type: string | null
    readonly endDate: string | null
  } | null
  readonly minimumPaymentAmount: number | null
  readonly nextPaymentDueDate: string | null
  readonly originationDate: string | null
  readonly originationPrincipalAmount: number | null
  readonly outstandingInterestAmount: number | null
  readonly repaymentPlan: {
    readonly type: string | null
    readonly description: string | null
  } | null
}

export interface PlaidMortgageLiability {
  readonly accountId: string
  readonly accountNumber: string | null
  readonly currentLateFee: number | null
  readonly escrowBalance: number | null
  readonly hasPmi: boolean | null
  readonly interestRate: {
    readonly percentage: number | null
    readonly type: string | null
  }
  readonly lastPaymentAmount: number | null
  readonly lastPaymentDate: string | null
  readonly loanTermMonths: number | null
  readonly loanTypeDescription: string | null
  readonly maturityDate: string | null
  readonly nextMonthlyPayment: number | null
  readonly nextPaymentDueDate: string | null
  readonly originationDate: string | null
  readonly originationPrincipalAmount: number | null
  readonly pastDueAmount: number | null
  readonly propertyAddress: {
    readonly city: string | null
    readonly country: string | null
    readonly postalCode: string | null
    readonly region: string | null
    readonly street: string | null
  } | null
  readonly ytdInterestPaid: number | null
  readonly ytdPrincipalPaid: number | null
}

export interface GetLiabilitiesOutput {
  readonly credit: readonly PlaidCreditLiability[]
  readonly student: readonly PlaidStudentLoanLiability[]
  readonly mortgage: readonly PlaidMortgageLiability[]
  readonly requestId: string
}

export interface PlaidRecurringTransaction {
  readonly streamId: string
  readonly accountId: string
  readonly category: readonly string[] | null
  readonly description: string
  readonly merchantName: string | null
  readonly averageAmount: {
    readonly amount: number
    readonly isoCurrencyCode: string | null
  }
  readonly lastAmount: {
    readonly amount: number
    readonly isoCurrencyCode: string | null
  }
  readonly frequency: string
  readonly lastDate: string
  readonly isActive: boolean
  readonly status: string
}

export interface GetRecurringOutput {
  readonly inflowStreams: readonly PlaidRecurringTransaction[]
  readonly outflowStreams: readonly PlaidRecurringTransaction[]
  readonly requestId: string
}

export interface WebhookHandlerOutput {
  readonly accepted: boolean
  readonly webhookType: string
  readonly webhookCode: string
  readonly itemId: string | null
  readonly error: string | null
}

// --- Error Types ---

export interface PlaidToolError {
  readonly error: true
  readonly errorType: string
  readonly errorCode: string
  readonly errorMessage: string
  readonly requestId: string | null
}

export function formatPlaidError(err: unknown): PlaidToolError {
  const error = err as {
    response?: {
      data?: {
        error_type?: string
        error_code?: string
        error_message?: string
        request_id?: string
      }
    }
    message?: string
  }

  const data = error?.response?.data
  return {
    error: true,
    errorType: data?.error_type ?? 'UNKNOWN',
    errorCode: data?.error_code ?? 'UNKNOWN',
    errorMessage: data?.error_message ?? error?.message ?? 'An unknown error occurred',
    requestId: data?.request_id ?? null,
  }
}
