import { describe, it, expect } from 'vitest'
import { parseScheduleB } from '../../src/tools/parse-schedule-b.js'

describe('parseScheduleB', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interestPayors: [
          { name: 'Chase Bank', amount: 500 },
          { name: 'Ally Savings', amount: 1200 },
        ],
        dividendPayors: [
          { name: 'Vanguard VTI', amount: 3000 },
        ],
        hasForeignAccountOrTrust: false,
      },
    })

    expect(result.parsed.interestPayors).toHaveLength(2)
    expect(result.parsed.totalInterest).toBe(1700)
    expect(result.parsed.dividendPayors).toHaveLength(1)
    expect(result.parsed.totalOrdinaryDividends).toBe(3000)
    expect(result.parsed.hasForeignAccountOrTrust).toBe(false)
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interestPayors: [{ name: 'Bank', amount: 100 }],
        totalInterest: 100,
        hasForeignAccountOrTrust: true,
        foreignCountries: ['UK'],
      },
    })

    expect(result.parsed.totalInterest).toBe(100)
    expect(result.parsed.hasForeignAccountOrTrust).toBe(true)
    expect(result.parsed.foreignCountries).toEqual(['UK'])
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interest_payors: [{ name: 'Bank A', amount: 200 }],
        dividend_payors: [{ name: 'Fund B', amount: 800 }],
        has_foreign_account_or_trust: true,
        foreign_countries: ['Canada', 'UK'],
      },
    })

    expect(result.parsed.totalInterest).toBe(200)
    expect(result.parsed.totalOrdinaryDividends).toBe(800)
    expect(result.parsed.foreignCountries).toEqual(['Canada', 'UK'])
  })

  it('reports missing data warning when no payors or totals', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('No interest or dividend data'))).toBe(true)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.parsed.totalInterest).toBe(0)
    expect(result.parsed.totalOrdinaryDividends).toBe(0)
    expect(result.parsed.interestPayors).toHaveLength(0)
    expect(result.parsed.dividendPayors).toHaveLength(0)
  })

  it('warns when foreign account indicated but no countries listed', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interestPayors: [{ name: 'Bank', amount: 100 }],
        hasForeignAccountOrTrust: true,
      },
    })

    expect(result.warnings.some((w) => w.includes('Foreign account') && w.includes('no foreign countries'))).toBe(true)
  })

  it('calculates totals from individual payors', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interestPayors: [
          { name: 'Bank A', amount: 100 },
          { name: 'Bank B', amount: 200 },
          { name: 'Bank C', amount: 300 },
        ],
        dividendPayors: [
          { name: 'Fund X', amount: 1000 },
          { name: 'Fund Y', amount: 2000 },
        ],
      },
    })

    expect(result.parsed.totalInterest).toBe(600)
    expect(result.parsed.totalOrdinaryDividends).toBe(3000)
  })

  it('warns when computed total differs from provided total', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        interestPayors: [{ name: 'Bank', amount: 500 }],
        totalInterest: 999,
      },
    })

    expect(result.warnings.some((w) => w.includes('differs from provided total'))).toBe(true)
  })

  it('uses provided total when no payors listed', () => {
    const result = parseScheduleB({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        totalInterest: 750,
        totalOrdinaryDividends: 1500,
      },
    })

    expect(result.parsed.totalInterest).toBe(750)
    expect(result.parsed.totalOrdinaryDividends).toBe(1500)
  })
})
