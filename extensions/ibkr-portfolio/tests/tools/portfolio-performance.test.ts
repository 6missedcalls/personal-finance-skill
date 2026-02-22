import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPortfolioPerformanceHandler } from '../../src/tools/portfolio-performance.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_portfolio_performance', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns performance data', async () => {
    const performance = {
      dates: ['2024-01', '2024-02', '2024-03'],
      freq: 'M',
      baseCurrency: 'USD',
      nav: { U1234567: [100000, 102000, 105000] },
      cps: { U1234567: [0, 0.02, 0.05] },
      tpps: { U1234567: [0, 0.02, 0.029] },
    }

    installFetch(mockFetch(performance))
    const handler = createPortfolioPerformanceHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountIds: ['U1234567'],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.baseCurrency).toBe('USD')
      expect(result.data.dates).toHaveLength(3)
      expect(result.data.nav).toHaveProperty('U1234567')
    }
  })

  it('sends POST with accountIds and default freq', async () => {
    const mock = mockFetch({ dates: [], freq: 'M', baseCurrency: 'USD', nav: {}, cps: {}, tpps: {} })
    installFetch(mock)
    const handler = createPortfolioPerformanceHandler(TEST_CONFIG)
    await handler({
      userId: 'user-1',
      accountIds: ['U1234567', 'U7654321'],
    })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/pa/performance',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          acctIds: ['U1234567', 'U7654321'],
          freq: 'M',
        }),
      })
    )
  })

  it('uses custom frequency', async () => {
    const mock = mockFetch({ dates: [], freq: 'D', baseCurrency: 'USD', nav: {}, cps: {}, tpps: {} })
    installFetch(mock)
    const handler = createPortfolioPerformanceHandler(TEST_CONFIG)
    await handler({
      userId: 'user-1',
      accountIds: ['U1234567'],
      freq: 'D',
    })

    expect(mock).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({ acctIds: ['U1234567'], freq: 'D' }),
      })
    )
  })

  it('returns error when no accountIds provided', async () => {
    const handler = createPortfolioPerformanceHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountIds: [],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_MISSING_ACCOUNT')
    }
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Timeout', 504))
    const handler = createPortfolioPerformanceHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountIds: ['U1234567'],
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_504')
    }
  })
})
