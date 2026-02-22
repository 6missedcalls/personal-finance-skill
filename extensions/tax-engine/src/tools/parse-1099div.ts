/**
 * Tool: tax_parse_1099div
 * Parses raw 1099-DIV data into structured form.
 */

import type { Form1099DIV, ParseFormInput, ParseFormOutput } from '../types.js'

export function parse1099DIV(input: ParseFormInput): ParseFormOutput<Form1099DIV> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const payerName = String(rawData.payerName ?? rawData.payer_name ?? '')
  if (!payerName) missingFields.push('payerName')

  const totalOrdinary = Number(rawData.totalOrdinaryDividends ?? rawData.box_1a_total_ordinary_dividends ?? 0)
  const qualified = Number(rawData.qualifiedDividends ?? rawData.box_1b_qualified_dividends ?? 0)

  if (qualified > totalOrdinary) {
    warnings.push('Qualified dividends exceed total ordinary dividends — data may be incorrect')
  }

  const nondividend = Number(rawData.nondividendDistributions ?? rawData.box_3_nondividend_distributions ?? 0)
  if (nondividend > 0) {
    warnings.push('Nondividend distributions (return of capital) present — basis adjustment needed')
  }

  const parsed: Form1099DIV = {
    payerName,
    payerTin: String(rawData.payerTin ?? rawData.payer_tin ?? ''),
    recipientName: String(rawData.recipientName ?? rawData.recipient_name ?? ''),
    recipientTin: String(rawData.recipientTin ?? rawData.recipient_tin ?? ''),
    accountNumber: String(rawData.accountNumber ?? rawData.account_number ?? ''),
    taxYear,
    totalOrdinaryDividends: totalOrdinary,
    qualifiedDividends: qualified,
    totalCapitalGainDistributions: Number(rawData.totalCapitalGainDistributions ?? rawData.box_2a_total_capital_gain_distributions ?? 0),
    unrecapSec1250Gain: Number(rawData.unrecapSec1250Gain ?? rawData.box_2b_unrecap_sec_1250_gain ?? 0),
    section1202Gain: Number(rawData.section1202Gain ?? rawData.box_2c_section_1202_gain ?? 0),
    collectibles28RateGain: Number(rawData.collectibles28RateGain ?? rawData.box_2d_collectibles_28_rate_gain ?? 0),
    nondividendDistributions: nondividend,
    federalTaxWithheld: Number(rawData.federalTaxWithheld ?? rawData.box_4_federal_income_tax_withheld ?? 0),
    section199aDividends: Number(rawData.section199aDividends ?? rawData.box_5_section_199a_dividends ?? 0),
    foreignTaxPaid: Number(rawData.foreignTaxPaid ?? rawData.box_7_foreign_tax_paid ?? 0),
    foreignCountry: String(rawData.foreignCountry ?? rawData.box_8_foreign_country_or_us_possession ?? ''),
    cashLiquidationDistributions: Number(rawData.cashLiquidationDistributions ?? rawData.box_9_cash_liquidation_distributions ?? 0),
    noncashLiquidationDistributions: Number(rawData.noncashLiquidationDistributions ?? rawData.box_10_noncash_liquidation_distributions ?? 0),
    exemptInterestDividends: Number(rawData.exemptInterestDividends ?? rawData.box_11_exempt_interest_dividends ?? 0),
    privateActivityBondInterest: Number(rawData.privateActivityBondInterest ?? rawData.box_12_specified_private_activity_bond_interest_dividends ?? 0),
  }

  return { parsed, warnings, missingFields }
}
