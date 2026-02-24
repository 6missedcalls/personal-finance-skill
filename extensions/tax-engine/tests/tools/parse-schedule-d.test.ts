import { describe, it, expect } from 'vitest'
import { parseScheduleD } from '../../src/tools/parse-schedule-d.js'

describe('parseScheduleD', () => {
  it('parses valid data correctly', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: 2000,
        shortTermFromScheduleK1: 500,
        shortTermCapitalLossCarryover: 0,
        longTermFromForm8949: 10000,
        longTermFromScheduleK1: 3000,
        longTermCapitalGainDistributions: 500,
        longTermCapitalLossCarryover: 0,
      },
    })

    expect(result.parsed.netShortTermGainLoss).toBe(2500) // 2000 + 500 + 0
    expect(result.parsed.netLongTermGainLoss).toBe(13500) // 10000 + 3000 + 500 + 0
    expect(result.parsed.netGainLoss).toBe(16000)
    expect(result.parsed.taxComputationMethod).toBe('schedule_d_worksheet')
    expect(result.warnings).toHaveLength(0)
  })

  it('handles camelCase field names', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: 5000,
        longTermFromForm8949: 8000,
      },
    })

    expect(result.parsed.shortTermFromForm8949).toBe(5000)
    expect(result.parsed.longTermFromForm8949).toBe(8000)
  })

  it('handles snake_case field names', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        short_term_from_form_8949: 3000,
        long_term_from_form_8949: 7000,
        long_term_capital_gain_distributions: 1000,
      },
    })

    expect(result.parsed.shortTermFromForm8949).toBe(3000)
    expect(result.parsed.longTermFromForm8949).toBe(7000)
    expect(result.parsed.longTermCapitalGainDistributions).toBe(1000)
  })

  it('defaults numeric fields to 0', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {},
    })

    expect(result.parsed.shortTermFromForm8949).toBe(0)
    expect(result.parsed.longTermFromForm8949).toBe(0)
    expect(result.parsed.netShortTermGainLoss).toBe(0)
    expect(result.parsed.netLongTermGainLoss).toBe(0)
    expect(result.parsed.netGainLoss).toBe(0)
  })

  it('calculates derived fields correctly', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: 1000,
        shortTermFromScheduleK1: 2000,
        shortTermCapitalLossCarryover: -500,
        longTermFromForm8949: 3000,
        longTermFromScheduleK1: 1000,
        longTermCapitalGainDistributions: 200,
        longTermCapitalLossCarryover: -700,
      },
    })

    expect(result.parsed.netShortTermGainLoss).toBe(2500)
    expect(result.parsed.netLongTermGainLoss).toBe(3500)
    expect(result.parsed.netGainLoss).toBe(6000)
  })

  it('warns on capital loss exceeding $3,000 limit', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: -5000,
        longTermFromForm8949: 0,
      },
    })

    expect(result.parsed.netGainLoss).toBe(-5000)
    expect(result.warnings.some((w) => w.includes('$3,000'))).toBe(true)
  })

  it('warns on capital loss carryover presence', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermCapitalLossCarryover: -2000,
        longTermFromForm8949: 5000,
      },
    })

    expect(result.warnings.some((w) => w.includes('carryover'))).toBe(true)
  })

  it('determines regular method for net loss', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: -2000,
        longTermFromForm8949: -1000,
      },
    })

    expect(result.parsed.taxComputationMethod).toBe('regular')
  })

  it('determines schedule_d_worksheet for long-term gains', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: -500,
        longTermFromForm8949: 5000,
      },
    })

    expect(result.parsed.taxComputationMethod).toBe('schedule_d_worksheet')
  })

  it('determines regular method for only short-term gains', () => {
    const result = parseScheduleD({
      userId: 'user-1',
      taxYear: 2025,
      rawData: {
        shortTermFromForm8949: 5000,
        longTermFromForm8949: -2000,
      },
    })

    expect(result.parsed.taxComputationMethod).toBe('regular')
  })
})
