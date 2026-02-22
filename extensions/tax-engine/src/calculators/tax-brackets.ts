/**
 * 2025 federal tax brackets and rates.
 * Capital gains rates for qualified dividends and long-term gains.
 * Standard deductions by filing status.
 *
 * Source: IRS Revenue Procedure (2025 tax year inflation adjustments).
 */

import type { FilingStatus, TaxBracket } from '../types.js'

// ─── 2025 Standard Deductions ────────────────────────────────────────

const STANDARD_DEDUCTIONS: Record<FilingStatus, number> = {
  single: 15000,
  married_filing_jointly: 30000,
  married_filing_separately: 15000,
  head_of_household: 22500,
}

export function getStandardDeduction(status: FilingStatus): number {
  return STANDARD_DEDUCTIONS[status]
}

// ─── 2025 Ordinary Income Brackets ──────────────────────────────────

const ORDINARY_BRACKETS: Record<FilingStatus, ReadonlyArray<TaxBracket>> = {
  single: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
  married_filing_jointly: [
    { min: 0, max: 23850, rate: 0.10 },
    { min: 23850, max: 96950, rate: 0.12 },
    { min: 96950, max: 206700, rate: 0.22 },
    { min: 206700, max: 394600, rate: 0.24 },
    { min: 394600, max: 501050, rate: 0.32 },
    { min: 501050, max: 751600, rate: 0.35 },
    { min: 751600, max: null, rate: 0.37 },
  ],
  married_filing_separately: [
    { min: 0, max: 11925, rate: 0.10 },
    { min: 11925, max: 48475, rate: 0.12 },
    { min: 48475, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250525, rate: 0.32 },
    { min: 250525, max: 375800, rate: 0.35 },
    { min: 375800, max: null, rate: 0.37 },
  ],
  head_of_household: [
    { min: 0, max: 17000, rate: 0.10 },
    { min: 17000, max: 64850, rate: 0.12 },
    { min: 64850, max: 103350, rate: 0.22 },
    { min: 103350, max: 197300, rate: 0.24 },
    { min: 197300, max: 250500, rate: 0.32 },
    { min: 250500, max: 626350, rate: 0.35 },
    { min: 626350, max: null, rate: 0.37 },
  ],
}

export function getOrdinaryBrackets(status: FilingStatus): ReadonlyArray<TaxBracket> {
  return ORDINARY_BRACKETS[status]
}

// ─── 2025 Long-Term Capital Gains / Qualified Dividend Brackets ─────

const LTCG_BRACKETS: Record<FilingStatus, ReadonlyArray<TaxBracket>> = {
  single: [
    { min: 0, max: 48350, rate: 0.00 },
    { min: 48350, max: 533400, rate: 0.15 },
    { min: 533400, max: null, rate: 0.20 },
  ],
  married_filing_jointly: [
    { min: 0, max: 96700, rate: 0.00 },
    { min: 96700, max: 600050, rate: 0.15 },
    { min: 600050, max: null, rate: 0.20 },
  ],
  married_filing_separately: [
    { min: 0, max: 48350, rate: 0.00 },
    { min: 48350, max: 300025, rate: 0.15 },
    { min: 300025, max: null, rate: 0.20 },
  ],
  head_of_household: [
    { min: 0, max: 64750, rate: 0.00 },
    { min: 64750, max: 566700, rate: 0.15 },
    { min: 566700, max: null, rate: 0.20 },
  ],
}

export function getLtcgBrackets(status: FilingStatus): ReadonlyArray<TaxBracket> {
  return LTCG_BRACKETS[status]
}

// ─── NIIT (Net Investment Income Tax) ────────────────────────────────

const NIIT_THRESHOLDS: Record<FilingStatus, number> = {
  single: 200000,
  married_filing_jointly: 250000,
  married_filing_separately: 125000,
  head_of_household: 200000,
}

export const NIIT_RATE = 0.038

export function getNiitThreshold(status: FilingStatus): number {
  return NIIT_THRESHOLDS[status]
}

// ─── Self-Employment Tax ─────────────────────────────────────────────

export const SE_TAX_RATE = 0.153           // 12.4% SS + 2.9% Medicare
export const SE_SOCIAL_SECURITY_CAP = 176100  // 2025 wage base
export const SE_MEDICARE_ADDITIONAL_THRESHOLD = 200000
export const SE_MEDICARE_ADDITIONAL_RATE = 0.009

// ─── State Tax (simplified flat rates for common states) ─────────────

const STATE_FLAT_RATES: Record<string, number> = {
  CA: 0.093,   // top marginal (simplified)
  NY: 0.0685,
  TX: 0,
  FL: 0,
  WA: 0,
  NV: 0,
  IL: 0.0495,
  PA: 0.0307,
  MA: 0.05,
  NJ: 0.0675,
  CO: 0.044,
  AZ: 0.025,
  GA: 0.0549,
  NC: 0.045,
  VA: 0.0575,
  OH: 0.035,
  MN: 0.0785,
  OR: 0.099,
  HI: 0.11,
}

export function getStateTaxRate(stateCode: string): number {
  return STATE_FLAT_RATES[stateCode.toUpperCase()] ?? 0.05
}
