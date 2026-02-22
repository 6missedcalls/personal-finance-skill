/**
 * Tool: tax_parse_w2
 * Parses raw W-2 data into structured form.
 */

import type { FormW2, ParseFormInput, ParseFormOutput, W2Box12Entry } from '../types.js'

export function parseW2(input: ParseFormInput): ParseFormOutput<FormW2> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const employerName = String(rawData.employerName ?? rawData.employer_name ?? '')
  const employeeName = String(rawData.employeeName ?? rawData.employee_name ?? '')

  if (!employerName) missingFields.push('employerName')
  if (!employeeName) missingFields.push('employeeName')

  const wages = Number(rawData.wagesTipsOtherComp ?? rawData.box_1_wages_tips_other_compensation ?? 0)
  const federalWithheld = Number(rawData.federalTaxWithheld ?? rawData.box_2_federal_income_tax_withheld ?? 0)

  if (wages === 0) warnings.push('Zero wages — verify data')
  if (federalWithheld === 0 && wages > 15000) {
    warnings.push('No federal withholding on significant wages — check W-4 elections')
  }

  const ssWages = Number(rawData.socialSecurityWages ?? rawData.box_3_social_security_wages ?? 0)
  const ssCap = 176100 // 2025
  if (ssWages > ssCap) {
    warnings.push(`Social security wages ($${ssWages}) exceed wage base cap ($${ssCap})`)
  }

  // Parse Box 12 codes
  const rawBox12 = (rawData.box12Codes ?? rawData.box_12_codes ?? []) as ReadonlyArray<Record<string, unknown>>
  const box12Codes: W2Box12Entry[] = rawBox12.map((entry) => ({
    code: String(entry.code ?? ''),
    amount: Number(entry.amount ?? 0),
  }))

  const parsed: FormW2 = {
    employerName,
    employerEin: String(rawData.employerEin ?? rawData.employer_ein ?? ''),
    employeeName,
    employeeSsn: String(rawData.employeeSsn ?? rawData.employee_ssn ?? ''),
    taxYear,
    wagesTipsOtherComp: wages,
    federalTaxWithheld: federalWithheld,
    socialSecurityWages: ssWages,
    socialSecurityTaxWithheld: Number(rawData.socialSecurityTaxWithheld ?? rawData.box_4_social_security_tax_withheld ?? 0),
    medicareWagesAndTips: Number(rawData.medicareWagesAndTips ?? rawData.box_5_medicare_wages_and_tips ?? 0),
    medicareTaxWithheld: Number(rawData.medicareTaxWithheld ?? rawData.box_6_medicare_tax_withheld ?? 0),
    socialSecurityTips: Number(rawData.socialSecurityTips ?? rawData.box_7_social_security_tips ?? 0),
    allocatedTips: Number(rawData.allocatedTips ?? rawData.box_8_allocated_tips ?? 0),
    dependentCareBenefits: Number(rawData.dependentCareBenefits ?? rawData.box_10_dependent_care_benefits ?? 0),
    nonqualifiedPlans: Number(rawData.nonqualifiedPlans ?? rawData.box_11_nonqualified_plans ?? 0),
    box12Codes,
    statutoryEmployee: Boolean(rawData.statutoryEmployee ?? rawData.box_13_statutory_employee ?? false),
    retirementPlan: Boolean(rawData.retirementPlan ?? rawData.box_13_retirement_plan ?? false),
    thirdPartySickPay: Boolean(rawData.thirdPartySickPay ?? rawData.box_13_third_party_sick_pay ?? false),
    other: String(rawData.other ?? rawData.box_14_other ?? ''),
    stateWages: Number(rawData.stateWages ?? rawData.box_16_state_wages ?? 0),
    stateIncomeTax: Number(rawData.stateIncomeTax ?? rawData.box_17_state_income_tax ?? 0),
    localWages: Number(rawData.localWages ?? rawData.box_18_local_wages ?? 0),
    localIncomeTax: Number(rawData.localIncomeTax ?? rawData.box_19_local_income_tax ?? 0),
    localityName: String(rawData.localityName ?? rawData.box_20_locality_name ?? ''),
  }

  return { parsed, warnings, missingFields }
}
