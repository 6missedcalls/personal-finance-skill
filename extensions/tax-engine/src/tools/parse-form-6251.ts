/**
 * Tool: tax_parse_form_6251
 * Parses raw Form 6251 (Alternative Minimum Tax) data into structured form.
 */

import type { Form6251, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

export function parseForm6251(input: ParseFormInput): ParseFormOutput<Form6251> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const taxableIncomeFromForm1040 = readNum(rawData, 'taxableIncomeFromForm1040', 'taxable_income_from_form_1040')
  const stateAndLocalTaxDeduction = readNum(rawData, 'stateAndLocalTaxDeduction', 'state_and_local_tax_deduction')
  const taxExemptInterest = readNum(rawData, 'taxExemptInterest', 'tax_exempt_interest')
  const incentiveStockOptions = readNum(rawData, 'incentiveStockOptions', 'incentive_stock_options')
  const otherAdjustments = readNum(rawData, 'otherAdjustments', 'other_adjustments')

  const alternativeMinimumTaxableIncome =
    taxableIncomeFromForm1040 +
    stateAndLocalTaxDeduction +
    taxExemptInterest +
    incentiveStockOptions +
    otherAdjustments

  const exemptionAmount = readNum(rawData, 'exemptionAmount', 'exemption_amount')
  const amtExemptionPhaseout = readNum(rawData, 'amtExemptionPhaseout', 'amt_exemption_phaseout')
  const reducedExemption = readNum(rawData, 'reducedExemption', 'reduced_exemption')

  const amtTaxableAmount = readNum(rawData, 'amtTaxableAmount', 'amt_taxable_amount')
  const tentativeMinimumTax = readNum(rawData, 'tentativeMinimumTax', 'tentative_minimum_tax')
  const regularTax = readNum(rawData, 'regularTax', 'regular_tax')

  const alternativeMinimumTax = Math.max(0, tentativeMinimumTax - regularTax)

  if (taxableIncomeFromForm1040 === 0) {
    warnings.push('Taxable income from Form 1040 is zero — verify data')
  }

  if (incentiveStockOptions > 0) {
    warnings.push('ISO exercise detected — review AMT credit carryforward eligibility')
  }

  if (alternativeMinimumTax > 0) {
    warnings.push(`AMT of $${alternativeMinimumTax} applies — consider AMT planning strategies`)
  }

  const parsed: Form6251 = {
    taxYear,
    taxableIncomeFromForm1040,
    stateAndLocalTaxDeduction,
    taxExemptInterest,
    incentiveStockOptions,
    otherAdjustments,
    alternativeMinimumTaxableIncome,
    exemptionAmount,
    amtExemptionPhaseout,
    reducedExemption,
    amtTaxableAmount,
    tentativeMinimumTax,
    regularTax,
    alternativeMinimumTax,
  }

  return { parsed, warnings, missingFields }
}
