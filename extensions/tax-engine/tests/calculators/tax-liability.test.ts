import { describe, expect, it } from 'vitest'
import { applyBrackets, estimateTaxLiability, getMarginalRate } from '../../src/calculators/tax-liability.js'
import { getOrdinaryBrackets } from '../../src/calculators/tax-brackets.js'
import type { IncomeSummary } from '../../src/types.js'

describe('applyBrackets', () => {
  it('computes tax on income in first bracket only', () => {
    const brackets = getOrdinaryBrackets('single')
    const tax = applyBrackets(10000, brackets)
    expect(tax).toBe(1000) // 10% of 10,000
  })

  it('computes tax across multiple brackets', () => {
    const brackets = getOrdinaryBrackets('single')
    // $50,000 taxable income:
    // 10% on first $11,925 = $1,192.50
    // 12% on next $36,550 ($11,925 - $48,475) = $4,386
    // 22% on remaining $1,525 ($48,475 - $50,000) = $335.50
    // Total = ~$5,914
    const tax = applyBrackets(50000, brackets)
    expect(tax).toBe(5914)
  })

  it('handles zero income', () => {
    const brackets = getOrdinaryBrackets('single')
    expect(applyBrackets(0, brackets)).toBe(0)
  })

  it('handles negative income', () => {
    const brackets = getOrdinaryBrackets('single')
    expect(applyBrackets(-5000, brackets)).toBe(0)
  })

  it('computes tax for married filing jointly', () => {
    const brackets = getOrdinaryBrackets('married_filing_jointly')
    // $50,000 taxable:
    // 10% on $23,850 = $2,385
    // 12% on $26,150 = $3,138
    // Total = $5,523
    const tax = applyBrackets(50000, brackets)
    expect(tax).toBe(5523)
  })
})

describe('getMarginalRate', () => {
  it('returns 10% for low income single filer', () => {
    expect(getMarginalRate(5000, 'single')).toBe(0.10)
  })

  it('returns 22% for mid-range single filer', () => {
    expect(getMarginalRate(60000, 'single')).toBe(0.22)
  })

  it('returns 37% for high income single filer', () => {
    expect(getMarginalRate(700000, 'single')).toBe(0.37)
  })
})

describe('estimateTaxLiability', () => {
  const baseIncome: IncomeSummary = {
    wages: 100000,
    ordinaryDividends: 0,
    qualifiedDividends: 0,
    interestIncome: 0,
    taxExemptInterest: 0,
    shortTermGains: 0,
    longTermGains: 0,
    businessIncome: 0,
    rentalIncome: 0,
    otherIncome: 0,
    totalWithholding: 20000,
    estimatedPayments: 0,
    deductions: 0,
    foreignTaxCredit: 0,
  }

  it('computes basic wage income liability', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome)

    expect(result.taxYear).toBe(2025)
    expect(result.filingStatus).toBe('single')
    expect(result.grossIncome).toBe(100000)
    expect(result.totalFederalTax).toBeGreaterThan(0)
    expect(result.totalWithholding).toBe(20000)
    expect(result.assumptions).toContain('Using standard deduction')
  })

  it('uses standard deduction when no itemized', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome)
    // Taxable = 100,000 - 15,000 standard deduction = 85,000
    expect(result.taxableOrdinaryIncome).toBe(85000)
  })

  it('uses itemized deductions when larger', () => {
    const income: IncomeSummary = { ...baseIncome, deductions: 25000 }
    const result = estimateTaxLiability(2025, 'single', income)

    expect(result.taxableOrdinaryIncome).toBe(75000) // 100k - 25k
    expect(result.assumptions).toContain('Using itemized deductions')
  })

  it('computes LTCG tax on long-term gains', () => {
    const income: IncomeSummary = { ...baseIncome, longTermGains: 50000 }
    const result = estimateTaxLiability(2025, 'single', income)

    expect(result.longTermCapitalGainsTax).toBeGreaterThan(0)
    expect(result.grossIncome).toBe(150000)
  })

  it('computes qualified dividend tax', () => {
    const income: IncomeSummary = {
      ...baseIncome,
      ordinaryDividends: 10000,
      qualifiedDividends: 8000,
    }
    const result = estimateTaxLiability(2025, 'single', income)

    expect(result.qualifiedDividendTax).toBeGreaterThanOrEqual(0)
  })

  it('computes self-employment tax', () => {
    const income: IncomeSummary = { ...baseIncome, wages: 0, businessIncome: 100000 }
    const result = estimateTaxLiability(2025, 'single', income)

    expect(result.selfEmploymentTax).toBeGreaterThan(0)
  })

  it('computes state tax when state provided', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome, 'CA')

    expect(result.stateTax).toBeGreaterThan(0)
    expect(result.totalTax).toBeGreaterThan(result.totalFederalTax)
  })

  it('computes zero state tax for no-income-tax states', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome, 'TX')

    expect(result.stateTax).toBe(0)
  })

  it('computes NIIT on high income', () => {
    const income: IncomeSummary = {
      ...baseIncome,
      wages: 200000,
      longTermGains: 100000,
      interestIncome: 20000,
    }
    const result = estimateTaxLiability(2025, 'single', income)

    expect(result.netInvestmentIncomeTax).toBeGreaterThan(0)
  })

  it('calculates balance due correctly', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome)

    expect(result.balanceDue).toBe(result.totalTax - result.totalWithholding - result.estimatedPayments)
  })

  it('calculates effective rate', () => {
    const result = estimateTaxLiability(2025, 'single', baseIncome)

    expect(result.effectiveRate).toBeGreaterThan(0)
    expect(result.effectiveRate).toBeLessThan(0.5) // Sanity check
  })

  it('handles married filing jointly standard deduction', () => {
    const result = estimateTaxLiability(2025, 'married_filing_jointly', baseIncome)

    // MFJ standard deduction is $30,000
    expect(result.taxableOrdinaryIncome).toBe(70000) // 100k - 30k
  })
})
