// IBKR Client Portal API response types

export interface AuthStatus {
  readonly authenticated: boolean
  readonly connected: boolean
  readonly competing: boolean
  readonly message: string
  readonly MAC: string
  readonly serverInfo: {
    readonly serverName: string
    readonly serverVersion: string
  }
}

export interface TickleResponse {
  readonly session: string
  readonly ssoExpires: number
  readonly collission: boolean
  readonly userId: number
  readonly iserver: {
    readonly authStatus: {
      readonly authenticated: boolean
      readonly competing: boolean
      readonly connected: boolean
    }
  }
}

export interface IbkrAccount {
  readonly id: string
  readonly accountId: string
  readonly accountTitle: string
  readonly accountAlias: string
  readonly currency: string
  readonly type: string
  readonly tradingType: string
  readonly covestor: boolean
  readonly parent: {
    readonly mmc: ReadonlyArray<string>
    readonly accountId: string
    readonly isMParent: boolean
    readonly isMChild: boolean
    readonly isMultiplex: boolean
  }
  readonly faclient: boolean
}

export interface AccountsResponse {
  readonly accounts: ReadonlyArray<string>
  readonly aliases: Readonly<Record<string, string>>
  readonly selectedAccount: string
}

export interface Position {
  readonly acctId: string
  readonly conid: number
  readonly contractDesc: string
  readonly position: number
  readonly mktPrice: number
  readonly mktValue: number
  readonly avgCost: number
  readonly avgPrice: number
  readonly realizedPnl: number
  readonly unrealizedPnl: number
  readonly currency: string
  readonly assetClass: string
  readonly ticker: string
  readonly listingExchange: string
  readonly sector: string
  readonly group: string
  readonly countryCode: string
  readonly expiry: string
  readonly putOrCall: string
  readonly strike: number
  readonly multiplier: number
  readonly hasOptions: boolean
}

export interface AllocationBreakdown {
  readonly assetClass: Readonly<Record<string, number>>
  readonly sector: Readonly<Record<string, number>>
  readonly group: Readonly<Record<string, number>>
}

export interface AllocationResponse {
  readonly [accountId: string]: AllocationBreakdown
}

export interface PerformanceRequest {
  readonly acctIds: ReadonlyArray<string>
  readonly freq: string
}

export interface PerformanceSeries {
  readonly dates: ReadonlyArray<string>
  readonly freq: string
  readonly baseCurrency: string
  readonly nav: Readonly<Record<string, ReadonlyArray<number>>>
  readonly cps: Readonly<Record<string, ReadonlyArray<number>>>
  readonly tpps: Readonly<Record<string, ReadonlyArray<number>>>
}

export interface ContractSearchResult {
  readonly conid: number
  readonly companyHeader: string
  readonly companyName: string
  readonly symbol: string
  readonly description: string
  readonly restricted: string
  readonly fop: string
  readonly opt: string
  readonly war: string
  readonly sections: ReadonlyArray<{
    readonly secType: string
    readonly months: string
    readonly symbol: string
    readonly exchange: string
    readonly legSecType: string
  }>
}

export interface MarketSnapshot {
  readonly conid: number
  readonly conidEx: string
  readonly _updated: number
  readonly [fieldId: string]: string | number | undefined
}

// Common market data field IDs
export const MARKET_DATA_FIELDS = {
  LAST_PRICE: '31',
  BID: '84',
  ASK: '86',
  VOLUME: '87',
  HIGH: '70',
  LOW: '71',
  OPEN: '7295',
  CLOSE: '7296',
  CHANGE: '82',
  CHANGE_PCT: '83',
  MARKET_CAP: '7289',
  PE_RATIO: '7290',
  EPS: '7291',
  DIVIDEND_YIELD: '7293',
  SYMBOL: '55',
  COMPANY_NAME: '7051',
  AVAILABILITY: '6509',
} as const

export interface Order {
  readonly acct: string
  readonly conid: number
  readonly conidex: string
  readonly orderId: number
  readonly cashCcy: string
  readonly sizeAndFills: string
  readonly orderDesc: string
  readonly description1: string
  readonly ticker: string
  readonly secType: string
  readonly listingExchange: string
  readonly remainingQuantity: number
  readonly filledQuantity: number
  readonly totalSize: number
  readonly avgPrice: number
  readonly lastFillPrice: number
  readonly side: string
  readonly orderType: string
  readonly timeInForce: string
  readonly status: string
  readonly bgColor: string
  readonly fgColor: string
}

export interface OrdersResponse {
  readonly orders: ReadonlyArray<Order>
  readonly snapshot: boolean
}

// Tool input types

export interface AuthStatusInput {
  readonly userId: string
}

export interface TickleInput {
  readonly userId: string
}

export interface ListAccountsInput {
  readonly userId: string
}

export interface GetPositionsInput {
  readonly userId: string
  readonly accountId: string
  readonly pageId?: number
}

export interface PortfolioAllocationInput {
  readonly userId: string
  readonly accountId: string
}

export interface PortfolioPerformanceInput {
  readonly userId: string
  readonly accountIds: ReadonlyArray<string>
  readonly freq?: string
}

export interface SearchContractsInput {
  readonly userId: string
  readonly symbol: string
  readonly name?: string
  readonly secType?: string
}

export interface MarketSnapshotInput {
  readonly userId: string
  readonly conids: ReadonlyArray<number>
  readonly fields?: ReadonlyArray<string>
}

export interface GetOrdersInput {
  readonly userId: string
  readonly accountId?: string
}

// Tool output envelope

export interface ToolSuccess<T> {
  readonly success: true
  readonly data: T
  readonly dataFreshness: string
}

export interface ToolError {
  readonly success: false
  readonly error: string
  readonly code: string
}

export type ToolResult<T> = ToolSuccess<T> | ToolError

// IBKR API error shape

export interface IbkrApiError {
  readonly error: string
  readonly statusCode: number
}
