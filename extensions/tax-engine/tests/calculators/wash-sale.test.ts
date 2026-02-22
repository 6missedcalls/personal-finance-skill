import { describe, expect, it } from 'vitest'
import { checkWashSales, earliestSafeRepurchaseDate, wouldTriggerWashSale } from '../../src/calculators/wash-sale.js'

describe('checkWashSales', () => {
  it('detects wash sale when repurchase within 30 days after sale', () => {
    const result = checkWashSales(
      [{ lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 }],
      [{ lotId: 'buy-1', symbol: 'AAPL', purchaseDate: '2025-06-15', quantity: 100, costBasis: 15000 }]
    )

    expect(result.compliant).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].disallowedLoss).toBe(500)
    expect(result.violations[0].soldLotId).toBe('sold-1')
    expect(result.violations[0].replacementLotId).toBe('buy-1')
  })

  it('detects wash sale when purchase within 30 days before sale', () => {
    const result = checkWashSales(
      [{ lotId: 'sold-1', symbol: 'TSLA', saleDate: '2025-06-15', loss: -1000 }],
      [{ lotId: 'buy-1', symbol: 'TSLA', purchaseDate: '2025-05-20', quantity: 50, costBasis: 10000 }]
    )

    expect(result.compliant).toBe(false)
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].disallowedLoss).toBe(1000)
  })

  it('does not flag purchase outside 30-day window', () => {
    const result = checkWashSales(
      [{ lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 }],
      [{ lotId: 'buy-1', symbol: 'AAPL', purchaseDate: '2025-07-15', quantity: 100, costBasis: 15000 }]
    )

    expect(result.compliant).toBe(true)
    expect(result.violations).toHaveLength(0)
  })

  it('does not flag different securities', () => {
    const result = checkWashSales(
      [{ lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 }],
      [{ lotId: 'buy-1', symbol: 'MSFT', purchaseDate: '2025-06-10', quantity: 100, costBasis: 15000 }]
    )

    expect(result.compliant).toBe(true)
  })

  it('does not flag sales with gains', () => {
    const result = checkWashSales(
      [{ lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: 500 }],
      [{ lotId: 'buy-1', symbol: 'AAPL', purchaseDate: '2025-06-10', quantity: 100, costBasis: 15000 }]
    )

    expect(result.compliant).toBe(true)
  })

  it('handles multiple violations', () => {
    const result = checkWashSales(
      [
        { lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 },
        { lotId: 'sold-2', symbol: 'TSLA', saleDate: '2025-06-05', loss: -300 },
      ],
      [
        { lotId: 'buy-1', symbol: 'AAPL', purchaseDate: '2025-06-10', quantity: 100, costBasis: 15000 },
        { lotId: 'buy-2', symbol: 'TSLA', purchaseDate: '2025-06-20', quantity: 50, costBasis: 10000 },
      ]
    )

    expect(result.violations).toHaveLength(2)
    expect(result.totalDisallowedLoss).toBe(800)
  })

  it('does not double-count replacement purchases', () => {
    const result = checkWashSales(
      [
        { lotId: 'sold-1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 },
        { lotId: 'sold-2', symbol: 'AAPL', saleDate: '2025-06-02', loss: -300 },
      ],
      [
        { lotId: 'buy-1', symbol: 'AAPL', purchaseDate: '2025-06-10', quantity: 100, costBasis: 15000 },
      ]
    )

    // Only one replacement available, so only one violation
    expect(result.violations).toHaveLength(1)
    expect(result.violations[0].soldLotId).toBe('sold-1')
  })
})

describe('wouldTriggerWashSale', () => {
  it('returns true if recent purchase in window', () => {
    expect(
      wouldTriggerWashSale('AAPL', '2025-06-15', [
        { symbol: 'AAPL', purchaseDate: '2025-06-01' },
      ])
    ).toBe(true)
  })

  it('returns false if no recent purchases', () => {
    expect(wouldTriggerWashSale('AAPL', '2025-06-15', [])).toBe(false)
  })

  it('returns false if purchase outside window', () => {
    expect(
      wouldTriggerWashSale('AAPL', '2025-06-15', [
        { symbol: 'AAPL', purchaseDate: '2025-04-01' },
      ])
    ).toBe(false)
  })
})

describe('earliestSafeRepurchaseDate', () => {
  it('returns date 31 days after sale', () => {
    const result = earliestSafeRepurchaseDate('2025-06-01')
    expect(result).toBe('2025-07-02')
  })
})
