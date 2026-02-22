import { describe, expect, it } from 'vitest'
import { findTlhCandidates } from '../../src/tools/find-tlh-candidates.js'
import { checkWashSalesHandler } from '../../src/tools/check-wash-sales.js'
import { lotSelection } from '../../src/tools/lot-selection.js'
import { estimateLiability } from '../../src/tools/estimate-liability.js'
import { quarterlyEstimate } from '../../src/tools/quarterly-estimate.js'
import type { Position, TaxLot } from '../../src/types.js'

describe('findTlhCandidates', () => {
  const makeLot = (overrides: Partial<TaxLot>): TaxLot => ({
    id: 'lot-1',
    symbol: 'AAPL',
    dateAcquired: '2024-01-01',
    quantity: 100,
    costBasisPerShare: 200,
    totalCostBasis: 20000,
    adjustedBasis: 20000,
    washSaleAdjustment: 0,
    accountId: 'acc-1',
    ...overrides,
  })

  const makePosition = (currentPrice: number, lots: TaxLot[]): Position => ({
    symbol: lots[0]?.symbol ?? 'AAPL',
    totalQuantity: lots.reduce((s, l) => s + l.quantity, 0),
    lots,
    currentPrice,
    accountId: 'acc-1',
  })

  it('identifies positions with unrealized losses', () => {
    const lot = makeLot({ adjustedBasis: 20000 })
    const position = makePosition(150, [lot]) // 150*100=15000 < 20000

    const candidates = findTlhCandidates({
      userId: 'user-1',
      positions: [position],
    })

    expect(candidates).toHaveLength(1)
    expect(candidates[0].unrealizedLoss).toBeLessThan(0)
    expect(candidates[0].estimatedTaxSavings).toBeGreaterThan(0)
  })

  it('ignores positions with unrealized gains', () => {
    const lot = makeLot({ adjustedBasis: 10000 })
    const position = makePosition(200, [lot]) // 200*100=20000 > 10000

    const candidates = findTlhCandidates({
      userId: 'user-1',
      positions: [position],
    })

    expect(candidates).toHaveLength(0)
  })

  it('respects minimum loss threshold', () => {
    const lot = makeLot({ adjustedBasis: 10100, quantity: 100 })
    const position = makePosition(100, [lot]) // loss = -100

    const candidates = findTlhCandidates({
      userId: 'user-1',
      positions: [position],
      minLoss: 500, // Threshold higher than actual loss
    })

    expect(candidates).toHaveLength(0)
  })

  it('sorts by estimated tax savings descending', () => {
    const lot1 = makeLot({ id: 'lot-1', adjustedBasis: 20000, quantity: 100 })
    const lot2 = makeLot({ id: 'lot-2', symbol: 'MSFT', adjustedBasis: 50000, quantity: 100 })

    const pos1 = makePosition(150, [lot1]) // loss: -5000
    const pos2: Position = { ...makePosition(300, [lot2]), symbol: 'MSFT' } // loss: -20000

    const candidates = findTlhCandidates({
      userId: 'user-1',
      positions: [pos1, pos2],
    })

    expect(candidates.length).toBeGreaterThanOrEqual(2)
    expect(candidates[0].estimatedTaxSavings).toBeGreaterThanOrEqual(
      candidates[1].estimatedTaxSavings
    )
  })

  it('flags wash sale risk for recent activity', () => {
    const lot = makeLot({ adjustedBasis: 20000 })
    const position = makePosition(150, [lot])

    const candidates = findTlhCandidates({
      userId: 'user-1',
      positions: [position],
      recentSales: [{ symbol: 'AAPL', saleDate: new Date().toISOString().split('T')[0] }],
    })

    expect(candidates[0].washSaleRisk).toBe(true)
  })
})

