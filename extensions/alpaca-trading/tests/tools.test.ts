import { describe, it, expect, vi, beforeEach } from "vitest"
import { buildConfig } from "../src/config.ts"
import { getAccountTool } from "../src/tools/get-account.ts"
import { listPositionsTool } from "../src/tools/list-positions.ts"
import { getPositionTool } from "../src/tools/get-position.ts"
import { listOrdersTool } from "../src/tools/list-orders.ts"
import { createOrderTool } from "../src/tools/create-order.ts"
import { cancelOrderTool } from "../src/tools/cancel-order.ts"
import { portfolioHistoryTool } from "../src/tools/portfolio-history.ts"
import { getAssetsTool } from "../src/tools/get-assets.ts"
import { marketDataTool } from "../src/tools/market-data.ts"
import { clockTool } from "../src/tools/clock.ts"
import type { AlpacaConfig } from "../src/types.ts"

// ── Shared mock config ──────────────────────────────────────────────────────

const mockConfig: AlpacaConfig = {
  apiKey: "test-api-key",
  apiSecret: "test-api-secret",
  env: "paper",
  baseUrl: "https://paper-api.alpaca.markets",
  dataBaseUrl: "https://data.alpaca.markets",
  maxOrderQty: 1000,
  maxOrderNotional: 50000,
}

const mockContext = { config: mockConfig }

// ── Fetch mock helpers ──────────────────────────────────────────────────────

function mockFetchSuccess(body: unknown, status = 200): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status,
      json: () => Promise.resolve(body),
      text: () => Promise.resolve(JSON.stringify(body)),
    })
  )
}

function mockFetchError(status: number, message: string): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      text: () => Promise.resolve(JSON.stringify({ message })),
      json: () => Promise.resolve({ message }),
    })
  )
}

function mockFetch204(): void {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      status: 204,
      text: () => Promise.resolve(""),
      json: () => Promise.resolve({}),
    })
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function getLastFetchCall(): { url: string; options: RequestInit } {
  const mockFn = vi.mocked(fetch)
  const [url, options] = mockFn.mock.calls[mockFn.mock.calls.length - 1] as [
    string,
    RequestInit
  ]
  return { url, options }
}

function expectAlpacaHeaders(options: RequestInit): void {
  const headers = options.headers as Record<string, string>
  expect(headers["APCA-API-KEY-ID"]).toBe("test-api-key")
  expect(headers["APCA-API-SECRET-KEY"]).toBe("test-api-secret")
}

// ── config.ts ───────────────────────────────────────────────────────────────

describe("buildConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs()
  })

  it("throws when API key env var is missing", () => {
    vi.stubEnv("TEST_ALPACA_SECRET", "my-secret")
    expect(() =>
      buildConfig({
        apiKeyEnv: "TEST_ALPACA_KEY",
        apiSecretEnv: "TEST_ALPACA_SECRET",
        env: "paper",
      })
    ).toThrow("Alpaca API key not found in env var: TEST_ALPACA_KEY")
  })

  it("throws when API secret env var is missing", () => {
    vi.stubEnv("TEST_ALPACA_KEY", "my-key")
    expect(() =>
      buildConfig({
        apiKeyEnv: "TEST_ALPACA_KEY",
        apiSecretEnv: "TEST_ALPACA_SECRET",
        env: "paper",
      })
    ).toThrow("Alpaca API secret not found in env var: TEST_ALPACA_SECRET")
  })

  it("returns correct config for paper environment", () => {
    vi.stubEnv("TEST_ALPACA_KEY", "paper-key")
    vi.stubEnv("TEST_ALPACA_SECRET", "paper-secret")

    const config = buildConfig({
      apiKeyEnv: "TEST_ALPACA_KEY",
      apiSecretEnv: "TEST_ALPACA_SECRET",
      env: "paper",
      maxOrderQty: 100,
      maxOrderNotional: 10000,
    })

    expect(config).toEqual({
      apiKey: "paper-key",
      apiSecret: "paper-secret",
      env: "paper",
      baseUrl: "https://paper-api.alpaca.markets",
      dataBaseUrl: "https://data.alpaca.markets",
      maxOrderQty: 100,
      maxOrderNotional: 10000,
    })
  })

  it("returns correct config for live environment", () => {
    vi.stubEnv("TEST_ALPACA_KEY", "live-key")
    vi.stubEnv("TEST_ALPACA_SECRET", "live-secret")

    const config = buildConfig({
      apiKeyEnv: "TEST_ALPACA_KEY",
      apiSecretEnv: "TEST_ALPACA_SECRET",
      env: "live",
    })

    expect(config.baseUrl).toBe("https://api.alpaca.markets")
    expect(config.env).toBe("live")
    expect(config.maxOrderQty).toBeUndefined()
    expect(config.maxOrderNotional).toBeUndefined()
  })
})

