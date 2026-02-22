import { generateId } from "../storage/store.js"
import type { Account, Position } from "../types.js"

// --- Alpaca Response Shapes ---

export interface AlpacaAccount {
  readonly id: string
  readonly account_number: string
  readonly status: string
  readonly currency: string
  readonly cash: string
  readonly portfolio_value: string
  readonly buying_power: string
  readonly equity: string
  readonly last_equity: string
  readonly long_market_value: string
  readonly short_market_value: string
  readonly daytrade_count: number
  readonly pattern_day_trader: boolean
}

export interface AlpacaPosition {
  readonly asset_id: string
  readonly symbol: string
  readonly exchange: string
  readonly asset_class: string
  readonly qty: string
  readonly avg_entry_price: string
  readonly side: string
  readonly market_value: string
  readonly cost_basis: string
  readonly unrealized_pl: string
  readonly unrealized_plpc: string
  readonly current_price: string
  readonly lastday_price: string
  readonly change_today: string
}

// --- Normalizers ---

export function normalizeAlpacaAccount(
  alpacaAccount: AlpacaAccount,
  env: "paper" | "live"
): Account {
  return {
    id: generateId("acct"),
    source: "alpaca",
    sourceAccountId: alpacaAccount.id,
    institutionId: "alpaca",
    institutionName: `Alpaca (${env})`,
    name: `Alpaca ${env === "paper" ? "Paper" : "Live"} - ${alpacaAccount.account_number}`,
    officialName: null,
    type: "brokerage",
    subtype: "brokerage_taxable",
    balances: {
      current: parseFloat(alpacaAccount.portfolio_value),
      available: parseFloat(alpacaAccount.buying_power),
      limit: null,
      lastUpdated: new Date().toISOString(),
    },
    currency: alpacaAccount.currency,
    lastSyncedAt: new Date().toISOString(),
    isActive: alpacaAccount.status === "ACTIVE",
    metadata: {
      env,
      cash: parseFloat(alpacaAccount.cash),
      equity: parseFloat(alpacaAccount.equity),
      daytradeCount: alpacaAccount.daytrade_count,
      patternDayTrader: alpacaAccount.pattern_day_trader,
    },
  }
}

export function normalizeAlpacaPosition(
  alpacaPos: AlpacaPosition,
  accountId: string
): Position {
  const quantity = parseFloat(alpacaPos.qty)
  const costBasis = parseFloat(alpacaPos.cost_basis)
  const marketValue = parseFloat(alpacaPos.market_value)
  const unrealizedGainLoss = parseFloat(alpacaPos.unrealized_pl)
  const unrealizedGainLossPercent = parseFloat(alpacaPos.unrealized_plpc)

  return {
    id: generateId("pos"),
    accountId,
    source: "alpaca",
    symbol: alpacaPos.symbol,
    name: alpacaPos.symbol,
    holdingType: mapAlpacaAssetClass(alpacaPos.asset_class),
    quantity,
    costBasis,
    costBasisPerShare: quantity > 0 ? parseFloat(alpacaPos.avg_entry_price) : null,
    currentPrice: parseFloat(alpacaPos.current_price),
    marketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    currency: "USD",
    lastUpdated: new Date().toISOString(),
    taxLots: [],
    metadata: {
      assetId: alpacaPos.asset_id,
      exchange: alpacaPos.exchange,
      side: alpacaPos.side,
      lastDayPrice: parseFloat(alpacaPos.lastday_price),
      changeToday: parseFloat(alpacaPos.change_today),
    },
  }
}

function mapAlpacaAssetClass(assetClass: string): Position["holdingType"] {
  const classMap: Record<string, Position["holdingType"]> = {
    us_equity: "equity",
    crypto: "crypto",
  }
  return classMap[assetClass] ?? "other"
}
