import { describe, it, expect } from 'vitest'
import { parseStateReturn } from '../../src/tools/parse-state-return.js'

describe('parseStateReturn', () => {
  it('parses valid data correctly', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'CA',
        formId: '540',
        filingStatus: 'single',
        federalAGI: 100000,
        stateAdditions: 2000,
        stateSubtractions: 5000,
        stateAGI: 97000,
        stateDeductions: 5202,
        stateTaxableIncome: 91798,
        stateTaxComputed: 6000,
        stateCredits: 500,
        stateWithholding: 4500,
        stateEstimatedPayments: 500,
      },
    })

    expect(result.parsed.stateCode).toBe('CA')
    expect(result.parsed.formId).toBe('540')
    expect(result.parsed.federalAGI).toBe(100000)
    expect(result.parsed.stateBalanceDue).toBe(500) // 6000 - 500 - 4500 - 500
    expect(result.parsed.stateOverpayment).toBe(0)
    expect(result.warnings).toHaveLength(0)
    expect(result.missingFields).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'NY',
        formId: 'IT-201',
        federalAGI: 80000,
        stateTaxComputed: 4000,
        stateWithholding: 5000,
      },
    })

    expect(result.parsed.stateCode).toBe('NY')
    expect(result.parsed.stateOverpayment).toBe(1000) // 5000 - 4000
  })

  it('handles snake_case field names', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        state_code: 'tx',
        form_id: 'none',
        federal_agi: 90000,
        state_tax_computed: 0,
        state_withholding: 0,
        filing_status: 'married_filing_jointly',
      },
    })

    expect(result.parsed.stateCode).toBe('TX')
    expect(result.parsed.filingStatus).toBe('married_filing_jointly')
  })

  it('reports missing required fields', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        federalAGI: 50000,
      },
    })

    expect(result.missingFields).toContain('stateCode')
    expect(result.missingFields).toContain('formId')
  })

  it('defaults numeric fields to 0', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'FL',
        formId: 'none',
      },
    })

    expect(result.parsed.federalAGI).toBe(0)
    expect(result.parsed.stateAdditions).toBe(0)
    expect(result.parsed.stateTaxComputed).toBe(0)
    expect(result.parsed.stateBalanceDue).toBe(0)
    expect(result.parsed.stateOverpayment).toBe(0)
  })

  it('reports warnings for zero federal AGI', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'WA',
        formId: 'none',
        federalAGI: 0,
      },
    })

    expect(result.warnings.some((w) => w.includes('Federal AGI is zero'))).toBe(true)
  })

  it('calculates balance due correctly', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'CA',
        formId: '540',
        federalAGI: 100000,
        stateTaxComputed: 10000,
        stateCredits: 1000,
        stateWithholding: 5000,
        stateEstimatedPayments: 2000,
      },
    })

    expect(result.parsed.stateBalanceDue).toBe(2000) // 10000 - 1000 - 5000 - 2000
    expect(result.parsed.stateOverpayment).toBe(0)
  })

  it('calculates overpayment correctly', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'NY',
        formId: 'IT-201',
        federalAGI: 100000,
        stateTaxComputed: 5000,
        stateCredits: 1000,
        stateWithholding: 6000,
        stateEstimatedPayments: 1000,
      },
    })

    expect(result.parsed.stateBalanceDue).toBe(0)
    expect(result.parsed.stateOverpayment).toBe(3000) // |5000 - 1000 - 6000 - 1000|
  })

  it('uppercases state code', () => {
    const result = parseStateReturn({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        stateCode: 'ca',
        formId: '540',
        federalAGI: 50000,
      },
    })

    expect(result.parsed.stateCode).toBe('CA')
  })
})
