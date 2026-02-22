/**
 * Tool: tax_check_wash_sales
 * Validates wash sale rule compliance across sales and purchases.
 */

import type { CheckWashSalesInput, WashSaleCheckResult } from '../types.js'
import { checkWashSales } from '../calculators/wash-sale.js'

export function checkWashSalesHandler(input: CheckWashSalesInput): WashSaleCheckResult {
  return checkWashSales(input.sales, input.purchases)
}
