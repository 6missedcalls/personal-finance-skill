import { describe, it, expect } from 'vitest'
import { parseScheduleA } from '../../src/tools/parse-schedule-a.js'

describe('parseScheduleA', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        agi: 150000,
        medicalAndDentalExpenses: 15000,
        stateAndLocalTaxes: 8000,
        homeInterest: 12000,
        charitableCashContributions: 5000,
        charitableNonCash: 1000,
        charitableCarryover: 0,
      },
    })

    expect(result.parsed.stateAndLocalTaxes).toBe(8000)
    expect(result.parsed.saltDeductionCapped).toBe(8000)
    expect(result.parsed.homeInterest).toBe(12000)
    expect(result.parsed.totalCharitable).toBe(6000)
    expect(result.parsed.medicalThreshold).toBe(11250) // 150000 * 0.075
    expect(result.parsed.deductibleMedical).toBe(3750) // 15000 - 11250
    expect(result.parsed.totalItemizedDeductions).toBe(29750) // 3750 + 8000 + 12000 + 6000
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateAndLocalTaxes: 5000,
        homeInterest: 10000,
        charitableCashContributions: 2000,
      },
    })

    expect(result.parsed.stateAndLocalTaxes).toBe(5000)
    expect(result.parsed.homeInterest).toBe(10000)
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        state_and_local_taxes: 7000,
        home_interest: 8000,
        medical_and_dental_expenses: 5000,
        charitable_cash_contributions: 3000,
      },
    })

    expect(result.parsed.stateAndLocalTaxes).toBe(7000)
    expect(result.parsed.homeInterest).toBe(8000)
    expect(result.parsed.charitableCashContributions).toBe(3000)
  })

  it('enforces SALT cap at $10,000', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateAndLocalTaxes: 25000,
        homeInterest: 5000,
      },
    })

    expect(result.parsed.saltDeductionCapped).toBe(10000)
    expect(result.warnings.some((w) => w.includes('SALT') && w.includes('capped'))).toBe(true)
  })

  it('calculates medical threshold as 7.5% of AGI', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        agi: 100000,
        medicalAndDentalExpenses: 10000,
      },
    })

    expect(result.parsed.medicalThreshold).toBe(7500)
    expect(result.parsed.deductibleMedical).toBe(2500)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.parsed.medicalAndDentalExpenses).toBe(0)
    expect(result.parsed.stateAndLocalTaxes).toBe(0)
    expect(result.parsed.homeInterest).toBe(0)
    expect(result.parsed.totalItemizedDeductions).toBe(0)
  })

  it('reports warnings for zero total deductions', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('zero'))).toBe(true)
  })

  it('calculates derived fields correctly', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateAndLocalTaxes: 10000,
        homeInterest: 15000,
        charitableCashContributions: 3000,
        charitableNonCash: 2000,
        charitableCarryover: 500,
        casualtyAndTheftLosses: 1000,
        otherItemizedDeductions: 200,
      },
    })

    expect(result.parsed.totalCharitable).toBe(5500)
    expect(result.parsed.totalItemizedDeductions).toBe(31700) // 0 + 10000 + 15000 + 5500 + 1000 + 200
  })

  it('warns on charitable contributions exceeding 60% of AGI', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        agi: 50000,
        charitableCashContributions: 35000,
      },
    })

    expect(result.warnings.some((w) => w.includes('Charitable') && w.includes('60%'))).toBe(true)
  })

  it('medical deduction is zero when expenses below threshold', () => {
    const result = parseScheduleA({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        agi: 200000,
        medicalAndDentalExpenses: 10000,
      },
    })

    expect(result.parsed.medicalThreshold).toBe(15000)
    expect(result.parsed.deductibleMedical).toBe(0)
  })
})
