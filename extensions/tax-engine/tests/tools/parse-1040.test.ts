import { describe, it, expect } from 'vitest'
import { parse1040 } from '../../src/tools/parse-1040.js'

describe('parse1040', () => {
  it('parses valid data correctly', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'married_filing_jointly',
        firstName: 'Jane',
        lastName: 'Doe',
        ssn: '***-**-1234',
        wages: 120000,
        taxableInterest: 500,
        qualifiedDividends: 3000,
        ordinaryDividends: 4000,
        capitalGainOrLoss: 5000,
        totalIncome: 129500,
        adjustedGrossIncome: 126000,
        standardOrItemizedDeduction: 29200,
        taxableIncome: 96800,
        totalTax: 15000,
        totalPayments: 18000,
        overpaid: 3000,
      },
    })

    expect(result.parsed.filingStatus).toBe('married_filing_jointly')
    expect(result.parsed.firstName).toBe('Jane')
    expect(result.parsed.lastName).toBe('Doe')
    expect(result.parsed.wages).toBe(120000)
    expect(result.parsed.totalIncome).toBe(129500)
    expect(result.parsed.overpaid).toBe(3000)
    expect(result.warnings).toHaveLength(0)
    expect(result.missingFields).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'single',
        firstName: 'John',
        lastName: 'Smith',
        adjustedGrossIncome: 80000,
        totalIncome: 85000,
      },
    })

    expect(result.parsed.adjustedGrossIncome).toBe(80000)
    expect(result.parsed.filingStatus).toBe('single')
  })

  it('handles snake_case field names', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filing_status: 'head_of_household',
        first_name: 'Alice',
        last_name: 'Johnson',
        box_1a_wages: 95000,
        adjusted_gross_income: 90000,
        total_income: 95000,
      },
    })

    expect(result.parsed.filingStatus).toBe('head_of_household')
    expect(result.parsed.firstName).toBe('Alice')
    expect(result.parsed.wages).toBe(95000)
  })

  it('reports missing required fields', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        wages: 50000,
        totalIncome: 50000,
      },
    })

    expect(result.missingFields).toContain('firstName')
    expect(result.missingFields).toContain('lastName')
    expect(result.missingFields).toContain('filingStatus')
  })

  it('defaults numeric fields to 0', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'single',
        firstName: 'Test',
        lastName: 'User',
      },
    })

    expect(result.parsed.wages).toBe(0)
    expect(result.parsed.taxableInterest).toBe(0)
    expect(result.parsed.capitalGainOrLoss).toBe(0)
    expect(result.parsed.totalTax).toBe(0)
  })

  it('reports warnings for suspicious values', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'single',
        firstName: 'Test',
        lastName: 'User',
        totalIncome: 0,
      },
    })

    expect(result.warnings.some((w) => w.includes('zero'))).toBe(true)
  })

  it('warns when both amountOwed and overpaid are non-zero', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'single',
        firstName: 'Test',
        lastName: 'User',
        totalIncome: 50000,
        amountOwed: 1000,
        overpaid: 500,
      },
    })

    expect(result.warnings.some((w) => w.includes('amountOwed') && w.includes('overpaid'))).toBe(true)
  })

  it('defaults unrecognized filing status to single with warning', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        filingStatus: 'invalid_status',
        firstName: 'Test',
        lastName: 'User',
        totalIncome: 50000,
      },
    })

    expect(result.parsed.filingStatus).toBe('single')
    expect(result.warnings.some((w) => w.includes('Unrecognized filing status'))).toBe(true)
  })

  it('preserves taxYear from input', () => {
    const result = parse1040({
      userId: 'user-1',
      taxYear: 2024,
      rawData: {
        filingStatus: 'single',
        firstName: 'Test',
        lastName: 'User',
        totalIncome: 50000,
      },
    })

    expect(result.parsed.taxYear).toBe(2024)
  })
})
