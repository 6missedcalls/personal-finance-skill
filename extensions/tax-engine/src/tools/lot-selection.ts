/**
 * Tool: tax_lot_selection
 * Compares FIFO/LIFO/specific lot strategies for a proposed sale.
 */

import type { LotSelectionInput, LotSelectionResult } from '../types.js'
import { compareLotStrategies } from '../calculators/capital-gains.js'

export function lotSelection(input: LotSelectionInput): ReadonlyArray<LotSelectionResult> {
  const {
    lots,
    quantityToSell,
    currentPrice,
    methods = ['fifo', 'lifo'],
    marginalRate = 0.32,
    longTermRate = 0.15,
  } = input

  const today = new Date().toISOString().split('T')[0]

  return compareLotStrategies(
    lots,
    quantityToSell,
    currentPrice,
    today,
    marginalRate,
    longTermRate,
    methods
  )
}
