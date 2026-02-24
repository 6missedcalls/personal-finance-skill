/**
 * Tool: tax_parse_schedule_e
 * Parses raw Schedule E (rental/royalty income) data into structured form.
 */

import type {
  ScheduleE,
  ScheduleERental,
  ScheduleEPartnership,
  ParseFormInput,
  ParseFormOutput,
} from '../types.js'

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

function parseRentalExpenses(raw: Record<string, unknown>): ScheduleERental['expenses'] {
  const expRaw = (raw.expenses ?? raw) as Record<string, unknown>
  return {
    advertising: readNum(expRaw, 'advertising'),
    auto: readNum(expRaw, 'auto'),
    cleaning: readNum(expRaw, 'cleaning'),
    commissions: readNum(expRaw, 'commissions'),
    insurance: readNum(expRaw, 'insurance'),
    legal: readNum(expRaw, 'legal'),
    management: readNum(expRaw, 'management'),
    mortgage: readNum(expRaw, 'mortgage'),
    otherInterest: readNum(expRaw, 'otherInterest', 'other_interest'),
    repairs: readNum(expRaw, 'repairs'),
    supplies: readNum(expRaw, 'supplies'),
    taxes: readNum(expRaw, 'taxes'),
    utilities: readNum(expRaw, 'utilities'),
    depreciation: readNum(expRaw, 'depreciation'),
    other: readNum(expRaw, 'other'),
  }
}

function sumRentalExpenses(exp: ScheduleERental['expenses']): number {
  return (
    exp.advertising + exp.auto + exp.cleaning + exp.commissions +
    exp.insurance + exp.legal + exp.management + exp.mortgage +
    exp.otherInterest + exp.repairs + exp.supplies + exp.taxes +
    exp.utilities + exp.depreciation + exp.other
  )
}

function parseRental(raw: Record<string, unknown>): ScheduleERental {
  const rentsReceived = readNum(raw, 'rentsReceived', 'rents_received')
  const expenses = parseRentalExpenses(raw)
  const totalExpenses = sumRentalExpenses(expenses)
  const netIncomeLoss = rentsReceived - totalExpenses

  return {
    propertyAddress: readStr(raw, 'propertyAddress', 'property_address'),
    propertyType: readStr(raw, 'propertyType', 'property_type'),
    personalUseDays: readNum(raw, 'personalUseDays', 'personal_use_days'),
    fairRentalDays: readNum(raw, 'fairRentalDays', 'fair_rental_days'),
    rentsReceived,
    expenses,
    totalExpenses,
    netIncomeLoss,
  }
}

function parsePartnership(raw: Record<string, unknown>): ScheduleEPartnership {
  return {
    entityName: readStr(raw, 'entityName', 'entity_name'),
    entityEin: readStr(raw, 'entityEin', 'entity_ein'),
    isPassiveActivity: Boolean(raw.isPassiveActivity ?? raw.is_passive_activity ?? false),
    ordinaryIncomeLoss: readNum(raw, 'ordinaryIncomeLoss', 'ordinary_income_loss'),
    netRentalIncomeLoss: readNum(raw, 'netRentalIncomeLoss', 'net_rental_income_loss'),
    otherIncomeLoss: readNum(raw, 'otherIncomeLoss', 'other_income_loss'),
  }
}

export function parseScheduleE(input: ParseFormInput): ParseFormOutput<ScheduleE> {
  const { rawData, taxYear } = input
  const warnings: string[] = []
  const missingFields: string[] = []

  const rawRentals = (rawData.rentalProperties ?? rawData.rental_properties ?? []) as ReadonlyArray<Record<string, unknown>>
  const rentalProperties = rawRentals.map(parseRental)

  const rawPartnerships = (rawData.partnershipAndSCorpIncome ?? rawData.partnership_and_s_corp_income ?? []) as ReadonlyArray<Record<string, unknown>>
  const partnershipAndSCorpIncome = rawPartnerships.map(parsePartnership)

  const totalRentalIncomeLoss = rentalProperties.reduce((sum, p) => sum + p.netIncomeLoss, 0)
  const totalPartnershipIncomeLoss = partnershipAndSCorpIncome.reduce(
    (sum, p) => sum + p.ordinaryIncomeLoss + p.netRentalIncomeLoss + p.otherIncomeLoss,
    0,
  )
  const totalScheduleEIncomeLoss = totalRentalIncomeLoss + totalPartnershipIncomeLoss

  if (rentalProperties.length === 0 && partnershipAndSCorpIncome.length === 0) {
    warnings.push('No rental properties or partnership income provided')
  }

  for (const prop of rentalProperties) {
    if (prop.personalUseDays > 14 && prop.fairRentalDays > 0) {
      warnings.push(`Property "${prop.propertyAddress || 'unknown'}" has >14 personal use days — mixed-use rules may apply`)
    }
  }

  const parsed: ScheduleE = {
    taxYear,
    rentalProperties,
    partnershipAndSCorpIncome,
    totalRentalIncomeLoss,
    totalPartnershipIncomeLoss,
    totalScheduleEIncomeLoss,
  }

  return { parsed, warnings, missingFields }
}
