/**
 * Tool: tax_parse_1099b
 * Parses raw 1099-B data into structured form with validation.
 */

import type { Form1099B, Form1099BTransaction, ParseFormInput, ParseFormOutput } from '../types.js'

function parseTransaction(raw: Record<string, unknown>, index: number): {
  readonly tx: Form1099BTransaction
  readonly warnings: ReadonlyArray<string>
  readonly missing: ReadonlyArray<string>
} {
  const warnings: string[] = []
  const missing: string[] = []

  const proceeds = Number(raw.proceeds ?? raw.box_1d_proceeds ?? 0)
  const costBasis = Number(raw.costBasis ?? raw.box_1e_cost_or_other_basis ?? 0)

  if (proceeds === 0) warnings.push(`Transaction ${index}: zero proceeds`)
  if (costBasis === 0) warnings.push(`Transaction ${index}: zero cost basis — verify`)

  const dateSold = String(raw.dateSold ?? raw.box_1c_date_sold_or_disposed ?? '')
  if (!dateSold) missing.push(`transaction[${index}].dateSold`)

  const dateAcquired = raw.dateAcquired ?? raw.box_1b_date_acquired
  const description = String(raw.description ?? raw.box_1a_description ?? 'Unknown security')

  const gainTypeRaw = String(raw.gainType ?? raw.box_2_gain_type ?? 'short_term').toLowerCase()
  const gainType = gainTypeRaw.includes('long') ? 'long_term' as const : 'short_term' as const

  const tx: Form1099BTransaction = {
    description,
    dateAcquired: dateAcquired ? String(dateAcquired) : null,
    dateSold,
    proceeds,
    costBasis,
    accruedMarketDiscount: Number(raw.accruedMarketDiscount ?? raw.box_1f_accrued_market_discount ?? 0),
    washSaleLossDisallowed: Number(raw.washSaleLossDisallowed ?? raw.box_1g_wash_sale_loss_disallowed ?? 0),
    gainType,
    basisReportedToIrs: Boolean(raw.basisReportedToIrs ?? raw.box_3_basis_reported_to_irs ?? false),
    federalTaxWithheld: Number(raw.federalTaxWithheld ?? raw.box_4_federal_income_tax_withheld ?? 0),
    noncoveredSecurity: Boolean(raw.noncoveredSecurity ?? raw.box_5_noncovered_security ?? false),
    reportedGrossOrNet: String(raw.reportedGrossOrNet ?? raw.box_6_reported_gross_or_net ?? 'gross') as 'gross' | 'net',
    lossNotAllowed: Number(raw.lossNotAllowed ?? raw.box_7_loss_not_allowed ?? 0),
    section1256ProfitLoss: Number(raw.section1256ProfitLoss ?? raw.box_8_profit_or_loss_realized ?? 0),
    section1256UnrealizedPl: Number(raw.section1256UnrealizedPl ?? raw.box_9_unrealized_profit_or_loss ?? 0),
    section1256BasisOfPositions: Number(raw.section1256BasisOfPositions ?? raw.box_10_basis_of_positions ?? 0),
  }

  return { tx, warnings, missing }
}

export function parse1099B(input: ParseFormInput): ParseFormOutput<Form1099B> {
  const { rawData, taxYear } = input
  const allWarnings: string[] = []
  const allMissing: string[] = []

  // Validate required payer/recipient fields
  const payerName = String(rawData.payerName ?? rawData.payer_name ?? '')
  const recipientName = String(rawData.recipientName ?? rawData.recipient_name ?? '')

  if (!payerName) allMissing.push('payerName')
  if (!recipientName) allMissing.push('recipientName')

  // Parse transactions
  const rawTransactions = (rawData.transactions ?? []) as ReadonlyArray<Record<string, unknown>>
  if (rawTransactions.length === 0) {
    allWarnings.push('No transactions found in 1099-B data')
  }

  const transactions: Form1099BTransaction[] = []
  for (let i = 0; i < rawTransactions.length; i++) {
    const { tx, warnings, missing } = parseTransaction(rawTransactions[i], i)
    transactions.push(tx)
    allWarnings.push(...warnings)
    allMissing.push(...missing)
  }

  const parsed: Form1099B = {
    payerName,
    payerTin: String(rawData.payerTin ?? rawData.payer_tin ?? ''),
    recipientName,
    recipientTin: String(rawData.recipientTin ?? rawData.recipient_tin ?? ''),
    accountNumber: String(rawData.accountNumber ?? rawData.account_number ?? ''),
    taxYear,
    transactions,
  }

  return { parsed, warnings: allWarnings, missingFields: allMissing }
}
