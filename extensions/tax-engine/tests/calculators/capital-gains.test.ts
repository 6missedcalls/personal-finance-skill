import { describe, expect, it } from 'vitest'
import { classifyHoldingPeriod, compareLotStrategies, selectLots } from '../../src/calculators/capital-gains.js'
import type { TaxLot } from '../../src/types.js'

describe('classifyHoldingPeriod', () => {
  it('classifies as short-term when held less than a year', () => {
    expect(classifyHoldingPeriod('2025-06-01', '2025-11-15')).toBe('short_term')
  })

  it('classifies as long-term when held more than a year', () => {
    expect(classifyHoldingPeriod('2024-01-01', '2025-06-01')).toBe('long_term')
  })

  it('classifies exactly 365 days as short-term', () => {
    // Use non-leap-year span: 2025-01-01 to 2026-01-01 = exactly 365 days
    expect(classifyHoldingPeriod('2025-01-01', '2026-01-01')).toBe('short_term')
  })

  it('classifies 366 days as long-term', () => {
    // 2025-01-01 to 2026-01-02 = 366 days > 365
    expect(classifyHoldingPeriod('2025-01-01', '2026-01-02')).toBe('long_term')
  })
})

const testLots: ReadonlyArray<TaxLot> = [
  {
    id: 'lot-1',
    symbol: 'AAPL',
    dateAcquired: '2023-01-15',
    quantity: 100,
    costBasisPerShare: 130,
    totalCostBasis: 13000,
    adjustedBasis: 13000,
    washSaleAdjustment: 0,
    accountId: 'acc-1',
  },
  {
    id: 'lot-2',
    symbol: 'AAPL',
    dateAcquired: '2024-06-01',
    quantity: 50,
    costBasisPerShare: 180,
    totalCostBasis: 9000,
    adjustedBasis: 9000,
    washSaleAdjustment: 0,
    accountId: 'acc-1',
  },
  {
    id: 'lot-3',
    symbol: 'AAPL',
    dateAcquired: '2025-03-01',
    quantity: 25,
    costBasisPerShare: 220,
    totalCostBasis: 5500,
    adjustedBasis: 5500,
    washSaleAdjustment: 0,
    accountId: 'acc-1',
  },
]

describe('selectLots', () => {
  it('selects lots FIFO (oldest first)', () => {
    const result = selectLots(testLots, 120, 200, 'fifo', '2025-12-01')

    expect(result.method).toBe('fifo')
    expect(result.selectedLots).toHaveLength(2)
    expect(result.selectedLots[0].lotId).toBe('lot-1')
    expect(result.selectedLots[0].quantitySold).toBe(100)
    expect(result.selectedLots[1].lotId).toBe('lot-2')
    expect(result.selectedLots[1].quantitySold).toBe(20)
  })

  it('selects lots LIFO (newest first)', () => {
    const result = selectLots(testLots, 60, 200, 'lifo', '2025-12-01')

    expect(result.method).toBe('lifo')
    expect(result.selectedLots[0].lotId).toBe('lot-3')
    expect(result.selectedLots[0].quantitySold).toBe(25)
    expect(result.selectedLots[1].lotId).toBe('lot-2')
    expect(result.selectedLots[1].quantitySold).toBe(35)
  })

  it('calculates gain/loss correctly', () => {
    // Sell 100 shares at $200 from lot-1 (basis $130)
    const result = selectLots(testLots, 100, 200, 'fifo', '2025-12-01')

    expect(result.selectedLots[0].gainLoss).toBe(7000) // (200-130)*100
    expect(result.totalProceeds).toBe(20000) // 100*200
    expect(result.totalBasis).toBe(13000)
    expect(result.totalGainLoss).toBe(7000)
  })

  it('classifies holding period on each lot', () => {
    const result = selectLots(testLots, 175, 200, 'fifo', '2025-12-01')

    expect(result.selectedLots[0].gainType).toBe('long_term')  // lot-1: 2023
    expect(result.selectedLots[1].gainType).toBe('long_term')  // lot-2: 2024-06
    expect(result.selectedLots[2].gainType).toBe('short_term') // lot-3: 2025-03
  })

  it('handles selling more than available', () => {
    const result = selectLots(testLots, 500, 200, 'fifo', '2025-12-01')

    // Should sell all available: 100 + 50 + 25 = 175
    const totalSold = result.selectedLots.reduce((sum, l) => sum + l.quantitySold, 0)
    expect(totalSold).toBe(175)
  })

  it('handles specific lot selection', () => {
    const result = selectLots(testLots, 25, 200, 'specific_id', '2025-12-01', ['lot-3'])

    expect(result.selectedLots).toHaveLength(1)
    expect(result.selectedLots[0].lotId).toBe('lot-3')
  })
})

describe('compareLotStrategies', () => {
  it('compares FIFO and LIFO strategies', () => {
    const results = compareLotStrategies(
      testLots,
      50,
      200,
      '2025-12-01',
      0.32,
      0.15
    )

    expect(results).toHaveLength(2)
    expect(results[0].method).toBe('fifo')
    expect(results[1].method).toBe('lifo')

    // FIFO should have more long-term gains (older lots sold first)
    // LIFO should have more short-term gains (newer lots sold first)
    expect(results[0].longTermGainLoss).toBeGreaterThan(results[1].longTermGainLoss)
  })

  it('includes estimated tax impact', () => {
    const results = compareLotStrategies(
      testLots,
      50,
      200,
      '2025-12-01',
      0.32,
      0.15
    )

    for (const result of results) {
      expect(typeof result.estimatedTaxImpact).toBe('number')
    }
  })
})
