/**
 * Tool: tax_estimate_liability
 * Calculates estimated federal/state tax liability.
 * Delegates all math to deterministic calculators.
 */

import type { EstimateLiabilityInput, TaxLiabilityResult } from '../types.js'
import { estimateTaxLiability } from '../calculators/tax-liability.js'

export function estimateLiability(input: EstimateLiabilityInput): TaxLiabilityResult {
  return estimateTaxLiability(
    input.taxYear,
    input.filingStatus,
    input.income,
    input.state
  )
}
