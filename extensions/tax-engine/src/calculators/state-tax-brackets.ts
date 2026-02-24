/**
 * State income tax calculator with progressive bracket support.
 * Covers CA, NY, TX, FL, NJ, IL, PA, MA with 2025 rates.
 * MFJ brackets scaled ~2x where applicable.
 *
 * All math uses decimal.ts to avoid floating-point drift.
 */

import { subtract, sumAll, applyRate } from './decimal.js'
import type { FilingStatus } from '../types.js'

// ─── Public Types ────────────────────────────────────────────────────

export type SupportedState =
  | 'CA'
  | 'NY'
  | 'TX'
  | 'FL'
  | 'NJ'
  | 'IL'
  | 'PA'
  | 'MA'

export interface StateTaxResult {
  readonly stateCode: string
  readonly taxableIncome: number
  readonly stateTax: number
  readonly effectiveRate: number
  readonly marginalRate: number
  readonly brackets: ReadonlyArray<{
    readonly min: number
    readonly max: number | null
    readonly rate: number
  }>
  readonly notes: ReadonlyArray<string>
}

// ─── Bracket Definition Type ─────────────────────────────────────────

interface BracketDef {
  readonly min: number
  readonly max: number | null
  readonly rate: number
}

// ─── Bracket Tables (2025 Single) ────────────────────────────────────

const CA_SINGLE: ReadonlyArray<BracketDef> = [
  { min: 0, max: 10412, rate: 0.01 },
  { min: 10412, max: 24684, rate: 0.02 },
  { min: 24684, max: 38959, rate: 0.04 },
  { min: 38959, max: 54081, rate: 0.06 },
  { min: 54081, max: 68350, rate: 0.08 },
  { min: 68350, max: 349137, rate: 0.093 },
  { min: 349137, max: 418961, rate: 0.103 },
  { min: 418961, max: 698271, rate: 0.113 },
  { min: 698271, max: 1000000, rate: 0.123 },
  { min: 1000000, max: null, rate: 0.133 },
]

const NY_SINGLE: ReadonlyArray<BracketDef> = [
  { min: 0, max: 8500, rate: 0.04 },
  { min: 8500, max: 11700, rate: 0.045 },
  { min: 11700, max: 13900, rate: 0.0525 },
  { min: 13900, max: 80650, rate: 0.0585 },
  { min: 80650, max: 215400, rate: 0.0625 },
  { min: 215400, max: 1077550, rate: 0.0685 },
  { min: 1077550, max: 5000000, rate: 0.0965 },
  { min: 5000000, max: 25000000, rate: 0.103 },
  { min: 25000000, max: null, rate: 0.109 },
]

const NJ_SINGLE: ReadonlyArray<BracketDef> = [
  { min: 0, max: 20000, rate: 0.014 },
  { min: 20000, max: 35000, rate: 0.0175 },
  { min: 35000, max: 40000, rate: 0.035 },
  { min: 40000, max: 75000, rate: 0.05525 },
  { min: 75000, max: 500000, rate: 0.0637 },
  { min: 500000, max: 1000000, rate: 0.0897 },
  { min: 1000000, max: null, rate: 0.1075 },
]

// ─── MFJ Brackets (scaled ~2x) ──────────────────────────────────────

const CA_MFJ: ReadonlyArray<BracketDef> = [
  { min: 0, max: 20824, rate: 0.01 },
  { min: 20824, max: 49368, rate: 0.02 },
  { min: 49368, max: 77918, rate: 0.04 },
  { min: 77918, max: 108162, rate: 0.06 },
  { min: 108162, max: 136700, rate: 0.08 },
  { min: 136700, max: 698274, rate: 0.093 },
  { min: 698274, max: 837922, rate: 0.103 },
  { min: 837922, max: 1396542, rate: 0.113 },
  { min: 1396542, max: 2000000, rate: 0.123 },
  { min: 2000000, max: null, rate: 0.133 },
]

const NY_MFJ: ReadonlyArray<BracketDef> = [
  { min: 0, max: 17150, rate: 0.04 },
  { min: 17150, max: 23600, rate: 0.045 },
  { min: 23600, max: 27900, rate: 0.0525 },
  { min: 27900, max: 161550, rate: 0.0585 },
  { min: 161550, max: 323200, rate: 0.0625 },
  { min: 323200, max: 2155350, rate: 0.0685 },
  { min: 2155350, max: 5000000, rate: 0.0965 },
  { min: 5000000, max: 25000000, rate: 0.103 },
  { min: 25000000, max: null, rate: 0.109 },
]

const NJ_MFJ: ReadonlyArray<BracketDef> = [
  { min: 0, max: 20000, rate: 0.014 },
  { min: 20000, max: 50000, rate: 0.0175 },
  { min: 50000, max: 70000, rate: 0.035 },
  { min: 70000, max: 80000, rate: 0.05525 },
  { min: 80000, max: 150000, rate: 0.0637 },
  { min: 150000, max: 500000, rate: 0.0637 },
  { min: 500000, max: 1000000, rate: 0.0897 },
  { min: 1000000, max: null, rate: 0.1075 },
]

// ─── State Bracket Lookup ────────────────────────────────────────────

function getBrackets(
  stateCode: string,
  filingStatus: FilingStatus
): ReadonlyArray<BracketDef> | null {
  const isMfj = filingStatus === 'married_filing_jointly'

  switch (stateCode) {
    case 'CA':
      return isMfj ? CA_MFJ : CA_SINGLE
    case 'NY':
      return isMfj ? NY_MFJ : NY_SINGLE
    case 'NJ':
      return isMfj ? NJ_MFJ : NJ_SINGLE
    default:
      return null
  }
}

