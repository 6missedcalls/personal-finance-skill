/**
 * Tool: tax_parse_k1
 * Parses raw Schedule K-1 (partnership) data into structured form.
 */

import type { FormK1, ParseFormInput, ParseFormOutput } from '../types.js'

export function parseK1(input: ParseFormInput): ParseFormOutput<FormK1> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const partnershipName = String(rawData.partnershipName ?? rawData.partnership_name ?? '')
  const partnerName = String(rawData.partnerName ?? rawData.partner_name ?? '')

  if (!partnershipName) missingFields.push('partnershipName')
  if (!partnerName) missingFields.push('partnerName')

  const ordinaryIncome = Number(rawData.ordinaryBusinessIncomeLoss ?? rawData.ordinary_business_income_loss ?? 0)
  const guaranteedPayments = Number(rawData.guaranteedPayments ?? rawData.guaranteed_payments ?? 0)

  if (guaranteedPayments > 0) {
    warnings.push('Guaranteed payments present — subject to self-employment tax')
  }

  const section1231 = Number(rawData.section1231GainLoss ?? rawData.section_1231_gain_loss ?? 0)
  if (section1231 !== 0) {
    warnings.push('Section 1231 gain/loss present — may have lookback recapture implications')
  }

  const partnerTypeRaw = String(rawData.partnerType ?? rawData.partner_type ?? 'limited').toLowerCase()
  const partnerType = partnerTypeRaw.includes('general')
    ? 'general' as const
    : partnerTypeRaw.includes('llc')
      ? 'llc_member' as const
      : 'limited' as const

  const parsed: FormK1 = {
    partnershipName,
    partnershipEin: String(rawData.partnershipEin ?? rawData.partnership_ein ?? ''),
    partnerName,
    partnerTin: String(rawData.partnerTin ?? rawData.partner_tin ?? ''),
    taxYear,
    partnerType,
    profitSharingPercent: Number(rawData.profitSharingPercent ?? rawData.profit_sharing_percent ?? 0),
    lossSharingPercent: Number(rawData.lossSharingPercent ?? rawData.loss_sharing_percent ?? 0),
    capitalSharingPercent: Number(rawData.capitalSharingPercent ?? rawData.capital_sharing_percent ?? 0),
    beginningCapitalAccount: Number(rawData.beginningCapitalAccount ?? rawData.beginning_capital_account ?? 0),
    endingCapitalAccount: Number(rawData.endingCapitalAccount ?? rawData.ending_capital_account ?? 0),
    ordinaryBusinessIncomeLoss: ordinaryIncome,
    netRentalRealEstateIncomeLoss: Number(rawData.netRentalRealEstateIncomeLoss ?? rawData.net_rental_real_estate_income_loss ?? 0),
    otherNetRentalIncomeLoss: Number(rawData.otherNetRentalIncomeLoss ?? rawData.other_net_rental_income_loss ?? 0),
    guaranteedPayments,
    interestIncome: Number(rawData.interestIncome ?? rawData.interest_income ?? 0),
    ordinaryDividends: Number(rawData.ordinaryDividends ?? rawData.ordinary_dividends ?? 0),
    qualifiedDividends: Number(rawData.qualifiedDividends ?? rawData.qualified_dividends ?? 0),
    netShortTermCapitalGainLoss: Number(rawData.netShortTermCapitalGainLoss ?? rawData.net_short_term_capital_gain_loss ?? 0),
    netLongTermCapitalGainLoss: Number(rawData.netLongTermCapitalGainLoss ?? rawData.net_long_term_capital_gain_loss ?? 0),
    section1231GainLoss: section1231,
    otherIncome: Number(rawData.otherIncome ?? rawData.other_income ?? 0),
    section179Deduction: Number(rawData.section179Deduction ?? rawData.section_179_deduction ?? 0),
    otherDeductions: Number(rawData.otherDeductions ?? rawData.other_deductions ?? 0),
    selfEmploymentEarnings: Number(rawData.selfEmploymentEarnings ?? rawData.self_employment_earnings ?? 0),
  }

  return { parsed, warnings, missingFields }
}