describe('checkWashSalesHandler', () => {
  it('delegates to wash sale calculator', () => {
    const result = checkWashSalesHandler({
      userId: 'user-1',
      sales: [{ lotId: 's1', symbol: 'AAPL', saleDate: '2025-06-01', loss: -500 }],
      purchases: [{ lotId: 'b1', symbol: 'AAPL', purchaseDate: '2025-06-10', quantity: 100, costBasis: 15000 }],
    })

    expect(result.compliant).toBe(false)
    expect(result.violations).toHaveLength(1)
  })
})

describe('lotSelection', () => {
  const lots: TaxLot[] = [
    {
      id: 'lot-1',
      symbol: 'AAPL',
      dateAcquired: '2023-01-01',
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
      dateAcquired: '2025-01-01',
      quantity: 50,
      costBasisPerShare: 220,
      totalCostBasis: 11000,
      adjustedBasis: 11000,
      washSaleAdjustment: 0,
      accountId: 'acc-1',
    },
  ]

  it('returns results for each method', () => {
    const results = lotSelection({
      userId: 'user-1',
      symbol: 'AAPL',
      quantityToSell: 50,
      currentPrice: 200,
      lots,
      methods: ['fifo', 'lifo'],
    })

    expect(results).toHaveLength(2)
    expect(results[0].method).toBe('fifo')
    expect(results[1].method).toBe('lifo')
  })

  it('FIFO sells oldest lot first', () => {
    const results = lotSelection({
      userId: 'user-1',
      symbol: 'AAPL',
      quantityToSell: 50,
      currentPrice: 200,
      lots,
    })

    const fifo = results.find((r) => r.method === 'fifo')!
    expect(fifo.selectedLots[0].lotId).toBe('lot-1')
  })

  it('LIFO sells newest lot first', () => {
    const results = lotSelection({
      userId: 'user-1',
      symbol: 'AAPL',
      quantityToSell: 50,
      currentPrice: 200,
      lots,
    })

    const lifo = results.find((r) => r.method === 'lifo')!
    expect(lifo.selectedLots[0].lotId).toBe('lot-2')
  })
})

describe('estimateLiability', () => {
  it('returns structured tax liability', () => {
    const result = estimateLiability({
      userId: 'user-1',
      taxYear: 2025,
      filingStatus: 'single',
      income: {
        wages: 150000,
        ordinaryDividends: 5000,
        qualifiedDividends: 4000,
        interestIncome: 2000,
        taxExemptInterest: 0,
        shortTermGains: 5000,
        longTermGains: 20000,
        businessIncome: 0,
        rentalIncome: 0,
        otherIncome: 0,
        totalWithholding: 30000,
        estimatedPayments: 5000,
        deductions: 0,
        foreignTaxCredit: 0,
      },
    })

    expect(result.taxYear).toBe(2025)
    expect(result.totalFederalTax).toBeGreaterThan(0)
    expect(result.effectiveRate).toBeGreaterThan(0)
    expect(result.assumptions.length).toBeGreaterThan(0)
  })
})

describe('quarterlyEstimate', () => {
  it('returns quarterly payment schedule', () => {
    const result = quarterlyEstimate({
      userId: 'user-1',
      taxYear: 2025,
      filingStatus: 'single',
      projectedIncome: {
        wages: 50000,
        ordinaryDividends: 5000,
        qualifiedDividends: 3000,
        interestIncome: 2000,
        taxExemptInterest: 0,
        shortTermGains: 10000,
        longTermGains: 20000,
        businessIncome: 80000,
        rentalIncome: 0,
        otherIncome: 0,
        totalWithholding: 10000,
        estimatedPayments: 0,
        deductions: 0,
        foreignTaxCredit: 0,
      },
      priorYearTax: 30000,
      quarterlyPaymentsMade: [],
    })

    expect(result.taxYear).toBe(2025)
    expect(result.quarters).toHaveLength(4)
    expect(result.totalEstimatedTax).toBeGreaterThan(0)
    expect(result.suggestedNextPayment).toBeGreaterThan(0)
  })
})
