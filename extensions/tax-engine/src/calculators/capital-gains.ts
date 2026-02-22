/**
 * Capital gains calculation with FIFO/LIFO/Specific-ID lot selection.
 * All math is deterministic — no LLM reasoning for numbers.
 */

import type {
  GainType,
  LotSelectionMethod,
  LotSelectionResult,
  SelectedLot,
  TaxLot,
} from '../types.js'
import { add, applyRate, clampMin, subtract, sumAll } from './decimal.js'

const LONG_TERM_THRESHOLD_MS = 365 * 24 * 60 * 60 * 1000 // ~1 year

export function classifyHoldingPeriod(
  dateAcquired: string,
  dateSold: string
): GainType {
  const acquired = new Date(dateAcquired).getTime()
  const sold = new Date(dateSold).getTime()
  const held = sold - acquired
  return held > LONG_TERM_THRESHOLD_MS ? 'long_term' : 'short_term'
}

function sortLotsForMethod(
  lots: ReadonlyArray<TaxLot>,
  method: LotSelectionMethod,
  specificIds?: ReadonlyArray<string>
): ReadonlyArray<TaxLot> {
  if (method === 'specific_id' && specificIds) {
    const idSet = new Set(specificIds)
    return lots.filter((lot) => idSet.has(lot.id))
  }

  const sorted = [...lots]
  if (method === 'fifo') {
    sorted.sort(
      (a, b) =>
        new Date(a.dateAcquired).getTime() - new Date(b.dateAcquired).getTime()
    )
  } else {
    // lifo
    sorted.sort(
      (a, b) =>
        new Date(b.dateAcquired).getTime() - new Date(a.dateAcquired).getTime()
    )
  }
  return sorted
}

export function selectLots(
  lots: ReadonlyArray<TaxLot>,
  quantityToSell: number,
  currentPrice: number,
  method: LotSelectionMethod,
  dateSold: string,
  specificLotIds?: ReadonlyArray<string>
): LotSelectionResult {
  const orderedLots = sortLotsForMethod(lots, method, specificLotIds)
  let remaining = quantityToSell
  const selectedLots: SelectedLot[] = []

  for (const lot of orderedLots) {
    if (remaining <= 0) break

    const qty = Math.min(remaining, lot.quantity)
    const totalBasis = applyRate(lot.adjustedBasis, qty / lot.quantity)
    const proceeds = applyRate(currentPrice, qty)
    const gainLoss = subtract(proceeds, totalBasis)
    const gainType = classifyHoldingPeriod(lot.dateAcquired, dateSold)

    selectedLots.push({
      lotId: lot.id,
      dateAcquired: lot.dateAcquired,
      quantitySold: qty,
      costBasisPerShare: lot.adjustedBasis / lot.quantity,
      totalBasis,
      proceeds,
      gainLoss,
      gainType,
    })

    remaining = subtract(remaining, qty)
  }

  const totalProceeds = sumAll(selectedLots.map((l) => l.proceeds))
  const totalBasis = sumAll(selectedLots.map((l) => l.totalBasis))
  const totalGainLoss = subtract(totalProceeds, totalBasis)

  const shortTermGainLoss = sumAll(
    selectedLots
      .filter((l) => l.gainType === 'short_term')
      .map((l) => l.gainLoss)
  )
  const longTermGainLoss = sumAll(
    selectedLots
      .filter((l) => l.gainType === 'long_term')
      .map((l) => l.gainLoss)
  )

  return {
    method,
    selectedLots,
    totalProceeds,
    totalBasis,
    totalGainLoss,
    shortTermGainLoss,
    longTermGainLoss,
    estimatedTaxImpact: 0, // Caller should compute with actual rates
  }
}

export function compareLotStrategies(
  lots: ReadonlyArray<TaxLot>,
  quantityToSell: number,
  currentPrice: number,
  dateSold: string,
  marginalRate: number,
  longTermRate: number,
  methods: ReadonlyArray<LotSelectionMethod> = ['fifo', 'lifo']
): ReadonlyArray<LotSelectionResult> {
  return methods.map((method) => {
    const result = selectLots(lots, quantityToSell, currentPrice, method, dateSold)
    const stTax = applyRate(clampMin(result.shortTermGainLoss, 0), marginalRate)
    const ltTax = applyRate(clampMin(result.longTermGainLoss, 0), longTermRate)
    const stSavings = applyRate(
      Math.abs(Math.min(result.shortTermGainLoss, 0)),
      marginalRate
    )
    const ltSavings = applyRate(
      Math.abs(Math.min(result.longTermGainLoss, 0)),
      longTermRate
    )
    const estimatedTaxImpact = subtract(add(stTax, ltTax), add(stSavings, ltSavings))

    return {
      ...result,
      estimatedTaxImpact,
    }
  })
}
