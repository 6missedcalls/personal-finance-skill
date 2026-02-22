/**
 * Tool: tax_find_tlh_candidates
 * Identifies tax-loss harvesting opportunities from current positions.
 * Uses deterministic math for loss calculations.
 */

import type { FindTlhInput, GainType, Position, TlhCandidate } from '../types.js'
import { applyRate, subtract } from '../calculators/decimal.js'
import { wouldTriggerWashSale } from '../calculators/wash-sale.js'

const LONG_TERM_THRESHOLD_MS = 365 * 24 * 60 * 60 * 1000

function getHoldingPeriod(dateAcquired: string): GainType {
  const acquired = new Date(dateAcquired).getTime()
  const now = Date.now()
  return now - acquired > LONG_TERM_THRESHOLD_MS ? 'long_term' : 'short_term'
}

export function findTlhCandidates(input: FindTlhInput): ReadonlyArray<TlhCandidate> {
  const {
    positions,
    minLoss = 100,
    marginalRate = 0.32,
    recentSales = [],
  } = input

  const candidates: TlhCandidate[] = []
  const today = new Date().toISOString().split('T')[0]

  for (const position of positions) {
    for (const lot of position.lots) {
      const marketValue = applyRate(position.currentPrice, lot.quantity)
      const unrealizedLoss = subtract(marketValue, lot.adjustedBasis)

      // Only consider lots with unrealized losses exceeding threshold
      if (unrealizedLoss >= 0 || Math.abs(unrealizedLoss) < minLoss) {
        continue
      }

      const holdingPeriod = getHoldingPeriod(lot.dateAcquired)
      const effectiveRate = holdingPeriod === 'short_term' ? marginalRate : marginalRate * 0.5
      const estimatedTaxSavings = applyRate(Math.abs(unrealizedLoss), effectiveRate)

      // Check wash sale risk from recent purchase activity
      const recentPurchases = recentSales.map((s) => ({
        symbol: s.symbol,
        purchaseDate: s.saleDate,
      }))

      const washSaleRisk = wouldTriggerWashSale(
        lot.symbol,
        today,
        recentPurchases
      )

      const rationale = buildRationale(lot.symbol, unrealizedLoss, holdingPeriod, washSaleRisk)

      candidates.push({
        symbol: lot.symbol,
        lotId: lot.id,
        currentPrice: position.currentPrice,
        costBasis: lot.adjustedBasis,
        unrealizedLoss,
        quantity: lot.quantity,
        holdingPeriod,
        washSaleRisk,
        estimatedTaxSavings,
        rationale,
      })
    }
  }

  // Sort by largest potential tax savings
  return [...candidates].sort(
    (a, b) => b.estimatedTaxSavings - a.estimatedTaxSavings
  )
}

function buildRationale(
  symbol: string,
  loss: number,
  holdingPeriod: GainType,
  washSaleRisk: boolean
): string {
  const parts = [
    `${symbol} has $${Math.abs(loss).toFixed(2)} unrealized ${holdingPeriod.replace('_', '-')} loss.`,
  ]

  if (holdingPeriod === 'short_term') {
    parts.push('Short-term loss offsets ordinary income at marginal rate.')
  } else {
    parts.push('Long-term loss offsets capital gains at preferential rates.')
  }

  if (washSaleRisk) {
    parts.push('CAUTION: Recent activity in this security — wash sale risk exists.')
  }

  return parts.join(' ')
}
