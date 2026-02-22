import { describe, expect, it } from 'vitest'
import {
  add,
  applyRate,
  clampMin,
  multiply,
  roundToCents,
  roundToWholeDollar,
  subtract,
  sumAll,
} from '../../src/calculators/decimal.js'

describe('decimal arithmetic', () => {
  describe('add', () => {
    it('adds two positive numbers', () => {
      expect(add(10.50, 20.75)).toBe(31.25)
    })

    it('handles classic floating-point case (0.1 + 0.2)', () => {
      expect(add(0.1, 0.2)).toBe(0.30)
    })

    it('adds negative numbers', () => {
      expect(add(-5.50, 3.25)).toBe(-2.25)
    })

    it('adds zero', () => {
      expect(add(100, 0)).toBe(100)
    })
  })

  describe('subtract', () => {
    it('subtracts two numbers', () => {
      expect(subtract(100.50, 25.25)).toBe(75.25)
    })

    it('produces negative result', () => {
      expect(subtract(10, 25)).toBe(-15)
    })

    it('handles cents precision', () => {
      expect(subtract(1000.99, 0.01)).toBe(1000.98)
    })
  })

  describe('multiply', () => {
    it('multiplies dollar amount by quantity', () => {
      expect(multiply(15.50, 10)).toBe(155.00)
    })

    it('multiplies by fractional quantity', () => {
      expect(multiply(100, 0.5)).toBe(50.00)
    })
  })

  describe('sumAll', () => {
    it('sums an array of values', () => {
      expect(sumAll([10.10, 20.20, 30.30])).toBe(60.60)
    })

    it('returns 0 for empty array', () => {
      expect(sumAll([])).toBe(0)
    })

    it('handles mix of positive and negative', () => {
      expect(sumAll([100, -30, -20, 50])).toBe(100)
    })
  })

  describe('roundToWholeDollar', () => {
    it('rounds down below .50', () => {
      expect(roundToWholeDollar(99.49)).toBe(99)
    })

    it('rounds up at .50', () => {
      expect(roundToWholeDollar(99.50)).toBe(100)
    })

    it('rounds up above .50', () => {
      expect(roundToWholeDollar(99.75)).toBe(100)
    })
  })

  describe('roundToCents', () => {
    it('rounds to nearest cent', () => {
      expect(roundToCents(10.555)).toBe(10.56)
    })

    it('leaves exact cents unchanged', () => {
      expect(roundToCents(10.50)).toBe(10.50)
    })
  })

  describe('clampMin', () => {
    it('returns value when above min', () => {
      expect(clampMin(100, 0)).toBe(100)
    })

    it('returns min when value below', () => {
      expect(clampMin(-50, 0)).toBe(0)
    })
  })

  describe('applyRate', () => {
    it('applies tax rate to income', () => {
      expect(applyRate(50000, 0.22)).toBe(11000)
    })

    it('applies rate to small amount', () => {
      expect(applyRate(100, 0.10)).toBe(10)
    })

    it('handles zero rate', () => {
      expect(applyRate(50000, 0)).toBe(0)
    })
  })
})
