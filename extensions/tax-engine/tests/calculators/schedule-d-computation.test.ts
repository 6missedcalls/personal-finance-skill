import { describe, it, expect } from 'vitest'
import { computeScheduleD } from '../../src/calculators/schedule-d-computation.js'

describe('computeScheduleD', () => {
  // ── Net Gain (no carryover needed) ─────────────────────────────────

  it('computes net gain with no carryover', () => {
    const result = computeScheduleD({
      shortTermGainLoss: 5000,
      longTermGainLoss: 10000,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netShortTermGainLoss).toBe(5000)
    expect(result.netLongTermGainLoss).toBe(10000)
    expect(result.netCapitalGainLoss).toBe(15000)
    expect(result.capitalLossDeduction).toBe(0)
    expect(result.carryoverToNextYear).toEqual({ shortTerm: 0, longTerm: 0 })
    expect(result.qualifiesForPreferentialRates).toBe(true)
  })

  // ── Net loss under $3,000 cap ──────────────────────────────────────

  it('computes net loss under $3,000 cap (fully deductible)', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -2000,
      longTermGainLoss: 0,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netCapitalGainLoss).toBe(-2000)
    expect(result.capitalLossDeduction).toBe(2000)
    expect(result.carryoverToNextYear).toEqual({ shortTerm: 0, longTerm: 0 })
  })

  // ── Net loss at exactly $3,000 ─────────────────────────────────────

  it('computes net loss at exactly $3,000', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -3000,
      longTermGainLoss: 0,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netCapitalGainLoss).toBe(-3000)
    expect(result.capitalLossDeduction).toBe(3000)
    expect(result.carryoverToNextYear).toEqual({ shortTerm: 0, longTerm: 0 })
  })

  // ── Net loss exceeding $3,000 (verify carryover) ───────────────────

  it('caps deduction at $3,000 and carries over excess loss', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -8000,
      longTermGainLoss: 0,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netCapitalGainLoss).toBe(-8000)
    expect(result.capitalLossDeduction).toBe(3000)
    expect(result.carryoverToNextYear.shortTerm).toBe(-5000)
    expect(result.carryoverToNextYear.longTerm).toBe(0)
  })

  // ── MFS cap of $1,500 ──────────────────────────────────────────────

  it('uses $1,500 cap for married_filing_separately', () => {
    const result = computeScheduleD(
      {
        shortTermGainLoss: -5000,
        longTermGainLoss: 0,
        capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
        capitalGainDistributions: 0,
      },
      'married_filing_separately'
    )

    expect(result.capitalLossDeduction).toBe(1500)
    expect(result.carryoverToNextYear.shortTerm).toBe(-3500)
  })

  // ── Mixed ST gain / LT loss ────────────────────────────────────────

  it('handles mixed short-term gain and long-term loss', () => {
    const result = computeScheduleD({
      shortTermGainLoss: 4000,
      longTermGainLoss: -10000,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netShortTermGainLoss).toBe(4000)
    expect(result.netLongTermGainLoss).toBe(-10000)
    expect(result.netCapitalGainLoss).toBe(-6000)
    expect(result.capitalLossDeduction).toBe(3000)
    // ST is positive, so no ST carryover; LT absorbs the deduction
    expect(result.carryoverToNextYear.shortTerm).toBe(0)
    expect(result.carryoverToNextYear.longTerm).toBe(-7000)
    expect(result.qualifiesForPreferentialRates).toBe(false)
  })

  // ── Mixed LT gain / ST loss ────────────────────────────────────────

  it('handles mixed long-term gain and short-term loss', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -7000,
      longTermGainLoss: 2000,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netShortTermGainLoss).toBe(-7000)
    expect(result.netLongTermGainLoss).toBe(2000)
    expect(result.netCapitalGainLoss).toBe(-5000)
    expect(result.capitalLossDeduction).toBe(3000)
    // ST loss of -7000 absorbs $3000 deduction -> -4000 remaining
    expect(result.carryoverToNextYear.shortTerm).toBe(-4000)
    // LT is positive, no LT carryover
    expect(result.carryoverToNextYear.longTerm).toBe(0)
    expect(result.qualifiesForPreferentialRates).toBe(true)
  })

  // ── Capital gain distributions ─────────────────────────────────────

  it('includes capital gain distributions in LT calculation', () => {
    const result = computeScheduleD({
      shortTermGainLoss: 0,
      longTermGainLoss: 3000,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 2500,
    })

    expect(result.netLongTermGainLoss).toBe(5500)
    expect(result.netCapitalGainLoss).toBe(5500)
    expect(result.qualifiesForPreferentialRates).toBe(true)
  })

  // ── Zero inputs ────────────────────────────────────────────────────

  it('handles all-zero inputs', () => {
    const result = computeScheduleD({
      shortTermGainLoss: 0,
      longTermGainLoss: 0,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netShortTermGainLoss).toBe(0)
    expect(result.netLongTermGainLoss).toBe(0)
    expect(result.netCapitalGainLoss).toBe(0)
    expect(result.capitalLossDeduction).toBe(0)
    expect(result.carryoverToNextYear).toEqual({ shortTerm: 0, longTerm: 0 })
    expect(result.qualifiesForPreferentialRates).toBe(false)
  })

  // ── Carryover character preservation (ST vs LT) ────────────────────

  it('preserves carryover character with both ST and LT losses', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -2000,
      longTermGainLoss: -6000,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.netCapitalGainLoss).toBe(-8000)
    expect(result.capitalLossDeduction).toBe(3000)
    // $2000 ST loss, $3000 deduction: ST absorbs $2000, LT absorbs $1000
    // ST carryover: -2000 + 2000 = 0
    // LT carryover: -6000 + 1000 = -5000
    expect(result.carryoverToNextYear.shortTerm).toBe(0)
    expect(result.carryoverToNextYear.longTerm).toBe(-5000)
  })

  // ── Carryover applied from prior year ──────────────────────────────

  it('applies prior year carryover to current year gains', () => {
    const result = computeScheduleD({
      shortTermGainLoss: 5000,
      longTermGainLoss: 3000,
      capitalLossCarryover: { shortTerm: -2000, longTerm: -4000 },
      capitalGainDistributions: 0,
    })

    expect(result.netShortTermGainLoss).toBe(3000) // 5000 + (-2000)
    expect(result.netLongTermGainLoss).toBe(-1000) // 3000 + (-4000)
    expect(result.netCapitalGainLoss).toBe(2000)
    expect(result.capitalLossDeduction).toBe(0) // net positive
    expect(result.carryoverToNextYear).toEqual({ shortTerm: 0, longTerm: 0 })
  })

  // ── Default filing status uses $3,000 cap ──────────────────────────

  it('uses $3,000 cap when filing status is not provided', () => {
    const result = computeScheduleD({
      shortTermGainLoss: -10000,
      longTermGainLoss: 0,
      capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
      capitalGainDistributions: 0,
    })

    expect(result.capitalLossDeduction).toBe(3000)
  })

  it('uses $3,000 cap for single filing status', () => {
    const result = computeScheduleD(
      {
        shortTermGainLoss: -10000,
        longTermGainLoss: 0,
        capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
        capitalGainDistributions: 0,
      },
      'single'
    )

    expect(result.capitalLossDeduction).toBe(3000)
  })

  it('uses $3,000 cap for married_filing_jointly', () => {
    const result = computeScheduleD(
      {
        shortTermGainLoss: -10000,
        longTermGainLoss: 0,
        capitalLossCarryover: { shortTerm: 0, longTerm: 0 },
        capitalGainDistributions: 0,
      },
      'married_filing_jointly'
    )

    expect(result.capitalLossDeduction).toBe(3000)
  })
})
