// ── Alpaca Trading Extension Types ──

export type AlpacaEnv = "paper" | "live"

export interface AlpacaConfig {
  readonly apiKey: string
  readonly apiSecret: string
  readonly env: AlpacaEnv
  readonly baseUrl: string
  readonly dataBaseUrl: string
  readonly maxOrderQty?: number
  readonly maxOrderNotional?: number
}

// ── Account ──

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
  readonly initial_margin: string
  readonly maintenance_margin: string
  readonly daytrade_count: number
  readonly pattern_day_trader: boolean
  readonly trading_blocked: boolean
  readonly transfers_blocked: boolean
  readonly account_blocked: boolean
  readonly created_at: string
  readonly sma: string
  readonly daytrading_buying_power: string
  readonly regt_buying_power: string
}

// ── Position ──

export interface AlpacaPosition {
  readonly asset_id: string
  readonly symbol: string
  readonly exchange: string
  readonly asset_class: string
  readonly avg_entry_price: string
  readonly qty: string
  readonly qty_available: string
  readonly side: "long" | "short"
  readonly market_value: string
  readonly cost_basis: string
  readonly unrealized_pl: string
  readonly unrealized_plpc: string
  readonly unrealized_intraday_pl: string
  readonly unrealized_intraday_plpc: string
  readonly current_price: string
  readonly lastday_price: string
  readonly change_today: string
}

// ── Order ──

export type OrderSide = "buy" | "sell"
export type OrderType = "market" | "limit" | "stop" | "stop_limit" | "trailing_stop"
export type TimeInForce = "day" | "gtc" | "opg" | "cls" | "ioc" | "fok"
export type OrderStatus =
  | "new"
  | "partially_filled"
  | "filled"
  | "done_for_day"
  | "canceled"
  | "expired"
  | "replaced"
  | "pending_cancel"
  | "pending_replace"
  | "pending_new"
  | "accepted"
  | "accepted_for_bidding"
  | "stopped"
  | "rejected"
  | "suspended"
  | "calculated"

export interface AlpacaOrder {
  readonly id: string
  readonly client_order_id: string
  readonly created_at: string
  readonly updated_at: string
  readonly submitted_at: string | null
  readonly filled_at: string | null
  readonly expired_at: string | null
  readonly canceled_at: string | null
  readonly failed_at: string | null
  readonly replaced_at: string | null
  readonly replaced_by: string | null
  readonly replaces: string | null
  readonly asset_id: string
  readonly symbol: string
  readonly asset_class: string
  readonly notional: string | null
  readonly qty: string | null
  readonly filled_qty: string
  readonly filled_avg_price: string | null
  readonly order_class: string
  readonly order_type: string
  readonly type: string
  readonly side: OrderSide
  readonly time_in_force: string
  readonly limit_price: string | null
  readonly stop_price: string | null
  readonly status: OrderStatus
  readonly extended_hours: boolean
  readonly legs: ReadonlyArray<AlpacaOrder> | null
  readonly trail_percent: string | null
  readonly trail_price: string | null
  readonly hwm: string | null
}

// ── Order Creation ──

export interface CreateOrderInput {
  readonly symbol: string
  readonly side: OrderSide
  readonly type: OrderType
  readonly time_in_force: TimeInForce
  readonly qty?: string
  readonly notional?: string
  readonly limit_price?: string
  readonly stop_price?: string
  readonly trail_price?: string
  readonly trail_percent?: string
  readonly extended_hours?: boolean
  readonly client_order_id?: string
  readonly order_class?: "simple" | "bracket" | "oco" | "oto"
  readonly take_profit?: { readonly limit_price: string }
  readonly stop_loss?: {
    readonly stop_price: string
    readonly limit_price?: string
  }
}

// ── Asset ──

export interface AlpacaAsset {
  readonly id: string
  readonly class: string
  readonly exchange: string
  readonly symbol: string
  readonly name: string
  readonly status: string
  readonly tradable: boolean
  readonly marginable: boolean
  readonly shortable: boolean
  readonly easy_to_borrow: boolean
  readonly fractionable: boolean
}

// ── Portfolio History ──

export interface AlpacaPortfolioHistory {
  readonly timestamp: ReadonlyArray<number>
  readonly equity: ReadonlyArray<number>
  readonly profit_loss: ReadonlyArray<number>
  readonly profit_loss_pct: ReadonlyArray<number>
  readonly base_value: number
  readonly timeframe: string
}

// ── Market Data ──

export interface AlpacaBar {
  readonly t: string
  readonly o: number
  readonly h: number
  readonly l: number
  readonly c: number
  readonly v: number
  readonly n: number
  readonly vw: number
}

export interface AlpacaQuote {
  readonly t: string
  readonly ax: string
  readonly ap: number
  readonly as: number
  readonly bx: string
  readonly bp: number
  readonly bs: number
  readonly c: ReadonlyArray<string>
  readonly z: string
}

export interface AlpacaSnapshot {
  readonly latestTrade: {
    readonly t: string
    readonly p: number
    readonly s: number
  }
  readonly latestQuote: AlpacaQuote
  readonly minuteBar: AlpacaBar
  readonly dailyBar: AlpacaBar
  readonly prevDailyBar: AlpacaBar
}

// ── Clock ──

export interface AlpacaClock {
  readonly timestamp: string
  readonly is_open: boolean
  readonly next_open: string
  readonly next_close: string
}

// ── Tool Context ──

export interface ToolContext {
  readonly config: AlpacaConfig
}

// ── API Error ──

export interface AlpacaApiError {
  readonly code: number
  readonly message: string
}

// ── Tool Result Envelope ──

export interface ToolResult<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: string
}
