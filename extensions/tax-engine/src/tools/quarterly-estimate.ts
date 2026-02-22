/**
 * Tool: tax_quarterly_estimate
 * Calculates quarterly estimated tax payments with safe harbor analysis.
 */

import type { QuarterlyEstimateInput, QuarterlyEstimateResult } from '../types.js'
import { calculateQuarterlyEstimates } from '../calculators/quarterly-estimate.js'

export function quarterlyEstimate(input: QuarterlyEstimateInput): QuarterlyEstimateResult {
  const currentDate = new Date().toISOString().split('T')[0]

  return calculateQuarterlyEstimates(
    input.taxYear,
    input.filingStatus,
    input.projectedIncome,
    input.priorYearTax,
    input.quarterlyPaymentsMade,
    currentDate,
  )
}
