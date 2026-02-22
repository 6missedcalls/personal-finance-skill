/**
 * Tool: tax_parse_1099int
 * Parses raw 1099-INT data into structured form.
 */

import type { Form1099INT, ParseFormInput, ParseFormOutput } from '../types.js'

export function parse1099INT(input: ParseFormInput): ParseFormOutput<Form1099INT> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const payerName = String(rawData.payerName ?? rawData.payer_name ?? '')
  if (!payerName) missingFields.push('payerName')

  const interestIncome = Number(rawData.interestIncome ?? rawData.box_1_interest_income ?? 0)
  if (interestIncome === 0) {
    warnings.push('Zero interest income — verify data')
  }

  const bondPremium = Number(rawData.bondPremium ?? rawData.box_11_bond_premium ?? 0)
  if (bondPremium > 0) {
    warnings.push('Bond premium present — may offset taxable interest')
  }

  const taxExemptInterest = Number(rawData.taxExemptInterest ?? rawData.box_8_tax_exempt_interest ?? 0)
  if (taxExemptInterest > 0) {
    warnings.push('Tax-exempt interest present — not included in taxable income but reported on return')
  }

  const parsed: Form1099INT = {
    payerName,
    payerTin: String(rawData.payerTin ?? rawData.payer_tin ?? ''),
    recipientName: String(rawData.recipientName ?? rawData.recipient_name ?? ''),
    recipientTin: String(rawData.recipientTin ?? rawData.recipient_tin ?? ''),
    accountNumber: String(rawData.accountNumber ?? rawData.account_number ?? ''),
    taxYear,
    interestIncome,
    earlyWithdrawalPenalty: Number(rawData.earlyWithdrawalPenalty ?? rawData.box_2_early_withdrawal_penalty ?? 0),
    usSavingsBondInterest: Number(rawData.usSavingsBondInterest ?? rawData.box_3_interest_on_us_savings_bonds_treasury_obligations ?? 0),
    federalTaxWithheld: Number(rawData.federalTaxWithheld ?? rawData.box_4_federal_income_tax_withheld ?? 0),
    investmentExpenses: Number(rawData.investmentExpenses ?? rawData.box_5_investment_expenses ?? 0),
    foreignTaxPaid: Number(rawData.foreignTaxPaid ?? rawData.box_6_foreign_tax_paid ?? 0),
    foreignCountry: String(rawData.foreignCountry ?? rawData.box_7_foreign_country_or_us_possession ?? ''),
    taxExemptInterest,
    privateActivityBondInterest: Number(rawData.privateActivityBondInterest ?? rawData.box_9_specified_private_activity_bond_interest ?? 0),
    marketDiscount: Number(rawData.marketDiscount ?? rawData.box_10_market_discount ?? 0),
    bondPremium,
    bondPremiumTreasury: Number(rawData.bondPremiumTreasury ?? rawData.box_12_bond_premium_on_treasury_obligations ?? 0),
    bondPremiumTaxExempt: Number(rawData.bondPremiumTaxExempt ?? rawData.box_13_bond_premium_on_tax_exempt_bond ?? 0),
  }

  return { parsed, warnings, missingFields }
}
