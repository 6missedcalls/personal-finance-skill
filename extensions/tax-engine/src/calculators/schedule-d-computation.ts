/**
 * Schedule D (Form 1040) — Capital Gains and Losses computation.
 * Handles net gain/loss netting, $3,000 capital loss deduction cap,
 * carryover character preservation (short-term vs long-term),
 * and preferential rate qualification.
 *
 * All math uses decimal.ts to avoid floating-point drift.
 */

import { add, subtract, clampMin } from './decimal.js'
import type { FilingStatus } from '../types.js'

// ─── Interfaces ──────────────────────────────────────────────────────

export interface ScheduleDInput {
  readonly shortTermGainLoss: number
  readonly longTermGainLoss: number
  readonly capitalLossCarryover: {
    readonly shortTerm: number
    readonly longTerm: number
  }
  readonly capitalGainDistributions: number
}

export interface ScheduleDResult {
  readonly netShortTermGainLoss: number
  readonly netLongTermGainLoss: number
  readonly netCapitalGainLoss: number
  readonly capitalLossDeduction: number
  readonly carryoverToNextYear: {
    readonly shortTerm: number
    readonly longTerm: number
  }
  readonly qualifiesForPreferentialRates: boolean
}

// ─── Constants ───────────────────────────────────────────────────────

const CAPITAL_LOSS_CAP_DEFAULT = 3000
const CAPITAL_LOSS_CAP_MFS = 1500

// ─── Helpers ─────────────────────────────────────────────────────────

function getCapitalLossCap(filingStatus?: FilingStatus): number {
  return filingStatus === 'married_filing_separately'
    ? CAPITAL_LOSS_CAP_MFS
    : CAPITAL_LOSS_CAP_DEFAULT
}

function computeDeduction(
  netCapitalGainLoss: number,
  cap: number
): number {
  if (netCapitalGainLoss >= 0) {
    return 0
  }
  const absLoss = Math.abs(netCapitalGainLoss)
  return Math.min(absLoss, cap)
}

function computeCarryover(
  netShortTerm: number,
  netLongTerm: number,
  deduction: number
): { readonly shortTerm: number; readonly longTerm: number } {
  // If no net loss beyond the deduction, no carryover
  const netTotal = add(netShortTerm, netLongTerm)
  if (netTotal >= 0) {
    return { shortTerm: 0, longTerm: 0 }
  }

  // Remaining loss after deduction that carries forward
  const totalLossAfterDeduction = add(netTotal, deduction)

  // If the deduction consumed all the loss, no carryover
  if (totalLossAfterDeduction >= 0) {
    return { shortTerm: 0, longTerm: 0 }
  }

  // Apply deduction against ST first, then LT
  return applyDeductionToCharacter(netShortTerm, netLongTerm, deduction)
}

function applyDeductionToCharacter(
  netShortTerm: number,
  netLongTerm: number,
  deduction: number
): { readonly shortTerm: number; readonly longTerm: number } {
  let remainingDeduction = deduction

  // Apply deduction to short-term losses first
  let stCarryover = netShortTerm
  if (netShortTerm < 0) {
    const stAbsorbed = Math.min(Math.abs(netShortTerm), remainingDeduction)
    stCarryover = add(netShortTerm, stAbsorbed)
    remainingDeduction = subtract(remainingDeduction, stAbsorbed)
  }

  // Apply remaining deduction to long-term losses
  let ltCarryover = netLongTerm
  if (netLongTerm < 0 && remainingDeduction > 0) {
    const ltAbsorbed = Math.min(Math.abs(netLongTerm), remainingDeduction)
    ltCarryover = add(netLongTerm, ltAbsorbed)
  }

  // Net ST gains against remaining ST carryover before carrying forward
  // Carryover only applies to net losses (negative values)
  return {
    shortTerm: clampMin(stCarryover, stCarryover) < 0 ? stCarryover : 0,
    longTerm: clampMin(ltCarryover, ltCarryover) < 0 ? ltCarryover : 0,
  }
}

// ─── Main Computation ────────────────────────────────────────────────

export function computeScheduleD(
  input: ScheduleDInput,
  filingStatus?: FilingStatus
): ScheduleDResult {
  const netShortTermGainLoss = add(
    input.shortTermGainLoss,
    input.capitalLossCarryover.shortTerm
  )

  const netLongTermGainLoss = add(
    add(input.longTermGainLoss, input.capitalLossCarryover.longTerm),
    input.capitalGainDistributions
  )

  const netCapitalGainLoss = add(netShortTermGainLoss, netLongTermGainLoss)

  const cap = getCapitalLossCap(filingStatus)
  const capitalLossDeduction = computeDeduction(netCapitalGainLoss, cap)

  const carryoverToNextYear = computeCarryover(
    netShortTermGainLoss,
    netLongTermGainLoss,
    capitalLossDeduction
  )

  const qualifiesForPreferentialRates = netLongTermGainLoss > 0

  return {
    netShortTermGainLoss,
    netLongTermGainLoss,
    netCapitalGainLoss,
    capitalLossDeduction,
    carryoverToNextYear,
    qualifiesForPreferentialRates,
  }
}
