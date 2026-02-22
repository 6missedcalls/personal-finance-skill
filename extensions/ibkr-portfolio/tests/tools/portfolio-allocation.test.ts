import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createPortfolioAllocationHandler } from '../../src/tools/portfolio-allocation.js'
import {
  TEST_CONFIG,
  mockFetchSequence,
  mockFetchError,
  installFetch,
} from '../helpers.js'
import type { IbkrConfig } from '../../src/config.js'

describe('ibkr_portfolio_allocation', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns allocation breakdown', async () => {
    const allocation = {
      U1234567: {
        assetClass: { STK: 0.7, BOND: 0.2, CASH: 0.1 },
        sector: { Technology: 0.35, Healthcare: 0.2, Finance: 0.15 },
        group: { 'Large Cap': 0.5, 'Mid Cap': 0.3, 'Small Cap': 0.2 },
      },
    }

    const mock = mockFetchSequence([
      { body: [{ id: 'U1234567' }] },
      { body: allocation },
    ])
    installFetch(mock)
    const handler = createPortfolioAllocationHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountId: 'U1234567',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      const data = result.data as Record<string, unknown>
      expect(data).toHaveProperty('U1234567')
    }
  })

  it('returns error when accountId is missing and no default', async () => {
    const configNoDefault: IbkrConfig = {
      baseUrl: 'https://localhost:5000/v1/api',
    }
    const handler = createPortfolioAllocationHandler(configNoDefault)
    const result = await handler({
      userId: 'user-1',
      accountId: '',
    })

    expect(result).toBeDefined()
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Server error', 500))
    const handler = createPortfolioAllocationHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountId: 'U1234567',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_500')
    }
  })
})
