/**
 * Tool: tax_parse_schedule_a
 * Parses raw Schedule A (itemized deductions) data into structured form.
 */

import type { ScheduleA, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

const SALT_CAP = 10000

function computeMedicalThreshold(agi: number): number {
  return agi * 0.075
}

export function parseScheduleA(input: ParseFormInput): ParseFormOutput<ScheduleA> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const medicalAndDentalExpenses = readNum(rawData, 'medicalAndDentalExpenses', 'medical_and_dental_expenses')
  const agi = readNum(rawData, 'agi', 'adjusted_gross_income')
  const medicalThreshold = agi > 0 ? computeMedicalThreshold(agi) : readNum(rawData, 'medicalThreshold', 'medical_threshold')
  const deductibleMedical = Math.max(0, medicalAndDentalExpenses - medicalThreshold)

  const stateAndLocalTaxes = readNum(rawData, 'stateAndLocalTaxes', 'state_and_local_taxes')
  const saltDeductionCapped = Math.min(stateAndLocalTaxes, SALT_CAP)

  if (stateAndLocalTaxes > SALT_CAP) {
    warnings.push(`SALT deduction capped at $${SALT_CAP} (reported: $${stateAndLocalTaxes})`)
  }

  const homeInterest = readNum(rawData, 'homeInterest', 'home_interest', 'home_mortgage_interest')
  const charitableCashContributions = readNum(rawData, 'charitableCashContributions', 'charitable_cash_contributions')
  const charitableNonCash = readNum(rawData, 'charitableNonCash', 'charitable_non_cash')
  const charitableCarryover = readNum(rawData, 'charitableCarryover', 'charitable_carryover')
  const totalCharitable = charitableCashContributions + charitableNonCash + charitableCarryover
  const casualtyAndTheftLosses = readNum(rawData, 'casualtyAndTheftLosses', 'casualty_and_theft_losses')
  const otherItemizedDeductions = readNum(rawData, 'otherItemizedDeductions', 'other_itemized_deductions')

  const totalItemizedDeductions =
    deductibleMedical +
    saltDeductionCapped +
    homeInterest +
    totalCharitable +
    casualtyAndTheftLosses +
    otherItemizedDeductions

  if (totalItemizedDeductions === 0) {
    warnings.push('Total itemized deductions are zero — verify data or consider standard deduction')
  }

  if (charitableCashContributions > 0 && agi > 0 && charitableCashContributions > agi * 0.6) {
    warnings.push('Charitable cash contributions exceed 60% of AGI — verify carryover rules')
  }

  const parsed: ScheduleA = {
    taxYear,
    medicalAndDentalExpenses,
    medicalThreshold,
    deductibleMedical,
    stateAndLocalTaxes,
    saltDeductionCapped,
    homeInterest,
    charitableCashContributions,
    charitableNonCash,
    charitableCarryover,
    totalCharitable,
    casualtyAndTheftLosses,
    otherItemizedDeductions,
    totalItemizedDeductions,
  }

  return { parsed, warnings, missingFields }
}