// ── get-account ──────────────────────────────────────────────────────────────

describe("getAccountTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockAccount = {
    id: "acct-001",
    account_number: "PA1234567",
    status: "ACTIVE",
    currency: "USD",
    cash: "10000.00",
    portfolio_value: "50000.00",
    buying_power: "20000.00",
    equity: "50000.00",
    last_equity: "49500.00",
    long_market_value: "40000.00",
    short_market_value: "0.00",
    initial_margin: "0.00",
    maintenance_margin: "0.00",
    daytrade_count: 0,
    pattern_day_trader: false,
    trading_blocked: false,
    transfers_blocked: false,
    account_blocked: false,
    created_at: "2024-01-01T00:00:00Z",
    sma: "0.00",
    daytrading_buying_power: "0.00",
    regt_buying_power: "20000.00",
  }

  it("returns account data on success", async () => {
    mockFetchSuccess(mockAccount)

    const result = await getAccountTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockAccount)
  })

  it("returns error on API failure", async () => {
    mockFetchError(401, "Unauthorized")

    const result = await getAccountTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve account")
    expect(result.error).toContain("401")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockAccount)

    await getAccountTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toBe("https://paper-api.alpaca.markets/v2/account")
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })

  it("spreads env override onto config without changing baseUrl", async () => {
    // The tool spreads { ...context.config, env: input.env } which updates the
    // env field but does NOT re-derive baseUrl, so the original baseUrl is kept.
    mockFetchSuccess(mockAccount)

    await getAccountTool.handler({ env: "live" }, mockContext)

    const { url } = getLastFetchCall()
    // baseUrl comes from the original mockConfig (paper), env field is overridden
    expect(url).toBe("https://paper-api.alpaca.markets/v2/account")
  })
})

// ── list-positions ───────────────────────────────────────────────────────────

describe("listPositionsTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockPositions = [
    {
      asset_id: "asset-001",
      symbol: "AAPL",
      exchange: "NASDAQ",
      asset_class: "us_equity",
      avg_entry_price: "150.00",
      qty: "10",
      qty_available: "10",
      side: "long" as const,
      market_value: "1600.00",
      cost_basis: "1500.00",
      unrealized_pl: "100.00",
      unrealized_plpc: "0.0667",
      unrealized_intraday_pl: "50.00",
      unrealized_intraday_plpc: "0.0323",
      current_price: "160.00",
      lastday_price: "155.00",
      change_today: "0.0323",
    },
  ]

  it("returns positions list on success", async () => {
    mockFetchSuccess(mockPositions)

    const result = await listPositionsTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockPositions)
  })

  it("returns error on API failure", async () => {
    mockFetchError(403, "Forbidden")

    const result = await listPositionsTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve positions")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockPositions)

    await listPositionsTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toBe("https://paper-api.alpaca.markets/v2/positions")
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })
})

// ── get-position ─────────────────────────────────────────────────────────────

