import { describe, it, expect } from 'vitest'
import { parseScheduleC } from '../../src/tools/parse-schedule-c.js'

describe('parseScheduleC', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'Consulting LLC',
        principalBusinessCode: '541611',
        accountingMethod: 'cash',
        grossReceipts: 200000,
        returnsAndAllowances: 0,
        costOfGoodsSold: 0,
        otherIncome: 0,
        expenses: {
          advertising: 1000,
          insurance: 2000,
          officeExpense: 3000,
          travel: 5000,
          meals: 2000,
        },
      },
    })

    expect(result.parsed.businessName).toBe('Consulting LLC')
    expect(result.parsed.grossReceipts).toBe(200000)
    expect(result.parsed.grossProfit).toBe(200000)
    expect(result.parsed.grossIncome).toBe(200000)
    expect(result.parsed.totalExpenses).toBe(13000)
    expect(result.parsed.netProfitOrLoss).toBe(187000)
    expect(result.warnings).toHaveLength(0)
    expect(result.missingFields).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'Test Co',
        grossReceipts: 50000,
        costOfGoodsSold: 10000,
      },
    })

    expect(result.parsed.grossProfit).toBe(40000)
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        business_name: 'Snake Case Co',
        gross_receipts: 75000,
        returns_and_allowances: 5000,
        cost_of_goods_sold: 20000,
        other_income: 1000,
      },
    })

    expect(result.parsed.businessName).toBe('Snake Case Co')
    expect(result.parsed.grossProfit).toBe(50000)
    expect(result.parsed.grossIncome).toBe(51000)
  })

  it('reports missing required fields', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        grossReceipts: 50000,
      },
    })

    expect(result.missingFields).toContain('businessName')
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'Empty Co',
      },
    })

    expect(result.parsed.grossReceipts).toBe(0)
    expect(result.parsed.costOfGoodsSold).toBe(0)
    expect(result.parsed.expenses.advertising).toBe(0)
    expect(result.parsed.expenses.travel).toBe(0)
    expect(result.parsed.totalExpenses).toBe(0)
  })

  it('reports warnings for zero gross receipts', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'No Revenue',
        grossReceipts: 0,
      },
    })

    expect(result.warnings.some((w) => w.includes('Zero gross receipts'))).toBe(true)
  })

  it('calculates derived fields correctly', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'Test Biz',
        grossReceipts: 100000,
        returnsAndAllowances: 5000,
        costOfGoodsSold: 20000,
        otherIncome: 3000,
        expenses: {
          advertising: 1000,
          insurance: 2000,
          officeExpense: 1500,
          utilities: 500,
        },
      },
    })

    expect(result.parsed.grossProfit).toBe(75000) // 100000 - 5000 - 20000
    expect(result.parsed.grossIncome).toBe(78000) // 75000 + 3000
    expect(result.parsed.totalExpenses).toBe(5000) // 1000+2000+1500+500
    expect(result.parsed.netProfitOrLoss).toBe(73000) // 78000 - 5000
  })

  it('warns on net loss', () => {
    const result = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        businessName: 'Losing Co',
        grossReceipts: 10000,
        expenses: {
          advertising: 5000,
          insurance: 4000,
          officeExpense: 3000,
        },
      },
    })

    expect(result.parsed.netProfitOrLoss).toBe(-2000)
    expect(result.warnings.some((w) => w.includes('Net loss'))).toBe(true)
  })

  it('parses accounting method', () => {
    const accrual = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: { businessName: 'Accrual Co', accountingMethod: 'accrual', grossReceipts: 100 },
    })
    expect(accrual.parsed.accountingMethod).toBe('accrual')

    const other = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: { businessName: 'Other Co', accounting_method: 'other', grossReceipts: 100 },
    })
    expect(other.parsed.accountingMethod).toBe('other')

    const defaultCash = parseScheduleC({
      userId: 'user-1',
      taxYear: 2025,
      rawData: { businessName: 'Default Co', grossReceipts: 100 },
    })
    expect(defaultCash.parsed.accountingMethod).toBe('cash')
  })
})
