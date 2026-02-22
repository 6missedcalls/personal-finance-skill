import { describe, expect, it } from 'vitest'
import { calculateQuarterlyEstimates } from '../../src/calculators/quarterly-estimate.js'
import type { IncomeSummary } from '../../src/types.js'

const baseIncome: IncomeSummary = {
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
}

describe('calculateQuarterlyEstimates', () => {
  it('generates four quarters', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-03-01'
    )

    expect(result.taxYear).toBe(2025)
    expect(result.quarters).toHaveLength(4)
  })

  it('sets correct due dates', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-03-01'
    )

    expect(result.quarters[0].dueDate).toBe('2025-04-15')
    expect(result.quarters[1].dueDate).toBe('2025-06-15')
    expect(result.quarters[2].dueDate).toBe('2025-09-15')
    expect(result.quarters[3].dueDate).toBe('2026-01-15')
  })

  it('marks overdue quarters', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-07-01' // after Q1 and Q2 due dates
    )

    expect(result.quarters[0].status).toBe('overdue')
    expect(result.quarters[1].status).toBe('overdue')
    expect(result.quarters[2].status).toBe('upcoming')
    expect(result.quarters[3].status).toBe('upcoming')
  })

  it('marks paid quarters', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [
        { quarter: 1, amount: 10000, datePaid: '2025-04-10' },
      ],
      '2025-05-01'
    )

    expect(result.quarters[0].status).toBe('paid')
    expect(result.quarters[0].amountPaid).toBe(10000)
  })

  it('calculates total remaining', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [
        { quarter: 1, amount: 5000, datePaid: '2025-04-10' },
      ],
      '2025-05-01'
    )

    expect(result.totalPaid).toBe(5000)
    expect(result.totalRemaining).toBe(result.totalEstimatedTax - 5000)
  })

  it('sets low underpayment risk when no overdue quarters', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-01-01'
    )

    expect(result.underpaymentRisk).toBe('low')
  })

  it('sets high underpayment risk with multiple overdue quarters', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-10-01'
    )

    expect(result.underpaymentRisk).toBe('high')
  })

  it('calculates suggested next payment', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-03-01'
    )

    expect(result.suggestedNextPayment).toBeGreaterThan(0)
  })

  it('provides a next due date', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [],
      '2025-05-01'
    )

    expect(result.nextDueDate).toBeTruthy()
  })

  it('reports safe harbor status', () => {
    const result = calculateQuarterlyEstimates(
      2025,
      'single',
      baseIncome,
      30000,
      [
        { quarter: 1, amount: 10000, datePaid: '2025-04-10' },
        { quarter: 2, amount: 10000, datePaid: '2025-06-10' },
        { quarter: 3, amount: 10000, datePaid: '2025-09-10' },
        { quarter: 4, amount: 10000, datePaid: '2026-01-10' },
      ],
      '2026-02-01'
    )

    // With $10k withholding + $40k estimated = $50k total payments
    // Against $30k prior year tax, safe harbor should be met
    expect(result.safeHarborMet).toBe(true)
  })
})