describe("getPositionTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockPosition = {
    asset_id: "asset-001",
    symbol: "AAPL",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "150.00",
    qty: "10",
    qty_available: "10",
    side: "long" as const,
    market_value: "1600.00",
    cost_basis: "1500.00",
    unrealized_pl: "100.00",
    unrealized_plpc: "0.0667",
    unrealized_intraday_pl: "50.00",
    unrealized_intraday_plpc: "0.0323",
    current_price: "160.00",
    lastday_price: "155.00",
    change_today: "0.0323",
  }

  it("returns position data on success", async () => {
    mockFetchSuccess(mockPosition)

    const result = await getPositionTool.handler(
      { symbol_or_asset_id: "AAPL" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockPosition)
  })

  it("returns error on API failure", async () => {
    mockFetchError(404, "Position not found")

    const result = await getPositionTool.handler(
      { symbol_or_asset_id: "FAKE" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain('Failed to retrieve position for "FAKE"')
  })

  it("calls the correct URL with symbol encoded in path", async () => {
    mockFetchSuccess(mockPosition)

    await getPositionTool.handler(
      { symbol_or_asset_id: "AAPL" },
      mockContext
    )

    const { url, options } = getLastFetchCall()
    expect(url).toBe(
      "https://paper-api.alpaca.markets/v2/positions/AAPL"
    )
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })

  it("URL-encodes the symbol in the path", async () => {
    mockFetchSuccess(mockPosition)

    await getPositionTool.handler(
      { symbol_or_asset_id: "some/special asset" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("some%2Fspecial%20asset")
  })
})

// ── list-orders ──────────────────────────────────────────────────────────────

describe("listOrdersTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockOrders = [
    {
      id: "order-001",
      client_order_id: "client-001",
      created_at: "2024-01-01T10:00:00Z",
      updated_at: "2024-01-01T10:00:00Z",
      submitted_at: "2024-01-01T10:00:00Z",
      filled_at: null,
      expired_at: null,
      canceled_at: null,
      failed_at: null,
      replaced_at: null,
      replaced_by: null,
      replaces: null,
      asset_id: "asset-001",
      symbol: "AAPL",
      asset_class: "us_equity",
      notional: null,
      qty: "10",
      filled_qty: "0",
      filled_avg_price: null,
      order_class: "simple",
      order_type: "market",
      type: "market",
      side: "buy" as const,
      time_in_force: "day",
      limit_price: null,
      stop_price: null,
      status: "new" as const,
      extended_hours: false,
      legs: null,
      trail_percent: null,
      trail_price: null,
      hwm: null,
    },
  ]

  it("returns orders list on success", async () => {
    mockFetchSuccess(mockOrders)

    const result = await listOrdersTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockOrders)
  })

  it("returns error on API failure", async () => {
    mockFetchError(422, "Invalid parameters")

    const result = await listOrdersTool.handler({ status: "open" }, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to list orders")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockOrders)

    await listOrdersTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toContain("https://paper-api.alpaca.markets/v2/orders")
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })

  it("passes query parameters to the URL", async () => {
    mockFetchSuccess(mockOrders)

    await listOrdersTool.handler(
      { status: "closed", limit: 50, direction: "asc", symbols: "AAPL,TSLA" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("status=closed")
    expect(url).toContain("limit=50")
    expect(url).toContain("direction=asc")
    expect(url).toContain("symbols=AAPL%2CTSLA")
  })
})

// ── create-order ─────────────────────────────────────────────────────────────

describe("createOrderTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const baseOrderInput = {
    symbol: "AAPL",
    side: "buy" as const,
    type: "market" as const,
    time_in_force: "day" as const,
    qty: "10",
    confirm: true,
  }

  const mockOrder = {
    id: "order-002",
    client_order_id: "client-002",
    created_at: "2024-01-01T10:00:00Z",
    updated_at: "2024-01-01T10:00:00Z",
    submitted_at: "2024-01-01T10:00:00Z",
    filled_at: null,
    expired_at: null,
    canceled_at: null,
    failed_at: null,
    replaced_at: null,
    replaced_by: null,
    replaces: null,
    asset_id: "asset-001",
    symbol: "AAPL",
    asset_class: "us_equity",
    notional: null,
    qty: "10",
    filled_qty: "0",
    filled_avg_price: null,
    order_class: "simple",
    order_type: "market",
    type: "market",
    side: "buy" as const,
    time_in_force: "day",
    limit_price: null,
    stop_price: null,
    status: "new" as const,
    extended_hours: false,
    legs: null,
    trail_percent: null,
    trail_price: null,
    hwm: null,
  }

  it("rejects when confirm is not true", async () => {
    const result = await createOrderTool.handler(
      { ...baseOrderInput, confirm: false },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Order must be explicitly confirmed")
  })

  it("rejects when neither qty nor notional is provided", async () => {
    const { qty: _qty, ...inputWithoutQty } = baseOrderInput
    const result = await createOrderTool.handler(
      { ...inputWithoutQty },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Either qty or notional must be provided")
  })

  it("rejects when both qty and notional are provided", async () => {
    const result = await createOrderTool.handler(
      { ...baseOrderInput, notional: "1000" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("qty and notional are mutually exclusive")
  })

  it("rejects when qty exceeds maxOrderQty", async () => {
    const result = await createOrderTool.handler(
      { ...baseOrderInput, qty: "9999" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("exceeds configured maximum of 1000")
  })

  it("rejects when notional exceeds maxOrderNotional", async () => {
    const { qty: _qty, ...inputWithoutQty } = baseOrderInput
    const result = await createOrderTool.handler(
      { ...inputWithoutQty, notional: "999999" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("exceeds configured maximum of 50000")
  })

  it("submits order successfully when all checks pass", async () => {
    mockFetchSuccess(mockOrder)

    const result = await createOrderTool.handler(baseOrderInput, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockOrder)
  })

  it("calls the correct URL and method for order creation", async () => {
    mockFetchSuccess(mockOrder)

    await createOrderTool.handler(baseOrderInput, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toBe("https://paper-api.alpaca.markets/v2/orders")
    expect(options.method).toBe("POST")
    expectAlpacaHeaders(options)
  })

  it("does not include the confirm field in the request body", async () => {
    mockFetchSuccess(mockOrder)

    await createOrderTool.handler(baseOrderInput, mockContext)

    const { options } = getLastFetchCall()
    const body = JSON.parse(options.body as string)
    expect(body).not.toHaveProperty("confirm")
    expect(body.symbol).toBe("AAPL")
    expect(body.qty).toBe("10")
  })

  it("returns error on API failure", async () => {
    mockFetchError(422, "Insufficient buying power")

    const result = await createOrderTool.handler(baseOrderInput, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to create order")
  })

  it("allows order when qty is exactly at maxOrderQty boundary", async () => {
    mockFetchSuccess(mockOrder)

    const result = await createOrderTool.handler(
      { ...baseOrderInput, qty: "1000" },
      mockContext
    )

    expect(result.success).toBe(true)
  })

  it("allows order when notional is exactly at maxOrderNotional boundary", async () => {
    mockFetchSuccess(mockOrder)
    const { qty: _qty, ...inputWithoutQty } = baseOrderInput

    const result = await createOrderTool.handler(
      { ...inputWithoutQty, notional: "50000" },
      mockContext
    )

    expect(result.success).toBe(true)
  })
})

// ── cancel-order ─────────────────────────────────────────────────────────────

describe("cancelOrderTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns canceled result on success (204)", async () => {
    mockFetch204()

    const result = await cancelOrderTool.handler(
      { order_id: "order-abc-123" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual({ canceled: true, order_id: "order-abc-123" })
  })

  it("returns error on API failure", async () => {
    mockFetchError(404, "Order not found")

    const result = await cancelOrderTool.handler(
      { order_id: "bad-order-id" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to cancel order bad-order-id")
  })

  it("calls the correct URL with DELETE method", async () => {
    mockFetch204()

    await cancelOrderTool.handler(
      { order_id: "order-abc-123" },
      mockContext
    )

    const { url, options } = getLastFetchCall()
    expect(url).toBe(
      "https://paper-api.alpaca.markets/v2/orders/order-abc-123"
    )
    expect(options.method).toBe("DELETE")
    expectAlpacaHeaders(options)
  })
})

// ── portfolio-history ─────────────────────────────────────────────────────────

describe("portfolioHistoryTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockHistory = {
    timestamp: [1700000000, 1700086400],
    equity: [50000.0, 51000.0],
    profit_loss: [0.0, 1000.0],
    profit_loss_pct: [0.0, 0.02],
    base_value: 50000.0,
    timeframe: "1D",
  }

  it("returns portfolio history on success", async () => {
    mockFetchSuccess(mockHistory)

    const result = await portfolioHistoryTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockHistory)
  })

  it("returns error on API failure", async () => {
    mockFetchError(500, "Internal server error")

    const result = await portfolioHistoryTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve portfolio history")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockHistory)

    await portfolioHistoryTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toContain(
      "https://paper-api.alpaca.markets/v2/account/portfolio/history"
    )
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })

  it("passes period and timeframe query parameters", async () => {
    mockFetchSuccess(mockHistory)

    await portfolioHistoryTool.handler(
      { period: "3M", timeframe: "1D", extended_hours: true },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("period=3M")
    expect(url).toContain("timeframe=1D")
    expect(url).toContain("extended_hours=true")
  })
})

// ── get-assets ────────────────────────────────────────────────────────────────

describe("getAssetsTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockAssets = [
    {
      id: "asset-001",
      class: "us_equity",
      exchange: "NASDAQ",
      symbol: "AAPL",
      name: "Apple Inc.",
      status: "active",
      tradable: true,
      marginable: true,
      shortable: true,
      easy_to_borrow: true,
      fractionable: true,
    },
  ]

  it("returns assets list on success", async () => {
    mockFetchSuccess(mockAssets)

    const result = await getAssetsTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockAssets)
  })

  it("returns error on API failure", async () => {
    mockFetchError(503, "Service unavailable")

    const result = await getAssetsTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve assets")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockAssets)

    await getAssetsTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toContain("https://paper-api.alpaca.markets/v2/assets")
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })

  it("passes status, asset_class, and exchange query parameters", async () => {
    mockFetchSuccess(mockAssets)

    await getAssetsTool.handler(
      { status: "active", asset_class: "us_equity", exchange: "NYSE" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("status=active")
    expect(url).toContain("asset_class=us_equity")
    expect(url).toContain("exchange=NYSE")
  })
})

// ── market-data ───────────────────────────────────────────────────────────────

describe("marketDataTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockBarsResponse = {
    bars: {
      AAPL: [
        { t: "2024-01-01T00:00:00Z", o: 150, h: 155, l: 149, c: 153, v: 1000000, n: 5000, vw: 152.5 },
      ],
    },
    next_page_token: null,
  }

  const mockQuotesResponse = {
    quotes: {
      AAPL: {
        t: "2024-01-01T15:00:00Z",
        ax: "C",
        ap: 153.5,
        as: 200,
        bx: "C",
        bp: 153.4,
        bs: 300,
        c: ["R"],
        z: "C",
      },
    },
  }

  const mockSnapshotResponse = {
    AAPL: {
      latestTrade: { t: "2024-01-01T15:00:00Z", p: 153.5, s: 100 },
      latestQuote: {
        t: "2024-01-01T15:00:00Z",
        ax: "C",
        ap: 153.5,
        as: 200,
        bx: "C",
        bp: 153.4,
        bs: 300,
        c: ["R"],
        z: "C",
      },
      minuteBar: { t: "2024-01-01T15:00:00Z", o: 153, h: 154, l: 152, c: 153.5, v: 5000, n: 200, vw: 153.2 },
      dailyBar: { t: "2024-01-01T00:00:00Z", o: 150, h: 155, l: 149, c: 153.5, v: 1000000, n: 50000, vw: 152.5 },
      prevDailyBar: { t: "2023-12-29T00:00:00Z", o: 148, h: 151, l: 147, c: 150, v: 900000, n: 45000, vw: 149.5 },
    },
  }

  it("fetches bars using /v2/stocks/bars endpoint", async () => {
    mockFetchSuccess(mockBarsResponse)

    const result = await marketDataTool.handler(
      { symbols: "AAPL", type: "bars", timeframe: "1Day", limit: 5 },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockBarsResponse)

    const { url } = getLastFetchCall()
    expect(url).toContain("https://data.alpaca.markets/v2/stocks/bars")
    expect(url).toContain("symbols=AAPL")
    expect(url).toContain("timeframe=1Day")
    expect(url).toContain("limit=5")
  })

  it("fetches quotes using /v2/stocks/quotes/latest endpoint", async () => {
    mockFetchSuccess(mockQuotesResponse)

    const result = await marketDataTool.handler(
      { symbols: "AAPL", type: "quotes" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockQuotesResponse)

    const { url } = getLastFetchCall()
    expect(url).toContain(
      "https://data.alpaca.markets/v2/stocks/quotes/latest"
    )
    expect(url).toContain("symbols=AAPL")
  })

  it("fetches snapshot using /v2/stocks/snapshots endpoint", async () => {
    mockFetchSuccess(mockSnapshotResponse)

    const result = await marketDataTool.handler(
      { symbols: "AAPL", type: "snapshot" },
      mockContext
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockSnapshotResponse)

    const { url } = getLastFetchCall()
    expect(url).toContain(
      "https://data.alpaca.markets/v2/stocks/snapshots"
    )
    expect(url).toContain("symbols=AAPL")
  })

  it("uses data.alpaca.markets base URL (not trading URL)", async () => {
    mockFetchSuccess(mockBarsResponse)

    await marketDataTool.handler(
      { symbols: "AAPL", type: "bars" },
      mockContext
    )

    const { url, options } = getLastFetchCall()
    expect(url).toContain("data.alpaca.markets")
    expect(url).not.toContain("paper-api.alpaca.markets")
    // data requests do not send Content-Type header
    const headers = options.headers as Record<string, string>
    expect(headers["APCA-API-KEY-ID"]).toBe("test-api-key")
    expect(headers["APCA-API-SECRET-KEY"]).toBe("test-api-secret")
  })

  it("returns error on API failure", async () => {
    mockFetchError(429, "Rate limit exceeded")

    const result = await marketDataTool.handler(
      { symbols: "AAPL", type: "bars" },
      mockContext
    )

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve market data")
  })

  it("supports multiple symbols for quotes", async () => {
    mockFetchSuccess(mockQuotesResponse)

    await marketDataTool.handler(
      { symbols: "AAPL,MSFT,GOOG", type: "quotes" },
      mockContext
    )

    const { url } = getLastFetchCall()
    expect(url).toContain("symbols=AAPL%2CMSFT%2CGOOG")
  })
})

// ── clock ─────────────────────────────────────────────────────────────────────

describe("clockTool", () => {
  beforeEach(() => {
    vi.unstubAllGlobals()
  })

  const mockClock = {
    timestamp: "2024-01-02T15:30:00Z",
    is_open: true,
    next_open: "2024-01-03T14:30:00Z",
    next_close: "2024-01-02T21:00:00Z",
  }

  it("returns clock data on success", async () => {
    mockFetchSuccess(mockClock)

    const result = await clockTool.handler({}, mockContext)

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockClock)
  })

  it("returns error on API failure", async () => {
    mockFetchError(503, "Service unavailable")

    const result = await clockTool.handler({}, mockContext)

    expect(result.success).toBe(false)
    expect(result.error).toContain("Failed to retrieve market clock")
  })

  it("calls the correct URL with correct headers", async () => {
    mockFetchSuccess(mockClock)

    await clockTool.handler({}, mockContext)

    const { url, options } = getLastFetchCall()
    expect(url).toBe("https://paper-api.alpaca.markets/v2/clock")
    expect(options.method).toBe("GET")
    expectAlpacaHeaders(options)
  })
})
