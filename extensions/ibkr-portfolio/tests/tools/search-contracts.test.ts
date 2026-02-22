import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createSearchContractsHandler } from '../../src/tools/search-contracts.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_search_contracts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns search results', async () => {
    const results = [
      {
        conid: 265598,
        companyHeader: 'APPLE INC',
        companyName: 'APPLE INC',
        symbol: 'AAPL',
        description: 'NASDAQ',
        restricted: '',
        fop: '',
        opt: '1',
        war: '',
        sections: [
          {
            secType: 'STK',
            months: '',
            symbol: 'AAPL',
            exchange: 'NASDAQ',
            legSecType: '',
          },
        ],
      },
    ]

    installFetch(mockFetch(results))
    const handler = createSearchContractsHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1', symbol: 'AAPL' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].symbol).toBe('AAPL')
      expect(result.data[0].conid).toBe(265598)
    }
  })

  it('passes query params including secType', async () => {
    const mock = mockFetch([])
    installFetch(mock)
    const handler = createSearchContractsHandler(TEST_CONFIG)
    await handler({
      userId: 'user-1',
      symbol: 'MSFT',
      name: 'Microsoft',
      secType: 'STK',
    })

    const calledUrl = mock.mock.calls[0][0] as string
    expect(calledUrl).toContain('symbol=MSFT')
    expect(calledUrl).toContain('name=Microsoft')
    expect(calledUrl).toContain('secType=STK')
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Rate limited', 429))
    const handler = createSearchContractsHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1', symbol: 'AAPL' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_429')
    }
  })
})
