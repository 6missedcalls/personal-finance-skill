import type { PlaidApi } from 'plaid'
import {
  GetLiabilitiesInput,
  type GetLiabilitiesOutput,
  type PlaidCreditLiability,
  type PlaidStudentLoanLiability,
  type PlaidMortgageLiability,
  formatPlaidError,
} from '../types.js'

function mapCredit(c: any): PlaidCreditLiability {
  return {
    accountId: c.account_id ?? null,
    aprs: (c.aprs ?? []).map((apr: any) => ({
      aprPercentage: apr.apr_percentage,
      aprType: apr.apr_type,
      balanceSubjectToApr: apr.balance_subject_to_apr ?? null,
    })),
    isOverdue: c.is_overdue ?? false,
    lastPaymentAmount: c.last_payment_amount ?? null,
    lastPaymentDate: c.last_payment_date ?? null,
    lastStatementBalance: c.last_statement_balance ?? null,
    minimumPaymentAmount: c.minimum_payment_amount ?? null,
    nextPaymentDueDate: c.next_payment_due_date ?? null,
  }
}

function mapStudentLoan(s: any): PlaidStudentLoanLiability {
  return {
    accountId: s.account_id ?? null,
    accountNumber: s.account_number ?? null,
    disbursementDates: s.disbursement_dates ?? [],
    expectedPayoffDate: s.expected_payoff_date ?? null,
    interestRatePercentage: s.interest_rate_percentage,
    isOverdue: s.is_overdue ?? false,
    lastPaymentAmount: s.last_payment_amount ?? null,
    lastPaymentDate: s.last_payment_date ?? null,
    loanName: s.loan_name ?? null,
    loanStatus: s.loan_status
      ? { type: s.loan_status.type ?? null, endDate: s.loan_status.end_date ?? null }
      : null,
    minimumPaymentAmount: s.minimum_payment_amount ?? null,
    nextPaymentDueDate: s.next_payment_due_date ?? null,
    originationDate: s.origination_date ?? null,
    originationPrincipalAmount: s.origination_principal_amount ?? null,
    outstandingInterestAmount: s.outstanding_interest_amount ?? null,
    repaymentPlan: s.repayment_plan
      ? { type: s.repayment_plan.type ?? null, description: s.repayment_plan.description ?? null }
      : null,
  }
}

function mapMortgage(m: any): PlaidMortgageLiability {
  return {
    accountId: m.account_id,
    accountNumber: m.account_number ?? null,
    currentLateFee: m.current_late_fee ?? null,
    escrowBalance: m.escrow_balance ?? null,
    hasPmi: m.has_pmi ?? null,
    interestRate: {
      percentage: m.interest_rate?.percentage ?? null,
      type: m.interest_rate?.type ?? null,
    },
    lastPaymentAmount: m.last_payment_amount ?? null,
    lastPaymentDate: m.last_payment_date ?? null,
    loanTermMonths: m.loan_term ?? null,
    loanTypeDescription: m.loan_type_description ?? null,
    maturityDate: m.maturity_date ?? null,
    nextMonthlyPayment: m.next_monthly_payment ?? null,
    nextPaymentDueDate: m.next_payment_due_date ?? null,
    originationDate: m.origination_date ?? null,
    originationPrincipalAmount: m.origination_principal_amount ?? null,
    pastDueAmount: m.past_due_amount ?? null,
    propertyAddress: m.property_address
      ? {
          city: m.property_address.city ?? null,
          country: m.property_address.country ?? null,
          postalCode: m.property_address.postal_code ?? null,
          region: m.property_address.region ?? null,
          street: m.property_address.street ?? null,
        }
      : null,
    ytdInterestPaid: m.ytd_interest_paid ?? null,
    ytdPrincipalPaid: m.ytd_principal_paid ?? null,
  }
}

export async function getLiabilities(
  client: PlaidApi,
  rawInput: unknown
): Promise<GetLiabilitiesOutput> {
  const input = GetLiabilitiesInput.parse(rawInput)

  try {
    const response = await client.liabilitiesGet({
      access_token: input.accessToken,
      options: input.accountIds
        ? { account_ids: input.accountIds }
        : undefined,
    })

    const liabilities = response.data.liabilities

    return {
      credit: (liabilities.credit ?? []).map(mapCredit),
      student: (liabilities.student ?? []).map(mapStudentLoan),
      mortgage: (liabilities.mortgage ?? []).map(mapMortgage),
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
