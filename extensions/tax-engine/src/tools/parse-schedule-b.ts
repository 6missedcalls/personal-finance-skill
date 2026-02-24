/**
 * Tool: tax_parse_schedule_b
 * Parses raw Schedule B (interest and dividends) data into structured form.
 */

import type { ScheduleB, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

interface PayorEntry {
  readonly name: string
  readonly amount: number
}

function parsePayors(raw: unknown): ReadonlyArray<PayorEntry> {
  if (!Array.isArray(raw)) return []
  return raw.map((entry: Record<string, unknown>) => ({
    name: String(entry.name ?? entry.payor_name ?? ''),
    amount: Number(entry.amount ?? 0),
  }))
}

function sumPayors(payors: ReadonlyArray<PayorEntry>): number {
  return payors.reduce((sum, p) => sum + p.amount, 0)
}

export function parseScheduleB(input: ParseFormInput): ParseFormOutput<ScheduleB> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const interestPayors = parsePayors(rawData.interestPayors ?? rawData.interest_payors)
  const dividendPayors = parsePayors(rawData.dividendPayors ?? rawData.dividend_payors)

  const computedTotalInterest = sumPayors(interestPayors)
  const providedTotalInterest = readNum(rawData, 'totalInterest', 'total_interest')
  const totalInterest = interestPayors.length > 0 ? computedTotalInterest : providedTotalInterest

  if (interestPayors.length > 0 && providedTotalInterest > 0 && computedTotalInterest !== providedTotalInterest) {
    warnings.push(`Computed interest total ($${computedTotalInterest}) differs from provided total ($${providedTotalInterest})`)
  }

  const computedTotalDividends = sumPayors(dividendPayors)
  const providedTotalDividends = readNum(rawData, 'totalOrdinaryDividends', 'total_ordinary_dividends')
  const totalOrdinaryDividends = dividendPayors.length > 0 ? computedTotalDividends : providedTotalDividends

  if (dividendPayors.length > 0 && providedTotalDividends > 0 && computedTotalDividends !== providedTotalDividends) {
    warnings.push(`Computed dividend total ($${computedTotalDividends}) differs from provided total ($${providedTotalDividends})`)
  }

  const hasForeignRaw = rawData.hasForeignAccountOrTrust ?? rawData.has_foreign_account_or_trust
  const hasForeignAccountOrTrust = Boolean(hasForeignRaw)

  const foreignRaw = rawData.foreignCountries ?? rawData.foreign_countries
  const foreignCountries: ReadonlyArray<string> = Array.isArray(foreignRaw)
    ? foreignRaw.map((c: unknown) => String(c))
    : []

  if (hasForeignAccountOrTrust && foreignCountries.length === 0) {
    warnings.push('Foreign account indicated but no foreign countries listed')
  }

  if (interestPayors.length === 0 && totalInterest === 0 && dividendPayors.length === 0 && totalOrdinaryDividends === 0) {
    warnings.push('No interest or dividend data provided')
  }

  const parsed: ScheduleB = {
    taxYear,
    interestPayors,
    totalInterest,
    dividendPayors,
    totalOrdinaryDividends,
    hasForeignAccountOrTrust,
    foreignCountries,
  }

  return { parsed, warnings, missingFields }
}
