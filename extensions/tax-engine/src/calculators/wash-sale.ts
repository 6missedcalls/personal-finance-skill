/**
 * Wash sale detection per IRC Section 1091.
 * 61-day window: 30 days before + sale date + 30 days after.
 */

import type { WashSaleCheckResult, WashSaleViolation } from '../types.js'
import { add, roundToCents } from './decimal.js'

const WASH_WINDOW_DAYS = 30
const MS_PER_DAY = 24 * 60 * 60 * 1000

interface SaleRecord {
  readonly lotId: string
  readonly symbol: string
  readonly saleDate: string
  readonly loss: number
}

interface PurchaseRecord {
  readonly lotId: string
  readonly symbol: string
  readonly purchaseDate: string
  readonly quantity: number
  readonly costBasis: number
}

function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA).getTime()
  const b = new Date(dateB).getTime()
  return Math.round(Math.abs(b - a) / MS_PER_DAY)
}

function isWithinWashWindow(saleDate: string, purchaseDate: string): boolean {
  const sale = new Date(saleDate).getTime()
  const purchase = new Date(purchaseDate).getTime()
  const windowStart = sale - WASH_WINDOW_DAYS * MS_PER_DAY
  const windowEnd = sale + WASH_WINDOW_DAYS * MS_PER_DAY
  return purchase >= windowStart && purchase <= windowEnd
}

export function checkWashSales(
  sales: ReadonlyArray<SaleRecord>,
  purchases: ReadonlyArray<PurchaseRecord>
): WashSaleCheckResult {
  const violations: WashSaleViolation[] = []
  const usedPurchases = new Set<string>()

  // Only check sales that realized a loss
  const lossSales = sales.filter((s) => s.loss < 0)

  for (const sale of lossSales) {
    // Find replacement purchases of substantially identical securities
    const replacements = purchases.filter(
      (p) =>
        p.symbol === sale.symbol &&
        !usedPurchases.has(p.lotId) &&
        p.lotId !== sale.lotId &&
        isWithinWashWindow(sale.saleDate, p.purchaseDate)
    )

    if (replacements.length > 0) {
      // Match with earliest replacement purchase
      const sorted = [...replacements].sort(
        (a, b) =>
          new Date(a.purchaseDate).getTime() -
          new Date(b.purchaseDate).getTime()
      )
      const replacement = sorted[0]
      usedPurchases.add(replacement.lotId)

      const disallowedLoss = roundToCents(Math.abs(sale.loss))

      violations.push({
        soldLotId: sale.lotId,
        replacementLotId: replacement.lotId,
        symbol: sale.symbol,
        saleDate: sale.saleDate,
        replacementDate: replacement.purchaseDate,
        disallowedLoss,
        basisAdjustment: disallowedLoss, // Disallowed loss added to replacement basis
      })
    }
  }

  const totalDisallowedLoss = violations.reduce(
    (sum, v) => add(sum, v.disallowedLoss),
    0
  )

  return {
    violations,
    totalDisallowedLoss,
    compliant: violations.length === 0,
  }
}

/**
 * Check if selling a specific symbol on a given date would trigger a wash sale
 * based on recent purchase activity.
 */
export function wouldTriggerWashSale(
  symbol: string,
  proposedSaleDate: string,
  recentPurchases: ReadonlyArray<{
    readonly symbol: string
    readonly purchaseDate: string
  }>
): boolean {
  return recentPurchases.some(
    (p) =>
      p.symbol === symbol &&
      isWithinWashWindow(proposedSaleDate, p.purchaseDate)
  )
}

/**
 * Calculate the earliest safe date to repurchase a sold security
 * without triggering a wash sale.
 */
export function earliestSafeRepurchaseDate(saleDate: string): string {
  const sale = new Date(saleDate)
  const safe = new Date(sale.getTime() + (WASH_WINDOW_DAYS + 1) * MS_PER_DAY)
  return safe.toISOString().split('T')[0]
}
