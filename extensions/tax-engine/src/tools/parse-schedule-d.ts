/**
 * Tool: tax_parse_schedule_d
 * Parses raw Schedule D (capital gains and losses) data into structured form.
 */

import type { ScheduleD, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

function determineTaxMethod(
  netShortTerm: number,
  netLongTerm: number,
  netGain: number,
): "regular" | "schedule_d_worksheet" | "qualified_dividends_worksheet" {
  if (netGain <= 0) return 'regular'
  if (netLongTerm > 0) return 'schedule_d_worksheet'
  if (netShortTerm > 0 && netLongTerm <= 0) return 'regular'
  return 'qualified_dividends_worksheet'
}

export function parseScheduleD(input: ParseFormInput): ParseFormOutput<ScheduleD> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const shortTermFromForm8949 = readNum(rawData, 'shortTermFromForm8949', 'short_term_from_form_8949')
  const shortTermFromScheduleK1 = readNum(rawData, 'shortTermFromScheduleK1', 'short_term_from_schedule_k1')
  const shortTermCapitalLossCarryover = readNum(rawData, 'shortTermCapitalLossCarryover', 'short_term_capital_loss_carryover')

  const netShortTermGainLoss = shortTermFromForm8949 + shortTermFromScheduleK1 + shortTermCapitalLossCarryover

  const longTermFromForm8949 = readNum(rawData, 'longTermFromForm8949', 'long_term_from_form_8949')
  const longTermFromScheduleK1 = readNum(rawData, 'longTermFromScheduleK1', 'long_term_from_schedule_k1')
  const longTermCapitalGainDistributions = readNum(rawData, 'longTermCapitalGainDistributions', 'long_term_capital_gain_distributions')
  const longTermCapitalLossCarryover = readNum(rawData, 'longTermCapitalLossCarryover', 'long_term_capital_loss_carryover')

  const netLongTermGainLoss =
    longTermFromForm8949 + longTermFromScheduleK1 + longTermCapitalGainDistributions + longTermCapitalLossCarryover

  const netGainLoss = netShortTermGainLoss + netLongTermGainLoss

  const qualifiesRaw = rawData.qualifiesForExceptionToForm4952 ?? rawData.qualifies_for_exception_to_form_4952
  const qualifiesForExceptionToForm4952 = Boolean(qualifiesRaw ?? false)

  const taxComputationMethod = determineTaxMethod(netShortTermGainLoss, netLongTermGainLoss, netGainLoss)

  if (netGainLoss < -3000) {
    warnings.push('Net capital loss exceeds $3,000 annual deduction limit — excess carries forward')
  }

  if (shortTermCapitalLossCarryover !== 0 || longTermCapitalLossCarryover !== 0) {
    warnings.push('Capital loss carryover present — verify against prior year Schedule D')
  }

  const parsed: ScheduleD = {
    taxYear,
    shortTermFromForm8949,
    shortTermFromScheduleK1,
    shortTermCapitalLossCarryover,
    netShortTermGainLoss,
    longTermFromForm8949,
    longTermFromScheduleK1,
    longTermCapitalGainDistributions,
    longTermCapitalLossCarryover,
    netLongTermGainLoss,
    netGainLoss,
    qualifiesForExceptionToForm4952,
    taxComputationMethod,
  }

  return { parsed, warnings, missingFields }
}
