/**
 * Tool: tax_parse_schedule_c
 * Parses raw Schedule C (self-employment income) data into structured form.
 */

import type { ScheduleC, ScheduleCExpenses, ParseFormInput, ParseFormOutput } from '../types.js'

function readNum(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): number {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return Number(raw[key])
  }
  return 0
}

function readStr(raw: Record<string, unknown>, ...keys: ReadonlyArray<string>): string {
  for (const key of keys) {
    if (raw[key] !== undefined && raw[key] !== null) return String(raw[key])
  }
  return ''
}

function parseAccountingMethod(raw: Record<string, unknown>): "cash" | "accrual" | "other" {
  const value = String(raw.accountingMethod ?? raw.accounting_method ?? 'cash').toLowerCase()
  if (value === 'accrual') return 'accrual'
  if (value === 'other') return 'other'
  return 'cash'
}

function parseExpenses(raw: Record<string, unknown>): ScheduleCExpenses {
  const expRaw = (raw.expenses ?? raw) as Record<string, unknown>
  return {
    advertising: readNum(expRaw, 'advertising'),
    carAndTruckExpenses: readNum(expRaw, 'carAndTruckExpenses', 'car_and_truck_expenses'),
    commissions: readNum(expRaw, 'commissions'),
    contractLabor: readNum(expRaw, 'contractLabor', 'contract_labor'),
    depletion: readNum(expRaw, 'depletion'),
    depreciation: readNum(expRaw, 'depreciation'),
    employeeBenefits: readNum(expRaw, 'employeeBenefits', 'employee_benefits'),
    insurance: readNum(expRaw, 'insurance'),
    interestMortgage: readNum(expRaw, 'interestMortgage', 'interest_mortgage'),
    interestOther: readNum(expRaw, 'interestOther', 'interest_other'),
    legalAndProfessional: readNum(expRaw, 'legalAndProfessional', 'legal_and_professional'),
    officeExpense: readNum(expRaw, 'officeExpense', 'office_expense'),
    pensionAndProfitSharing: readNum(expRaw, 'pensionAndProfitSharing', 'pension_and_profit_sharing'),
    rentVehicles: readNum(expRaw, 'rentVehicles', 'rent_vehicles'),
    rentOther: readNum(expRaw, 'rentOther', 'rent_other'),
    repairs: readNum(expRaw, 'repairs'),
    supplies: readNum(expRaw, 'supplies'),
    taxesAndLicenses: readNum(expRaw, 'taxesAndLicenses', 'taxes_and_licenses'),
    travel: readNum(expRaw, 'travel'),
    meals: readNum(expRaw, 'meals'),
    utilities: readNum(expRaw, 'utilities'),
    wages: readNum(expRaw, 'wages'),
    otherExpenses: readNum(expRaw, 'otherExpenses', 'other_expenses'),
  }
}

function sumExpenses(exp: ScheduleCExpenses): number {
  return (
    exp.advertising +
    exp.carAndTruckExpenses +
    exp.commissions +
    exp.contractLabor +
    exp.depletion +
    exp.depreciation +
    exp.employeeBenefits +
    exp.insurance +
    exp.interestMortgage +
    exp.interestOther +
    exp.legalAndProfessional +
    exp.officeExpense +
    exp.pensionAndProfitSharing +
    exp.rentVehicles +
    exp.rentOther +
    exp.repairs +
    exp.supplies +
    exp.taxesAndLicenses +
    exp.travel +
    exp.meals +
    exp.utilities +
    exp.wages +
    exp.otherExpenses
  )
}

export function parseScheduleC(input: ParseFormInput): ParseFormOutput<ScheduleC> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const businessName = readStr(rawData, 'businessName', 'business_name')
  if (!businessName) missingFields.push('businessName')

  const grossReceipts = readNum(rawData, 'grossReceipts', 'gross_receipts')
  const returnsAndAllowances = readNum(rawData, 'returnsAndAllowances', 'returns_and_allowances')
  const costOfGoodsSold = readNum(rawData, 'costOfGoodsSold', 'cost_of_goods_sold')
  const grossProfit = grossReceipts - returnsAndAllowances - costOfGoodsSold
  const otherIncome = readNum(rawData, 'otherIncome', 'other_income')
  const grossIncome = grossProfit + otherIncome

  const expenses = parseExpenses(rawData)
  const totalExpenses = sumExpenses(expenses)
  const netProfitOrLoss = grossIncome - totalExpenses

  if (grossReceipts === 0) warnings.push('Zero gross receipts — verify data')
  if (netProfitOrLoss < 0) warnings.push('Net loss reported — review hobby loss rules if applicable')

  const parsed: ScheduleC = {
    taxYear,
    businessName,
    principalBusinessCode: readStr(rawData, 'principalBusinessCode', 'principal_business_code'),
    businessEin: readStr(rawData, 'businessEin', 'business_ein'),
    accountingMethod: parseAccountingMethod(rawData),
    grossReceipts,
    returnsAndAllowances,
    costOfGoodsSold,
    grossProfit,
    otherIncome,
    grossIncome,
    expenses,
    totalExpenses,
    netProfitOrLoss,
  }

  return { parsed, warnings, missingFields }
}
