import { describe, it, expect } from 'vitest'
import { parseScheduleSE } from '../../src/tools/parse-schedule-se.js'

describe('parseScheduleSE', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 100000,
      },
    })

    const seTaxBase = 100000 * 0.9235 // 92350
    const ssTax = Math.min(seTaxBase, 176100) * 0.124 // 92350 * 0.124 = 11451.40
    const medicareTax = seTaxBase * 0.029 // 92350 * 0.029 = 2678.15
    const totalSE = ssTax + medicareTax

    expect(result.parsed.netEarningsFromSelfEmployment).toBe(100000)
    expect(result.parsed.socialSecurityWageBase).toBe(176100)
    expect(result.parsed.socialSecurityTax).toBeCloseTo(ssTax, 2)
    expect(result.parsed.medicareTax).toBeCloseTo(medicareTax, 2)
    expect(result.parsed.additionalMedicareTax).toBe(0)
    expect(result.parsed.totalSelfEmploymentTax).toBeCloseTo(totalSE, 2)
    expect(result.parsed.deductiblePartOfSeTax).toBeCloseTo(totalSE * 0.5, 2)
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 50000,
      },
    })

    expect(result.parsed.netEarningsFromSelfEmployment).toBe(50000)
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        net_earnings_from_self_employment: 75000,
      },
    })

    expect(result.parsed.netEarningsFromSelfEmployment).toBe(75000)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.parsed.netEarningsFromSelfEmployment).toBe(0)
    expect(result.parsed.socialSecurityTax).toBe(0)
    expect(result.parsed.medicareTax).toBe(0)
  })

  it('reports warnings for zero earnings', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('Zero self-employment earnings'))).toBe(true)
  })

  it('calculates additional Medicare tax for high earners', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 300000,
      },
    })

    const seTaxBase = 300000 * 0.9235 // 277050
    const additionalMedicare = (seTaxBase - 200000) * 0.009

    expect(result.parsed.additionalMedicareTax).toBeCloseTo(additionalMedicare, 2)
    expect(result.warnings.some((w) => w.includes('Additional Medicare tax'))).toBe(true)
  })

  it('caps Social Security tax at wage base', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 250000,
      },
    })

    const expectedSSTax = 176100 * 0.124 // capped at wage base
    expect(result.parsed.socialSecurityTax).toBeCloseTo(expectedSSTax, 2)
  })

  it('warns on negative earnings', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: -5000,
      },
    })

    expect(result.warnings.some((w) => w.includes('Negative self-employment earnings'))).toBe(true)
  })

  it('deductible part is exactly half of total SE tax', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 80000,
      },
    })

    expect(result.parsed.deductiblePartOfSeTax).toBeCloseTo(
      result.parsed.totalSelfEmploymentTax * 0.5,
      2,
    )
  })

  it('allows custom wage base override', () => {
    const result = parseScheduleSE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        netEarningsFromSelfEmployment: 100000,
        socialSecurityWageBase: 160200,
      },
    })

    expect(result.parsed.socialSecurityWageBase).toBe(160200)
  })
})
