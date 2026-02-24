import { describe, it, expect } from 'vitest'
import { parseScheduleE } from '../../src/tools/parse-schedule-e.js'

describe('parseScheduleE', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rentalProperties: [
          {
            propertyAddress: '123 Main St, Austin TX',
            propertyType: 'Single Family',
            personalUseDays: 0,
            fairRentalDays: 365,
            rentsReceived: 24000,
            expenses: {
              insurance: 1200,
              mortgage: 8000,
              repairs: 2000,
              taxes: 3000,
              depreciation: 5000,
            },
          },
        ],
        partnershipAndSCorpIncome: [
          {
            entityName: 'RE Fund LP',
            entityEin: '12-3456789',
            isPassiveActivity: true,
            ordinaryIncomeLoss: 5000,
            netRentalIncomeLoss: 0,
            otherIncomeLoss: 0,
          },
        ],
      },
    })

    expect(result.parsed.rentalProperties).toHaveLength(1)
    expect(result.parsed.rentalProperties[0].rentsReceived).toBe(24000)
    expect(result.parsed.rentalProperties[0].totalExpenses).toBe(19200)
    expect(result.parsed.rentalProperties[0].netIncomeLoss).toBe(4800)
    expect(result.parsed.totalRentalIncomeLoss).toBe(4800)
    expect(result.parsed.partnershipAndSCorpIncome).toHaveLength(1)
    expect(result.parsed.totalPartnershipIncomeLoss).toBe(5000)
    expect(result.parsed.totalScheduleEIncomeLoss).toBe(9800)
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rentalProperties: [
          {
            propertyAddress: '456 Elm St',
            rentsReceived: 12000,
            expenses: { mortgage: 6000 },
          },
        ],
      },
    })

    expect(result.parsed.rentalProperties[0].rentsReceived).toBe(12000)
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rental_properties: [
          {
            property_address: '789 Oak Ave',
            property_type: 'Duplex',
            rents_received: 30000,
            fair_rental_days: 365,
            personal_use_days: 5,
            expenses: {
              mortgage: 12000,
              other_interest: 500,
            },
          },
        ],
        partnership_and_s_corp_income: [
          {
            entity_name: 'Test LP',
            entity_ein: '99-8765432',
            is_passive_activity: true,
            ordinary_income_loss: 3000,
          },
        ],
      },
    })

    expect(result.parsed.rentalProperties[0].propertyAddress).toBe('789 Oak Ave')
    expect(result.parsed.partnershipAndSCorpIncome[0].entityName).toBe('Test LP')
  })

  it('warns when no data provided', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.warnings.some((w) => w.includes('No rental properties or partnership income'))).toBe(true)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rentalProperties: [
          {
            propertyAddress: 'Empty Property',
          },
        ],
      },
    })

    expect(result.parsed.rentalProperties[0].rentsReceived).toBe(0)
    expect(result.parsed.rentalProperties[0].totalExpenses).toBe(0)
    expect(result.parsed.rentalProperties[0].netIncomeLoss).toBe(0)
    expect(result.parsed.totalRentalIncomeLoss).toBe(0)
  })

  it('calculates totals from multiple properties', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rentalProperties: [
          { rentsReceived: 20000, expenses: { mortgage: 10000 } },
          { rentsReceived: 15000, expenses: { mortgage: 8000 } },
        ],
      },
    })

    expect(result.parsed.totalRentalIncomeLoss).toBe(17000) // (20000-10000) + (15000-8000)
  })

  it('warns on mixed-use property with >14 personal use days', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        rentalProperties: [
          {
            propertyAddress: 'Beach House',
            personalUseDays: 30,
            fairRentalDays: 200,
            rentsReceived: 25000,
          },
        ],
      },
    })

    expect(result.warnings.some((w) => w.includes('mixed-use'))).toBe(true)
  })

  it('calculates partnership totals correctly', () => {
    const result = parseScheduleE({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        partnershipAndSCorpIncome: [
          { entityName: 'LP1', ordinaryIncomeLoss: 5000, netRentalIncomeLoss: 2000, otherIncomeLoss: 1000 },
          { entityName: 'LP2', ordinaryIncomeLoss: -3000, netRentalIncomeLoss: 0, otherIncomeLoss: 500 },
        ],
      },
    })

    expect(result.parsed.totalPartnershipIncomeLoss).toBe(5500) // (5000+2000+1000) + (-3000+0+500)
  })
})
