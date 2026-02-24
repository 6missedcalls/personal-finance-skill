import { describe, it, expect } from 'vitest'
import { parseForm6251 } from '../../src/tools/parse-form-6251.js'

describe('parseForm6251', () => {
  it('parses valid data correctly', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 200000,
        stateAndLocalTaxDeduction: 10000,
        taxExemptInterest: 2000,
        incentiveStockOptions: 50000,
        otherAdjustments: 0,
        exemptionAmount: 85700,
        amtExemptionPhaseout: 0,
        reducedExemption: 85700,
        amtTaxableAmount: 176300,
        tentativeMinimumTax: 46000,
        regularTax: 40000,
      },
    })

    expect(result.parsed.alternativeMinimumTaxableIncome).toBe(262000)
    expect(result.parsed.alternativeMinimumTax).toBe(6000) // 46000 - 40000
    expect(result.parsed.taxableIncomeFromForm1040).toBe(200000)
    expect(result.warnings.some((w) => w.includes('AMT of $6000 applies'))).toBe(true)
    expect(result.warnings.some((w) => w.includes('ISO exercise'))).toBe(true)
  })

  it('handles camelCase field names', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 150000,
        stateAndLocalTaxDeduction: 10000,
        tentativeMinimumTax: 30000,
        regularTax: 35000,
      },
    })

    expect(result.parsed.taxableIncomeFromForm1040).toBe(150000)
    expect(result.parsed.alternativeMinimumTax).toBe(0)
  })

  it('handles snake_case field names', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxable_income_from_form_1040: 180000,
        state_and_local_tax_deduction: 10000,
        tax_exempt_interest: 1000,
        incentive_stock_options: 20000,
        other_adjustments: 500,
        tentative_minimum_tax: 42000,
        regular_tax: 38000,
      },
    })

    expect(result.parsed.taxableIncomeFromForm1040).toBe(180000)
    expect(result.parsed.incentiveStockOptions).toBe(20000)
    expect(result.parsed.alternativeMinimumTaxableIncome).toBe(211500)
    expect(result.parsed.alternativeMinimumTax).toBe(4000)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.parsed.taxableIncomeFromForm1040).toBe(0)
    expect(result.parsed.stateAndLocalTaxDeduction).toBe(0)
    expect(result.parsed.incentiveStockOptions).toBe(0)
    expect(result.parsed.alternativeMinimumTaxableIncome).toBe(0)
    expect(result.parsed.alternativeMinimumTax).toBe(0)
  })

  it('reports warnings for zero taxable income', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('Taxable income from Form 1040 is zero'))).toBe(true)
  })

  it('calculates AMTI correctly', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 100000,
        stateAndLocalTaxDeduction: 10000,
        taxExemptInterest: 5000,
        incentiveStockOptions: 25000,
        otherAdjustments: 3000,
      },
    })

    expect(result.parsed.alternativeMinimumTaxableIncome).toBe(143000)
  })

  it('AMT is zero when regular tax exceeds tentative minimum tax', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 100000,
        tentativeMinimumTax: 20000,
        regularTax: 25000,
      },
    })

    expect(result.parsed.alternativeMinimumTax).toBe(0)
  })

  it('warns on ISO exercise', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 100000,
        incentiveStockOptions: 30000,
      },
    })

    expect(result.warnings.some((w) => w.includes('ISO exercise'))).toBe(true)
  })

  it('warns when AMT applies', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        taxableIncomeFromForm1040: 100000,
        tentativeMinimumTax: 30000,
        regularTax: 20000,
      },
    })

    expect(result.parsed.alternativeMinimumTax).toBe(10000)
    expect(result.warnings.some((w) => w.includes('AMT of $10000 applies'))).toBe(true)
  })

  it('preserves taxYear from input', () => {
    const result = parseForm6251({
      userId: 'user-1',
      taxYear: 2024,
      rawData: {
        taxableIncomeFromForm1040: 50000,
      },
    })

    expect(result.parsed.taxYear).toBe(2024)
  })
})
