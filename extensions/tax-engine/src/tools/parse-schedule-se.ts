/**
 * Tool: tax_parse_schedule_se
 * Parses raw Schedule SE (self-employment tax) data into structured form.
 */

import type { ScheduleSE, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

const SS_WAGE_BASE_2025 = 176100
const SE_FACTOR = 0.9235
const SS_RATE = 0.124
const MEDICARE_RATE = 0.029
const ADDITIONAL_MEDICARE_THRESHOLD = 200000
const ADDITIONAL_MEDICARE_RATE = 0.009
const DEDUCTIBLE_SE_FRACTION = 0.5

export function parseScheduleSE(input: ParseFormInput): ParseFormOutput<ScheduleSE> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const netEarningsFromSelfEmployment = readNum(
    rawData,
    'netEarningsFromSelfEmployment',
    'net_earnings_from_self_employment',
    'net_self_employment_earnings',
  )

  if (netEarningsFromSelfEmployment === 0) {
    warnings.push('Zero self-employment earnings — verify data')
  }

  const socialSecurityWageBase = readNum(rawData, 'socialSecurityWageBase', 'social_security_wage_base') || SS_WAGE_BASE_2025

  const seTaxBase = netEarningsFromSelfEmployment * SE_FACTOR
  const socialSecurityTax = Math.min(seTaxBase, socialSecurityWageBase) * SS_RATE
  const medicareTax = seTaxBase * MEDICARE_RATE

  const additionalMedicareTax =
    seTaxBase > ADDITIONAL_MEDICARE_THRESHOLD
      ? (seTaxBase - ADDITIONAL_MEDICARE_THRESHOLD) * ADDITIONAL_MEDICARE_RATE
      : 0

  const totalSelfEmploymentTax = socialSecurityTax + medicareTax + additionalMedicareTax
  const deductiblePartOfSeTax = totalSelfEmploymentTax * DEDUCTIBLE_SE_FRACTION

  if (netEarningsFromSelfEmployment < 0) {
    warnings.push('Negative self-employment earnings — no SE tax due')
  }

  if (seTaxBase > ADDITIONAL_MEDICARE_THRESHOLD) {
    warnings.push('Additional Medicare tax applies on SE earnings above $200,000')
  }

  const parsed: ScheduleSE = {
    taxYear,
    netEarningsFromSelfEmployment,
    socialSecurityWageBase,
    socialSecurityTax: Math.max(0, socialSecurityTax),
    medicareTax: Math.max(0, medicareTax),
    additionalMedicareTax: Math.max(0, additionalMedicareTax),
    totalSelfEmploymentTax: Math.max(0, totalSelfEmploymentTax),
    deductiblePartOfSeTax: Math.max(0, deductiblePartOfSeTax),
  }

  return { parsed, warnings, missingFields }
}
