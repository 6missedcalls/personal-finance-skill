import { describe, expect, it } from 'vitest'
import { parse1099B } from '../../src/tools/parse-1099b.js'
import { parse1099DIV } from '../../src/tools/parse-1099div.js'
import { parse1099INT } from '../../src/tools/parse-1099int.js'
import { parseW2 } from '../../src/tools/parse-w2.js'
import { parseK1 } from '../../src/tools/parse-k1.js'

describe('parse1099B', () => {
  it('parses valid 1099-B data', () => {
    const result = parse1099B({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'Fidelity',
        payerTin: '12-3456789',
        recipientName: 'Jane Doe',
        recipientTin: '***-**-1234',
        accountNumber: 'Z12345',
        transactions: [
          {
            description: '100 SH AAPL',
            dateAcquired: '2024-01-15',
            dateSold: '2025-06-01',
            proceeds: 22000,
            costBasis: 15000,
            washSaleLossDisallowed: 0,
            gainType: 'long_term',
            basisReportedToIrs: true,
          },
        ],
      },
    })

    expect(result.parsed.payerName).toBe('Fidelity')
    expect(result.parsed.transactions).toHaveLength(1)
    expect(result.parsed.transactions[0].proceeds).toBe(22000)
    expect(result.parsed.transactions[0].gainType).toBe('long_term')
    expect(result.warnings).toHaveLength(0)
    expect(result.missingFields).toHaveLength(0)
  })

  it('warns on zero proceeds', () => {
    const result = parse1099B({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'Broker',
        transactions: [{ proceeds: 0, costBasis: 100, dateSold: '2025-01-01' }],
      },
    })

    expect(result.warnings.some((w) => w.includes('zero proceeds'))).toBe(true)
  })

  it('reports missing payer name', () => {
    const result = parse1099B({
      userId: 'user-1',
      taxYear: 2025,
      rawData: { transactions: [] },
    })

    expect(result.missingFields).toContain('payerName')
  })

  it('accepts snake_case field names', () => {
    const result = parse1099B({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payer_name: 'Schwab',
        recipient_name: 'John',
        transactions: [
          {
            box_1a_description: '50 SH TSLA',
            box_1c_date_sold_or_disposed: '2025-03-01',
            box_1d_proceeds: 5000,
            box_1e_cost_or_other_basis: 4000,
            box_2_gain_type: 'short',
          },
        ],
      },
    })

    expect(result.parsed.payerName).toBe('Schwab')
    expect(result.parsed.transactions[0].proceeds).toBe(5000)
    expect(result.parsed.transactions[0].gainType).toBe('short_term')
  })
})

describe('parse1099DIV', () => {
  it('parses valid 1099-DIV data', () => {
    const result = parse1099DIV({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'Vanguard',
        totalOrdinaryDividends: 5000,
        qualifiedDividends: 4000,
        totalCapitalGainDistributions: 1000,
        foreignTaxPaid: 50,
      },
    })

    expect(result.parsed.totalOrdinaryDividends).toBe(5000)
    expect(result.parsed.qualifiedDividends).toBe(4000)
    expect(result.parsed.foreignTaxPaid).toBe(50)
  })

  it('warns when qualified exceeds ordinary', () => {
    const result = parse1099DIV({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'Fund',
        totalOrdinaryDividends: 1000,
        qualifiedDividends: 2000,
      },
    })

    expect(result.warnings.some((w) => w.includes('exceed'))).toBe(true)
  })

  it('warns on nondividend distributions', () => {
    const result = parse1099DIV({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'REIT Fund',
        nondividendDistributions: 500,
      },
    })

    expect(result.warnings.some((w) => w.includes('return of capital'))).toBe(true)
  })
})

describe('parse1099INT', () => {
  it('parses valid 1099-INT data', () => {
    const result = parse1099INT({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        payerName: 'Chase Bank',
        interestIncome: 1500,
        federalTaxWithheld: 0,
      },
    })

    expect(result.parsed.interestIncome).toBe(1500)
    expect(result.parsed.payerName).toBe('Chase Bank')
  })

  it('warns on bond premium', () => {
    const result = parse1099INT({
      userId: 'user-1',
      taxYear: 2025,
      rawData: { payerName: 'Bond Fund', interestIncome: 1000, bondPremium: 200 },
    })

    expect(result.warnings.some((w) => w.includes('Bond premium'))).toBe(true)
  })
})

describe('parseW2', () => {
  it('parses valid W-2 data', () => {
    const result = parseW2({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        employerName: 'Acme Corp',
        employeeName: 'Jane Doe',
        wagesTipsOtherComp: 120000,
        federalTaxWithheld: 25000,
        socialSecurityWages: 120000,
        medicareWagesAndTips: 120000,
        retirementPlan: true,
        box12Codes: [{ code: 'D', amount: 22500 }],
      },
    })

    expect(result.parsed.wagesTipsOtherComp).toBe(120000)
    expect(result.parsed.federalTaxWithheld).toBe(25000)
    expect(result.parsed.retirementPlan).toBe(true)
    expect(result.parsed.box12Codes[0].code).toBe('D')
  })

  it('warns on no withholding for significant wages', () => {
    const result = parseW2({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        employerName: 'Company',
        employeeName: 'John',
        wagesTipsOtherComp: 80000,
        federalTaxWithheld: 0,
      },
    })

    expect(result.warnings.some((w) => w.includes('No federal withholding'))).toBe(true)
  })
})

describe('parseK1', () => {
  it('parses valid K-1 data', () => {
    const result = parseK1({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        partnershipName: 'Investment LP',
        partnerName: 'Jane Doe',
        partnerType: 'limited',
        ordinaryBusinessIncomeLoss: 25000,
        netLongTermCapitalGainLoss: 15000,
        guaranteedPayments: 0,
      },
    })

    expect(result.parsed.ordinaryBusinessIncomeLoss).toBe(25000)
    expect(result.parsed.netLongTermCapitalGainLoss).toBe(15000)
    expect(result.parsed.partnerType).toBe('limited')
  })

  it('warns on guaranteed payments', () => {
    const result = parseK1({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        partnershipName: 'GP Fund',
        partnerName: 'Partner',
        guaranteedPayments: 50000,
      },
    })

    expect(result.warnings.some((w) => w.includes('self-employment tax'))).toBe(true)
  })

  it('warns on Section 1231 gains', () => {
    const result = parseK1({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        partnershipName: 'RE Fund',
        partnerName: 'Investor',
        section1231GainLoss: 10000,
      },
    })

    expect(result.warnings.some((w) => w.includes('1231'))).toBe(true)
  })
})
