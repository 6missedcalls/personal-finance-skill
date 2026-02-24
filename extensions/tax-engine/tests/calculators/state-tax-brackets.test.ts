import { describe, it, expect } from 'vitest'
import { computeStateTax } from '../../src/calculators/state-tax-brackets.js'

describe('computeStateTax', () => {
  // ── CA progressive brackets ────────────────────────────────────────

  describe('California', () => {
    it('computes tax in the first bracket', () => {
      const result = computeStateTax('CA', 8000, 'single')

      expect(result.stateCode).toBe('CA')
      expect(result.stateTax).toBe(80) // 8000 * 0.01
      expect(result.marginalRate).toBe(0.01)
    })

    it('computes tax across multiple brackets', () => {
      const result = computeStateTax('CA', 50000, 'single')

      // Bracket 1: 10412 * 0.01 = 104.12
      // Bracket 2: (24684 - 10412) * 0.02 = 285.44
      // Bracket 3: (38959 - 24684) * 0.04 = 571.00
      // Bracket 4: (50000 - 38959) * 0.06 = 662.46
      expect(result.stateTax).toBeCloseTo(1623.02, 0)
      expect(result.marginalRate).toBe(0.06)
    })

    it('applies 13.3% rate for millionaire income', () => {
      const result = computeStateTax('CA', 1500000, 'single')

      expect(result.marginalRate).toBe(0.133)
      expect(result.notes).toContain(
        'Includes Mental Health Services Tax (1% over $1M)'
      )
    })

    it('returns bracket data in result', () => {
      const result = computeStateTax('CA', 50000, 'single')

      expect(result.brackets.length).toBeGreaterThan(0)
      expect(result.brackets[0]).toHaveProperty('min')
      expect(result.brackets[0]).toHaveProperty('max')
      expect(result.brackets[0]).toHaveProperty('rate')
    })
  })

  // ── NY progressive brackets ────────────────────────────────────────

  describe('New York', () => {
    it('computes tax for moderate income', () => {
      const result = computeStateTax('NY', 100000, 'single')

      // Bracket 1: 8500 * 0.04 = 340
      // Bracket 2: (11700-8500) * 0.045 = 144
      // Bracket 3: (13900-11700) * 0.0525 = 115.50
      // Bracket 4: (80650-13900) * 0.0585 = 3904.88
      // Bracket 5: (100000-80650) * 0.0625 = 1209.38
      expect(result.stateTax).toBeCloseTo(5713.76, 0)
      expect(result.marginalRate).toBe(0.0625)
    })

    it('reaches top bracket for very high income', () => {
      const result = computeStateTax('NY', 30000000, 'single')

      expect(result.marginalRate).toBe(0.109)
    })
  })

  // ── IL flat rate ───────────────────────────────────────────────────

  describe('Illinois', () => {
    it('applies flat 4.95% rate', () => {
      const result = computeStateTax('IL', 100000, 'single')

      expect(result.stateTax).toBe(4950)
      expect(result.marginalRate).toBe(0.0495)
      expect(result.effectiveRate).toBeCloseTo(0.0495, 4)
    })

    it('returns single flat bracket', () => {
      const result = computeStateTax('IL', 50000, 'single')

      expect(result.brackets).toHaveLength(1)
      expect(result.brackets[0].rate).toBe(0.0495)
      expect(result.brackets[0].max).toBeNull()
    })
  })

  // ── PA flat rate ───────────────────────────────────────────────────

  describe('Pennsylvania', () => {
    it('applies flat 3.07% rate', () => {
      const result = computeStateTax('PA', 100000, 'single')

      expect(result.stateTax).toBe(3070)
      expect(result.marginalRate).toBe(0.0307)
      expect(result.effectiveRate).toBeCloseTo(0.0307, 4)
    })
  })

  // ── NJ progressive brackets ────────────────────────────────────────

  describe('New Jersey', () => {
    it('computes tax for moderate income', () => {
      const result = computeStateTax('NJ', 80000, 'single')

      // Bracket 1: 20000 * 0.014 = 280
      // Bracket 2: (35000-20000) * 0.0175 = 262.50
      // Bracket 3: (40000-35000) * 0.035 = 175
      // Bracket 4: (75000-40000) * 0.05525 = 1933.75
      // Bracket 5: (80000-75000) * 0.0637 = 318.50
      expect(result.stateTax).toBeCloseTo(2969.75, 0)
      expect(result.marginalRate).toBe(0.0637)
    })

    it('reaches top bracket for millionaire income', () => {
      const result = computeStateTax('NJ', 2000000, 'single')

      expect(result.marginalRate).toBe(0.1075)
    })
  })

  // ── MA flat + millionaire surtax ───────────────────────────────────

  describe('Massachusetts', () => {
    it('applies flat 5% rate below $1M', () => {
      const result = computeStateTax('MA', 200000, 'single')

      expect(result.stateTax).toBe(10000)
      expect(result.marginalRate).toBe(0.05)
      expect(result.effectiveRate).toBe(0.05)
    })

    it('applies 4% surtax on income over $1M', () => {
      const result = computeStateTax('MA', 1500000, 'single')

      // Base: 1500000 * 0.05 = 75000
      // Surtax: (1500000 - 1000000) * 0.04 = 20000
      expect(result.stateTax).toBe(95000)
      expect(result.marginalRate).toBe(0.09) // 5% + 4%
      expect(result.notes).toContain(
        'Includes 4% millionaire surtax on income over $1,000,000'
      )
    })

    it('has no surtax at exactly $1M', () => {
      const result = computeStateTax('MA', 1000000, 'single')

      expect(result.stateTax).toBe(50000)
      expect(result.marginalRate).toBe(0.05)
    })
  })

  // ── TX/FL zero tax ─────────────────────────────────────────────────

  describe('Texas', () => {
    it('returns zero tax for TX', () => {
      const result = computeStateTax('TX', 500000, 'single')

      expect(result.stateTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.marginalRate).toBe(0)
      expect(result.notes).toContain('TX has no state income tax')
    })
  })

  describe('Florida', () => {
    it('returns zero tax for FL', () => {
      const result = computeStateTax('FL', 500000, 'single')

      expect(result.stateTax).toBe(0)
      expect(result.effectiveRate).toBe(0)
      expect(result.marginalRate).toBe(0)
      expect(result.notes).toContain('FL has no state income tax')
    })
  })

  // ── Zero income ────────────────────────────────────────────────────

  it('returns zero tax for zero income', () => {
    const result = computeStateTax('CA', 0, 'single')

    expect(result.stateTax).toBe(0)
    expect(result.effectiveRate).toBe(0)
    expect(result.marginalRate).toBe(0)
  })

  it('returns zero tax for negative income', () => {
    const result = computeStateTax('NY', -5000, 'single')

    expect(result.stateTax).toBe(0)
    expect(result.effectiveRate).toBe(0)
  })

  // ── Unsupported state ──────────────────────────────────────────────

  it('returns zero tax with note for unsupported state', () => {
    const result = computeStateTax('WY', 100000, 'single')

    expect(result.stateTax).toBe(0)
    expect(result.effectiveRate).toBe(0)
    expect(result.notes).toContain('State not supported')
  })

  // ── Effective rate calculation ─────────────────────────────────────

  it('calculates effective rate as stateTax / taxableIncome', () => {
    const result = computeStateTax('IL', 200000, 'single')

    expect(result.effectiveRate).toBeCloseTo(0.0495, 4)
    expect(result.effectiveRate).toBe(result.stateTax / result.taxableIncome)
  })

  // ── Marginal rate selection ────────────────────────────────────────

  it('selects marginal rate from highest reached bracket', () => {
    const result = computeStateTax('CA', 100000, 'single')

    // At $100,000 in CA single, falls in 9.3% bracket (68,350 - 349,137)
    expect(result.marginalRate).toBe(0.093)
  })

  // ── Filing status affects brackets ─────────────────────────────────

  it('uses MFJ brackets for married_filing_jointly', () => {
    const singleResult = computeStateTax('CA', 50000, 'single')
    const mfjResult = computeStateTax('CA', 50000, 'married_filing_jointly')

    // MFJ brackets are ~2x, so at $50K the MFJ tax should be lower
    expect(mfjResult.stateTax).toBeLessThan(singleResult.stateTax)
  })

  // ── Case insensitivity ─────────────────────────────────────────────

  it('handles lowercase state codes', () => {
    const result = computeStateTax('ca', 50000, 'single')

    expect(result.stateCode).toBe('CA')
    expect(result.stateTax).toBeGreaterThan(0)
  })
})
