import { describe, it, expect } from 'vitest'
import { parseForm8949 } from '../../src/tools/parse-form-8949.js'

describe('parseForm8949', () => {
  it('parses valid data correctly', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          {
            description: '100 SH AAPL',
            dateAcquired: '2025-01-15',
            dateSold: '2025-06-01',
            proceeds: 20000,
            costBasis: 15000,
            adjustmentCode: '',
            adjustmentAmount: 0,
          },
        ],
        longTermPartII: [
          {
            description: '50 SH MSFT',
            dateAcquired: '2023-03-01',
            dateSold: '2025-06-01',
            proceeds: 30000,
            costBasis: 20000,
            adjustmentCode: '',
            adjustmentAmount: 0,
          },
        ],
      },
    })

    expect(result.parsed.shortTermPartI).toHaveLength(1)
    expect(result.parsed.longTermPartII).toHaveLength(1)
    expect(result.parsed.shortTermPartI[0].gainOrLoss).toBe(5000)
    expect(result.parsed.longTermPartII[0].gainOrLoss).toBe(10000)
    expect(result.parsed.totalShortTermProceeds).toBe(20000)
    expect(result.parsed.totalShortTermBasis).toBe(15000)
    expect(result.parsed.totalShortTermGainLoss).toBe(5000)
    expect(result.parsed.totalLongTermProceeds).toBe(30000)
    expect(result.parsed.totalLongTermBasis).toBe(20000)
    expect(result.parsed.totalLongTermGainLoss).toBe(10000)
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          { description: 'Test', dateSold: '2025-01-01', proceeds: 1000, costBasis: 800 },
        ],
      },
    })

    expect(result.parsed.shortTermPartI[0].proceeds).toBe(1000)
  })

  it('handles snake_case field names', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        short_term_part_i: [
          {
            description: 'Test',
            date_sold: '2025-01-01',
            date_acquired: '2024-06-01',
            proceeds: 5000,
            cost_basis: 4000,
            adjustment_code: 'W',
            adjustment_amount: 200,
          },
        ],
        long_term_part_ii: [
          {
            description: 'Long Test',
            date_sold: '2025-01-01',
            proceeds: 8000,
            cost_basis: 6000,
          },
        ],
      },
    })

    expect(result.parsed.shortTermPartI[0].adjustmentCode).toBe('W')
    expect(result.parsed.shortTermPartI[0].gainOrLoss).toBe(1200) // 5000 - 4000 + 200
    expect(result.parsed.longTermPartII[0].proceeds).toBe(8000)
  })

  it('reports missing dateSold', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          { description: 'No date', proceeds: 1000, costBasis: 800 },
        ],
      },
    })

    expect(result.missingFields.some((f) => f.includes('dateSold'))).toBe(true)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          { description: 'Minimal', dateSold: '2025-01-01' },
        ],
      },
    })

    expect(result.parsed.shortTermPartI[0].proceeds).toBe(0)
    expect(result.parsed.shortTermPartI[0].costBasis).toBe(0)
    expect(result.parsed.shortTermPartI[0].adjustmentAmount).toBe(0)
    expect(result.parsed.shortTermPartI[0].gainOrLoss).toBe(0)
  })

  it('reports warnings for zero proceeds', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          { description: 'Zero', dateSold: '2025-01-01', proceeds: 0, costBasis: 100 },
        ],
      },
    })

    expect(result.warnings.some((w) => w.includes('zero proceeds'))).toBe(true)
  })

  it('warns when no transactions provided', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('No transactions found'))).toBe(true)
  })

  it('calculates gain/loss including adjustments', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          {
            description: 'Wash Sale',
            dateSold: '2025-03-01',
            proceeds: 10000,
            costBasis: 12000,
            adjustmentCode: 'W',
            adjustmentAmount: 500,
          },
        ],
      },
    })

    // gainOrLoss = proceeds - costBasis + adjustmentAmount = 10000 - 12000 + 500 = -1500
    expect(result.parsed.shortTermPartI[0].gainOrLoss).toBe(-1500)
  })

  it('handles null dateAcquired', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        longTermPartII: [
          { description: 'Various', dateSold: '2025-01-01', proceeds: 5000, costBasis: 3000 },
        ],
      },
    })

    expect(result.parsed.longTermPartII[0].dateAcquired).toBeNull()
  })

  it('sums totals across multiple transactions', () => {
    const result = parseForm8949({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermPartI: [
          { description: 'A', dateSold: '2025-01-01', proceeds: 5000, costBasis: 4000 },
          { description: 'B', dateSold: '2025-01-01', proceeds: 3000, costBasis: 3500 },
        ],
        longTermPartII: [
          { description: 'C', dateSold: '2025-01-01', proceeds: 10000, costBasis: 6000 },
        ],
      },
    })

    expect(result.parsed.totalShortTermProceeds).toBe(8000)
    expect(result.parsed.totalShortTermBasis).toBe(7500)
    expect(result.parsed.totalShortTermGainLoss).toBe(500) // 1000 + (-500)
    expect(result.parsed.totalLongTermProceeds).toBe(10000)
    expect(result.parsed.totalLongTermGainLoss).toBe(4000)
  })
})
