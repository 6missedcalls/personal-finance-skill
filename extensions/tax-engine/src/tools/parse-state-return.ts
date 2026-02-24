/**
 * Tool: tax_parse_state_return
 * Parses raw generic state return data into structured form.
 */

import type { FilingStatus, StateReturn, ParseFormInput, ParseFormOutput } from '../types.js'

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

function computeBalance(
  taxComputed: number,
  credits: number,
  withholding: number,
  estimated: number,
): { readonly balanceDue: number; readonly overpayment: number } {
  const net = taxComputed - credits - withholding - estimated
  return net > 0
    ? { balanceDue: net, overpayment: 0 }
    : { balanceDue: 0, overpayment: Math.abs(net) }
}

export function parseStateReturn(input: ParseFormInput): ParseFormOutput<StateReturn> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const stateCode = readStr(rawData, 'stateCode', 'state_code')
  const formId = readStr(rawData, 'formId', 'form_id')

  if (!stateCode) missingFields.push('stateCode')
  if (!formId) missingFields.push('formId')

  const stateTaxComputed = readNum(rawData, 'stateTaxComputed', 'state_tax_computed')
  const stateCredits = readNum(rawData, 'stateCredits', 'state_credits')
  const stateWithholding = readNum(rawData, 'stateWithholding', 'state_withholding')
  const stateEstimatedPayments = readNum(rawData, 'stateEstimatedPayments', 'state_estimated_payments')

  const { balanceDue, overpayment } = computeBalance(
    stateTaxComputed,
    stateCredits,
    stateWithholding,
    stateEstimatedPayments,
  )

  const federalAGI = readNum(rawData, 'federalAGI', 'federal_agi')
  if (federalAGI === 0) warnings.push('Federal AGI is zero — verify data')

  const parsed: StateReturn = {
    taxYear,
    stateCode: stateCode.toUpperCase(),
    formId,
    filingStatus: parseFilingStatus(rawData),
    federalAGI,
    stateAdditions: readNum(rawData, 'stateAdditions', 'state_additions'),
    stateSubtractions: readNum(rawData, 'stateSubtractions', 'state_subtractions'),
    stateAGI: readNum(rawData, 'stateAGI', 'state_agi'),
    stateDeductions: readNum(rawData, 'stateDeductions', 'state_deductions'),
    stateTaxableIncome: readNum(rawData, 'stateTaxableIncome', 'state_taxable_income'),
    stateTaxComputed,
    stateCredits,
    stateWithholding,
    stateEstimatedPayments,
    stateBalanceDue: balanceDue,
    stateOverpayment: overpayment,
  }

  return { parsed, warnings, missingFields }
}
