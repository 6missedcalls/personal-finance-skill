/**
 * Alternative Minimum Tax (AMT) computation for 2025 tax year.
 * Handles AMTI calculation, exemption phaseouts, and two-tier
 * AMT rate structure (26% / 28%).
 *
 * All math uses decimal.ts to avoid floating-point drift.
 */

import { add, subtract, clampMin, applyRate } from './decimal.js'
import type { FilingStatus } from '../types.js'

// ─── Public Types ────────────────────────────────────────────────────

export interface AmtInput {
  readonly taxableIncome: number
  readonly filingStatus: FilingStatus
  readonly stateAndLocalTaxDeduction: number
  readonly taxExemptInterestFromPABs: number
  readonly incentiveStockOptionBargainElement: number
  readonly otherAdjustments: number
  readonly regularTax: number
}

export interface AmtResult {
  readonly amti: number
  readonly exemptionAmount: number
  readonly exemptionPhaseoutStart: number
  readonly reducedExemption: number
  readonly amtBase: number
  readonly tentativeMinimumTax: number
  readonly alternativeMinimumTax: number
  readonly isSubjectToAmt: boolean
}

// ─── 2025 AMT Parameters ────────────────────────────────────────────

interface AmtParams {
  readonly exemption: number
  readonly phaseoutStart: number
  readonly bracketThreshold: number
}

const AMT_PARAMS: Record<FilingStatus, AmtParams> = {
  single: {
    exemption: 88100,
    phaseoutStart: 609350,
    bracketThreshold: 248300,
  },
  head_of_household: {
    exemption: 88100,
    phaseoutStart: 609350,
    bracketThreshold: 248300,
  },
  married_filing_jointly: {
    exemption: 137000,
    phaseoutStart: 1218700,
    bracketThreshold: 248300,
  },
  married_filing_separately: {
    exemption: 68500,
    phaseoutStart: 609350,
    bracketThreshold: 124150,
  },
}

const AMT_RATE_LOW = 0.26
const AMT_RATE_HIGH = 0.28
const PHASEOUT_RATE = 0.25

// ─── Helpers ─────────────────────────────────────────────────────────

function computeAmti(input: AmtInput): number {
  return add(
    add(
      add(input.taxableIncome, input.stateAndLocalTaxDeduction),
      input.taxExemptInterestFromPABs
    ),
    add(input.incentiveStockOptionBargainElement, input.otherAdjustments)
  )
}

function computeReducedExemption(
  amti: number,
  exemption: number,
  phaseoutStart: number
): number {
  if (amti <= phaseoutStart) {
    return exemption
  }

  const excess = subtract(amti, phaseoutStart)
  const reduction = applyRate(excess, PHASEOUT_RATE)
  return clampMin(subtract(exemption, reduction), 0)
}

function computeTentativeMinimumTax(
  amtBase: number,
  bracketThreshold: number
): number {
  if (amtBase <= bracketThreshold) {
    return applyRate(amtBase, AMT_RATE_LOW)
  }

  const lowTierTax = applyRate(bracketThreshold, AMT_RATE_LOW)
  const highTierAmount = subtract(amtBase, bracketThreshold)
  const highTierTax = applyRate(highTierAmount, AMT_RATE_HIGH)
  return add(lowTierTax, highTierTax)
}

// ─── Main Computation ────────────────────────────────────────────────

export function computeAmt(input: AmtInput): AmtResult {
  const params = AMT_PARAMS[input.filingStatus]

  const amti = computeAmti(input)

  const reducedExemption = computeReducedExemption(
    amti,
    params.exemption,
    params.phaseoutStart
  )

  const amtBase = clampMin(subtract(amti, reducedExemption), 0)

  const tentativeMinimumTax = computeTentativeMinimumTax(
    amtBase,
    params.bracketThreshold
  )

  const alternativeMinimumTax = clampMin(
    subtract(tentativeMinimumTax, input.regularTax),
    0
  )

  return {
    amti,
    exemptionAmount: params.exemption,
    exemptionPhaseoutStart: params.phaseoutStart,
    reducedExemption,
    amtBase,
    tentativeMinimumTax,
    alternativeMinimumTax,
    isSubjectToAmt: alternativeMinimumTax > 0,
  }
}