// ─── Progressive Tax Calculation ─────────────────────────────────────

function computeProgressiveTax(
  income: number,
  brackets: ReadonlyArray<BracketDef>
): { readonly tax: number; readonly marginalRate: number } {
  const bracketTaxes: number[] = []
  let marginalRate = brackets[0].rate

  for (const bracket of brackets) {
    if (income <= bracket.min) break

    const upper = bracket.max !== null ? Math.min(income, bracket.max) : income
    const taxableInBracket = subtract(upper, bracket.min)
    bracketTaxes.push(applyRate(taxableInBracket, bracket.rate))
    marginalRate = bracket.rate
  }

  return {
    tax: sumAll(bracketTaxes),
    marginalRate,
  }
}

// ─── Flat Tax States ─────────────────────────────────────────────────

function computeFlatTax(
  income: number,
  rate: number
): { readonly tax: number; readonly marginalRate: number } {
  return {
    tax: applyRate(income, rate),
    marginalRate: rate,
  }
}

// ─── MA Surtax ───────────────────────────────────────────────────────

const MA_BASE_RATE = 0.05
const MA_SURTAX_RATE = 0.04
const MA_SURTAX_THRESHOLD = 1000000

function computeMaTax(
  income: number
): { readonly tax: number; readonly marginalRate: number; readonly notes: ReadonlyArray<string> } {
  const baseTax = applyRate(income, MA_BASE_RATE)
  const notes: string[] = []

  if (income > MA_SURTAX_THRESHOLD) {
    const excessIncome = subtract(income, MA_SURTAX_THRESHOLD)
    const surtax = applyRate(excessIncome, MA_SURTAX_RATE)
    notes.push('Includes 4% millionaire surtax on income over $1,000,000')
    return {
      tax: sumAll([baseTax, surtax]),
      marginalRate: MA_BASE_RATE + MA_SURTAX_RATE,
      notes,
    }
  }

  return { tax: baseTax, marginalRate: MA_BASE_RATE, notes }
}

// ─── Main Computation ────────────────────────────────────────────────

export function computeStateTax(
  stateCode: string,
  taxableIncome: number,
  filingStatus: FilingStatus
): StateTaxResult {
  const upperCode = stateCode.toUpperCase()

  if (taxableIncome <= 0) {
    return buildZeroResult(upperCode, taxableIncome)
  }

  // No-income-tax states
  if (upperCode === 'TX' || upperCode === 'FL') {
    return buildNoTaxResult(upperCode, taxableIncome)
  }

  // Flat rate states
  if (upperCode === 'IL') {
    return buildFlatResult(upperCode, taxableIncome, 0.0495)
  }
  if (upperCode === 'PA') {
    return buildFlatResult(upperCode, taxableIncome, 0.0307)
  }

  // Massachusetts (flat + surtax)
  if (upperCode === 'MA') {
    return buildMaResult(upperCode, taxableIncome)
  }

  // Progressive bracket states
  const brackets = getBrackets(upperCode, filingStatus)
  if (brackets === null) {
    return buildUnsupportedResult(upperCode, taxableIncome)
  }

  return buildProgressiveResult(upperCode, taxableIncome, brackets)
}

// ─── Result Builders ─────────────────────────────────────────────────

function buildZeroResult(stateCode: string, income: number): StateTaxResult {
  return {
    stateCode,
    taxableIncome: income,
    stateTax: 0,
    effectiveRate: 0,
    marginalRate: 0,
    brackets: [],
    notes: [],
  }
}

function buildNoTaxResult(stateCode: string, income: number): StateTaxResult {
  return {
    stateCode,
    taxableIncome: income,
    stateTax: 0,
    effectiveRate: 0,
    marginalRate: 0,
    brackets: [],
    notes: [`${stateCode} has no state income tax`],
  }
}

function buildFlatResult(
  stateCode: string,
  income: number,
  rate: number
): StateTaxResult {
  const { tax, marginalRate } = computeFlatTax(income, rate)
  return {
    stateCode,
    taxableIncome: income,
    stateTax: tax,
    effectiveRate: tax / income,
    marginalRate,
    brackets: [{ min: 0, max: null, rate }],
    notes: [],
  }
}

function buildMaResult(stateCode: string, income: number): StateTaxResult {
  const { tax, marginalRate, notes } = computeMaTax(income)
  const brackets: ReadonlyArray<BracketDef> = income > MA_SURTAX_THRESHOLD
    ? [
      { min: 0, max: null, rate: MA_BASE_RATE },
      { min: MA_SURTAX_THRESHOLD, max: null, rate: MA_SURTAX_RATE },
    ]
    : [{ min: 0, max: null, rate: MA_BASE_RATE }]

  return {
    stateCode,
    taxableIncome: income,
    stateTax: tax,
    effectiveRate: tax / income,
    marginalRate,
    brackets,
    notes,
  }
}

function buildProgressiveResult(
  stateCode: string,
  income: number,
  brackets: ReadonlyArray<BracketDef>
): StateTaxResult {
  const { tax, marginalRate } = computeProgressiveTax(income, brackets)
  const notes: string[] = []

  if (stateCode === 'CA' && income > 1000000) {
    notes.push('Includes Mental Health Services Tax (1% over $1M)')
  }

  return {
    stateCode,
    taxableIncome: income,
    stateTax: tax,
    effectiveRate: tax / income,
    marginalRate,
    brackets,
    notes,
  }
}

function buildUnsupportedResult(
  stateCode: string,
  income: number
): StateTaxResult {
  return {
    stateCode,
    taxableIncome: income,
    stateTax: 0,
    effectiveRate: 0,
    marginalRate: 0,
    brackets: [],
    notes: ['State not supported'],
  }
}
