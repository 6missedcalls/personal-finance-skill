import { generateId } from "../storage/store.js"
import type { Account, Position } from "../types.js"

// --- IBKR Response Shapes ---

export interface IbkrAccount {
  readonly accountId: string
  readonly accountTitle: string
  readonly accountType: string
  readonly currency: string
  readonly netliquidation?: number
  readonly availablefunds?: number
}

export interface IbkrPosition {
  readonly acctId: string
  readonly conid: number
  readonly contractDesc: string
  readonly ticker?: string
  readonly position: number
  readonly mktPrice: number
  readonly mktValue: number
  readonly avgCost: number
  readonly avgPrice: number
  readonly unrealizedPnl: number
  readonly currency: string
  readonly assetClass: string
}

export interface IbkrLedgerBalance {
  readonly currency: string
  readonly cashbalance: number
  readonly netliquidationvalue: number
  readonly stockmarketvalue: number
  readonly bondmarketvalue?: number
}

// --- Normalizers ---

export function normalizeIbkrAccount(ibkrAccount: IbkrAccount): Account {
  return {
    id: generateId("acct"),
    source: "ibkr",
    sourceAccountId: ibkrAccount.accountId,
    institutionId: "ibkr",
    institutionName: "Interactive Brokers",
    name: ibkrAccount.accountTitle || `IBKR ${ibkrAccount.accountId}`,
    officialName: null,
    type: mapIbkrAccountType(ibkrAccount.accountType),
    subtype: mapIbkrAccountSubtype(ibkrAccount.accountType),
    balances: {
      current: ibkrAccount.netliquidation ?? 0,
      available: ibkrAccount.availablefunds ?? null,
      limit: null,
      lastUpdated: new Date().toISOString(),
    },
    currency: ibkrAccount.currency,
    lastSyncedAt: new Date().toISOString(),
    isActive: true,
    metadata: { accountType: ibkrAccount.accountType },
  }
}

export function normalizeIbkrPosition(
  ibkrPos: IbkrPosition,
  accountId: string
): Position {
  const quantity = ibkrPos.position
  const costBasis = ibkrPos.avgCost * Math.abs(quantity)
  const marketValue = ibkrPos.mktValue
  const unrealizedGainLoss = ibkrPos.unrealizedPnl
  const unrealizedGainLossPercent =
    costBasis > 0 ? unrealizedGainLoss / costBasis : null

  return {
    id: generateId("pos"),
    accountId,
    source: "ibkr",
    symbol: ibkrPos.ticker ?? ibkrPos.contractDesc,
    name: ibkrPos.contractDesc,
    holdingType: mapIbkrAssetClass(ibkrPos.assetClass),
    quantity,
    costBasis,
    costBasisPerShare: ibkrPos.avgPrice,
    currentPrice: ibkrPos.mktPrice,
    marketValue,
    unrealizedGainLoss,
    unrealizedGainLossPercent,
    currency: ibkrPos.currency,
    lastUpdated: new Date().toISOString(),
    taxLots: [],
    metadata: { conid: ibkrPos.conid },
  }
}

function mapIbkrAccountType(accountType: string): Account["type"] {
  const typeMap: Record<string, Account["type"]> = {
    INDIVIDUAL: "brokerage",
    IRA: "retirement",
    ROTH: "retirement",
    "401K": "retirement",
    TRUST: "investment",
    CORP: "investment",
  }
  return typeMap[accountType.toUpperCase()] ?? "brokerage"
}

function mapIbkrAccountSubtype(accountType: string): Account["subtype"] {
  const subtypeMap: Record<string, Account["subtype"]> = {
    INDIVIDUAL: "brokerage_taxable",
    IRA: "ira_traditional",
    ROTH: "ira_roth",
    "401K": "401k",
    MARGIN: "brokerage_margin",
  }
  return subtypeMap[accountType.toUpperCase()] ?? "other"
}

function mapIbkrAssetClass(assetClass: string): Position["holdingType"] {
  const classMap: Record<string, Position["holdingType"]> = {
    STK: "equity",
    OPT: "option",
    FUT: "other",
    BOND: "bond",
    CASH: "cash",
    CRYPTO: "crypto",
    FUND: "mutual_fund",
  }
  return classMap[assetClass] ?? "other"
}
