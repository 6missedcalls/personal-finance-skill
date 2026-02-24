import { describe, it, expect } from 'vitest'
import { computeAmt } from '../../src/calculators/amt-calculation.js'
import type { AmtInput } from '../../src/calculators/amt-calculation.js'

// ── Helper to build input with defaults ──────────────────────────────

function buildInput(overrides: Partial<AmtInput> = {}): AmtInput {
  return {
    taxableIncome: 200000,
    filingStatus: 'single',
    stateAndLocalTaxDeduction: 0,
    taxExemptInterestFromPABs: 0,
    incentiveStockOptionBargainElement: 0,
    otherAdjustments: 0,
    regularTax: 40000,
    ...overrides,
  }
}

describe('computeAmt', () => {
  // ── No AMT (regular tax exceeds TMT) ───────────────────────────────

  it('returns zero AMT when regular tax exceeds TMT', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 150000,
        regularTax: 50000,
      })
    )

    expect(result.alternativeMinimumTax).toBe(0)
    expect(result.isSubjectToAmt).toBe(false)
  })

  // ── AMT triggered by ISO exercise ──────────────────────────────────

  it('triggers AMT from large ISO bargain element', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 200000,
        incentiveStockOptionBargainElement: 300000,
        regularTax: 35000,
      })
    )

    // AMTI = 200000 + 300000 = 500000
    // Exemption: 88100 (single, no phaseout since 500000 < 609350)
    // AMT base: 500000 - 88100 = 411900
    // TMT: 248300 * 0.26 + (411900 - 248300) * 0.28
    //     = 64558 + 45808 = 110366
    // AMT = 110366 - 35000 = 75366
    expect(result.amti).toBe(500000)
    expect(result.reducedExemption).toBe(88100)
    expect(result.amtBase).toBe(411900)
    expect(result.tentativeMinimumTax).toBeCloseTo(110366, 0)
    expect(result.alternativeMinimumTax).toBeCloseTo(75366, 0)
    expect(result.isSubjectToAmt).toBe(true)
  })

  // ── AMT triggered by SALT add-back ─────────────────────────────────

  it('triggers AMT from SALT deduction add-back', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 300000,
        stateAndLocalTaxDeduction: 50000,
        regularTax: 60000,
      })
    )

    // AMTI = 300000 + 50000 = 350000
    expect(result.amti).toBe(350000)
    expect(result.isSubjectToAmt).toBe(result.alternativeMinimumTax > 0)
  })

  // ── Exemption phaseout ─────────────────────────────────────────────

  it('reduces exemption when AMTI exceeds phaseout threshold', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 700000,
        stateAndLocalTaxDeduction: 10000,
        regularTax: 150000,
      })
    )

    // AMTI = 700000 + 10000 = 710000
    // Excess over phaseout: 710000 - 609350 = 100650
    // Reduction: 100650 * 0.25 = 25162.50
    // Reduced exemption: 88100 - 25162.50 = 62937.50
    expect(result.amti).toBe(710000)
    expect(result.reducedExemption).toBeCloseTo(62937.50, 0)
    expect(result.reducedExemption).toBeLessThan(result.exemptionAmount)
  })

  // ── Full exemption phaseout (very high income) ─────────────────────

  it('fully phases out exemption for very high income', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 1500000,
        stateAndLocalTaxDeduction: 10000,
        regularTax: 400000,
      })
    )

    // AMTI = 1500000 + 10000 = 1510000
    // Excess: 1510000 - 609350 = 900650
    // Reduction: 900650 * 0.25 = 225162.50 > 88100
    // Reduced exemption: max(0, 88100 - 225162.50) = 0
    expect(result.reducedExemption).toBe(0)
    expect(result.amtBase).toBe(result.amti)
  })

  // ── MFJ vs Single vs MFS different parameters ─────────────────────

  it('uses higher exemption for MFJ', () => {
    const singleResult = computeAmt(
      buildInput({ filingStatus: 'single' })
    )
    const mfjResult = computeAmt(
      buildInput({ filingStatus: 'married_filing_jointly' })
    )

    expect(mfjResult.exemptionAmount).toBe(137000)
    expect(singleResult.exemptionAmount).toBe(88100)
    expect(mfjResult.exemptionAmount).toBeGreaterThan(singleResult.exemptionAmount)
  })

  it('uses lower exemption for MFS', () => {
    const result = computeAmt(
      buildInput({ filingStatus: 'married_filing_separately' })
    )

    expect(result.exemptionAmount).toBe(68500)
  })

  it('uses same exemption for HOH as single', () => {
    const singleResult = computeAmt(
      buildInput({ filingStatus: 'single' })
    )
    const hohResult = computeAmt(
      buildInput({ filingStatus: 'head_of_household' })
    )

    expect(hohResult.exemptionAmount).toBe(singleResult.exemptionAmount)
  })

  it('uses lower bracket threshold for MFS ($124,150)', () => {
    const mfsResult = computeAmt(
      buildInput({
        filingStatus: 'married_filing_separately',
        taxableIncome: 400000,
        incentiveStockOptionBargainElement: 200000,
        regularTax: 80000,
      })
    )

    // AMTI = 400000 + 200000 = 600000
    // Exemption: 68500 (no phaseout since 600000 < 609350)
    // AMT base: 600000 - 68500 = 531500
    // TMT: 124150 * 0.26 + (531500 - 124150) * 0.28
    //     = 32279 + 114058 = 146337
    expect(mfsResult.amtBase).toBe(531500)
    expect(mfsResult.tentativeMinimumTax).toBeCloseTo(146337, 0)
  })

  // ── 26%/28% bracket boundary ───────────────────────────────────────

  it('applies 26% rate when AMT base is below threshold', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 250000,
        regularTax: 0, // force AMT to be positive
      })
    )

    // AMTI = 250000
    // AMT base = 250000 - 88100 = 161900 (< 248300)
    // TMT = 161900 * 0.26 = 42094
    expect(result.amtBase).toBe(161900)
    expect(result.tentativeMinimumTax).toBe(42094)
  })

  it('applies 28% rate above threshold', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 500000,
        incentiveStockOptionBargainElement: 100000,
        regularTax: 0, // force AMT to be positive
      })
    )

    // AMTI = 500000 + 100000 = 600000
    // AMT base = 600000 - 88100 = 511900
    // TMT = 248300 * 0.26 + (511900 - 248300) * 0.28
    //     = 64558 + 73808 = 138366
    expect(result.tentativeMinimumTax).toBeCloseTo(138366, 0)
  })

  // ── Zero AMT adjustments ───────────────────────────────────────────

  it('handles zero adjustments with no AMT', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 100000,
        stateAndLocalTaxDeduction: 0,
        taxExemptInterestFromPABs: 0,
        incentiveStockOptionBargainElement: 0,
        otherAdjustments: 0,
        regularTax: 50000,
      })
    )

    // AMTI = 100000, below exemption so AMT base = max(0, 100000 - 88100) = 11900
    // TMT = 11900 * 0.26 = 3094
    // AMT = max(0, 3094 - 50000) = 0
    expect(result.amti).toBe(100000)
    expect(result.alternativeMinimumTax).toBe(0)
    expect(result.isSubjectToAmt).toBe(false)
  })

  // ── High income with all adjustments ───────────────────────────────

  it('computes correctly with all adjustment types present', () => {
    const result = computeAmt(
      buildInput({
        taxableIncome: 400000,
        filingStatus: 'single',
        stateAndLocalTaxDeduction: 30000,
        taxExemptInterestFromPABs: 15000,
        incentiveStockOptionBargainElement: 200000,
        otherAdjustments: 5000,
        regularTax: 90000,
      })
    )

    // AMTI = 400000 + 30000 + 15000 + 200000 + 5000 = 650000
    // Excess over phaseout: 650000 - 609350 = 40650
    // Reduction: 40650 * 0.25 = 10162.50
    // Reduced exemption: 88100 - 10162.50 = 77937.50
    // AMT base: 650000 - 77937.50 = 572062.50
    // TMT: 248300 * 0.26 + (572062.50 - 248300) * 0.28
    //     = 64558 + 90653.50 = 155211.50
    // AMT: 155211.50 - 90000 = 65211.50
    expect(result.amti).toBe(650000)
    expect(result.reducedExemption).toBeCloseTo(77937.50, 0)
    expect(result.alternativeMinimumTax).toBeCloseTo(65211.50, 0)
    expect(result.isSubjectToAmt).toBe(true)
  })

  // ── Phaseout start stored correctly ────────────────────────────────

  it('reports correct phaseout start for each filing status', () => {
    const single = computeAmt(buildInput({ filingStatus: 'single' }))
    const mfj = computeAmt(buildInput({ filingStatus: 'married_filing_jointly' }))
    const mfs = computeAmt(buildInput({ filingStatus: 'married_filing_separately' }))

    expect(single.exemptionPhaseoutStart).toBe(609350)
    expect(mfj.exemptionPhaseoutStart).toBe(1218700)
    expect(mfs.exemptionPhaseoutStart).toBe(609350)
  })
})
