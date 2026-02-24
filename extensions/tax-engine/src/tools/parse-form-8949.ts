/**
 * Tool: tax_parse_form_8949
 * Parses raw Form 8949 (sales and dispositions) data into structured form.
 */

import type { Form8949, Form8949Transaction, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

function parseTransaction(raw: Record<string, unknown>, index: number): {
  readonly tx: Form8949Transaction
  readonly warnings: ReadonlyArray<string>
  readonly missing: ReadonlyArray<string>
} {
  const warnings: string[] = []
  const missing: string[] = []

  const description = String(raw.description ?? raw.asset_description ?? '')
  const dateSold = String(raw.dateSold ?? raw.date_sold ?? '')
  const dateAcquiredRaw = raw.dateAcquired ?? raw.date_acquired
  const dateAcquired = dateAcquiredRaw ? String(dateAcquiredRaw) : null

  if (!dateSold) missing.push(`transaction[${index}].dateSold`)
  if (!description) warnings.push(`Transaction ${index}: missing description`)

  const proceeds = readNum(raw, 'proceeds')
  const costBasis = readNum(raw, 'costBasis', 'cost_basis')
  const adjustmentAmount = readNum(raw, 'adjustmentAmount', 'adjustment_amount')
  const gainOrLoss = proceeds - costBasis + adjustmentAmount

  if (proceeds === 0) warnings.push(`Transaction ${index}: zero proceeds`)

  const tx: Form8949Transaction = {
    description,
    dateAcquired,
    dateSold,
    proceeds,
    costBasis,
    adjustmentCode: String(raw.adjustmentCode ?? raw.adjustment_code ?? ''),
    adjustmentAmount,
    gainOrLoss,
  }

  return { tx, warnings, missing }
}

function sumField(txs: ReadonlyArray<Form8949Transaction>, field: keyof Form8949Transaction): number {
  return txs.reduce((sum, tx) => sum + Number(tx[field]), 0)
}

export function parseForm8949(input: ParseFormInput): ParseFormOutput<Form8949> {
  const { rawData, taxYear } = input
  const allWarnings: string[] = []
  const allMissing: string[] = []

  const rawShortTerm = (rawData.shortTermPartI ?? rawData.short_term_part_i ?? []) as ReadonlyArray<Record<string, unknown>>
  const rawLongTerm = (rawData.longTermPartII ?? rawData.long_term_part_ii ?? []) as ReadonlyArray<Record<string, unknown>>

  if (rawShortTerm.length === 0 && rawLongTerm.length === 0) {
    allWarnings.push('No transactions found in Form 8949 data')
  }

  const shortTermPartI: Form8949Transaction[] = []
  for (let i = 0; i < rawShortTerm.length; i++) {
    const { tx, warnings, missing } = parseTransaction(rawShortTerm[i], i)
    shortTermPartI.push(tx)
    allWarnings.push(...warnings)
    allMissing.push(...missing)
  }

  const longTermPartII: Form8949Transaction[] = []
  for (let i = 0; i < rawLongTerm.length; i++) {
    const { tx, warnings, missing } = parseTransaction(rawLongTerm[i], i)
    longTermPartII.push(tx)
    allWarnings.push(...warnings)
    allMissing.push(...missing)
  }

  const parsed: Form8949 = {
    taxYear,
    shortTermPartI,
    longTermPartII,
    totalShortTermProceeds: sumField(shortTermPartI, 'proceeds'),
    totalShortTermBasis: sumField(shortTermPartI, 'costBasis'),
    totalShortTermAdjustments: sumField(shortTermPartI, 'adjustmentAmount'),
    totalShortTermGainLoss: sumField(shortTermPartI, 'gainOrLoss'),
    totalLongTermProceeds: sumField(longTermPartII, 'proceeds'),
    totalLongTermBasis: sumField(longTermPartII, 'costBasis'),
    totalLongTermAdjustments: sumField(longTermPartII, 'adjustmentAmount'),
    totalLongTermGainLoss: sumField(longTermPartII, 'gainOrLoss'),
  }

  return { parsed, warnings: allWarnings, missingFields: allMissing }
}
