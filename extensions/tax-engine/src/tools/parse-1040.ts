/**
 * Tool: tax_parse_1040
 * Parses raw Form 1040 data into structured form with validation.
 */

import type { FilingStatus, Form1040, ParseFormInput, ParseFormOutput } from '../types.js'

const VALID_FILING_STATUSES: ReadonlyArray<string> = [
  'single',
  'married_filing_jointly',
  'married_filing_separately',
  'head_of_household',
]

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

function readStr(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): string {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return String(raw[key])
  }
  return ''
}

function parseFilingStatus(raw: Record<string, unknown>): FilingStatus {
  const value = String(raw.filingStatus ?? raw.filing_status ?? 'single').toLowerCase()
  if (VALID_FILING_STATUSES.includes(value)) return value as FilingStatus
  return 'single'
}

export function parse1040(input: ParseFormInput): ParseFormOutput<Form1040> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const filingStatus = parseFilingStatus(rawData)
  const firstName = readStr(rawData, 'firstName', 'first_name')
  const lastName = readStr(rawData, 'lastName', 'last_name')

  if (!firstName) missingFields.push('firstName')
  if (!lastName) missingFields.push('lastName')

  const rawStatus = String(rawData.filingStatus ?? rawData.filing_status ?? '')
  if (!rawStatus) missingFields.push('filingStatus')
  if (rawStatus && !VALID_FILING_STATUSES.includes(rawStatus.toLowerCase())) {
    warnings.push(`Unrecognized filing status "${rawStatus}" — defaulting to single`)
  }

  const totalIncome = readNum(rawData, 'totalIncome', 'total_income')
  const adjustedGrossIncome = readNum(rawData, 'adjustedGrossIncome', 'adjusted_gross_income')
  const totalTax = readNum(rawData, 'totalTax', 'total_tax')
  const totalPayments = readNum(rawData, 'totalPayments', 'total_payments')
  const amountOwed = readNum(rawData, 'amountOwed', 'amount_owed')
  const overpaid = readNum(rawData, 'overpaid', 'overpayment')

  if (totalIncome === 0) warnings.push('Total income is zero — verify data')
  if (amountOwed > 0 && overpaid > 0) {
    warnings.push('Both amountOwed and overpaid are non-zero — verify')
  }

  const parsed: Form1040 = {
    filingStatus,
    taxYear,
    firstName,
    lastName,
    ssn: readStr(rawData, 'ssn', 'social_security_number'),
    wages: readNum(rawData, 'wages', 'box_1a_wages'),
    taxExemptInterest: readNum(rawData, 'taxExemptInterest', 'tax_exempt_interest'),
    taxableInterest: readNum(rawData, 'taxableInterest', 'taxable_interest'),
    qualifiedDividends: readNum(rawData, 'qualifiedDividends', 'qualified_dividends'),
    ordinaryDividends: readNum(rawData, 'ordinaryDividends', 'ordinary_dividends'),
    iraDistributions: readNum(rawData, 'iraDistributions', 'ira_distributions'),
    taxableIraDistributions: readNum(rawData, 'taxableIraDistributions', 'taxable_ira_distributions'),
    pensions: readNum(rawData, 'pensions', 'pensions_and_annuities'),
    taxablePensions: readNum(rawData, 'taxablePensions', 'taxable_pensions'),
    socialSecurity: readNum(rawData, 'socialSecurity', 'social_security_benefits'),
    taxableSocialSecurity: readNum(rawData, 'taxableSocialSecurity', 'taxable_social_security'),
    capitalGainOrLoss: readNum(rawData, 'capitalGainOrLoss', 'capital_gain_or_loss'),
    otherIncome: readNum(rawData, 'otherIncome', 'other_income'),
    totalIncome,
    adjustmentsToIncome: readNum(rawData, 'adjustmentsToIncome', 'adjustments_to_income'),
    adjustedGrossIncome,
    standardOrItemizedDeduction: readNum(rawData, 'standardOrItemizedDeduction', 'standard_or_itemized_deduction'),
    qualifiedBusinessDeduction: readNum(rawData, 'qualifiedBusinessDeduction', 'qualified_business_deduction'),
    totalDeductions: readNum(rawData, 'totalDeductions', 'total_deductions'),
    taxableIncome: readNum(rawData, 'taxableIncome', 'taxable_income'),
    totalTax,
    totalPayments,
    amountOwed,
    overpaid,
  }

  return { parsed, warnings, missingFields }
}
