import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createMarketSnapshotHandler } from '../../src/tools/market-snapshot.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_market_snapshot', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns market data snapshots', async () => {
    const snapshots = [
      {
        conid: 265598,
        conidEx: '265598',
        '31': '193.18',
        '84': '193.06',
        '86': '193.14',
        '6509': 'RpB',
        _updated: 1702334859712,
      },
    ]

    installFetch(mockFetch(snapshots))
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1', conids: [265598] })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toHaveLength(1)
      expect(result.data[0].conid).toBe(265598)
      expect(result.data[0]['31']).toBe('193.18')
    }
  })

  it('passes conids and default fields as query params', async () => {
    const mock = mockFetch([])
    installFetch(mock)
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    await handler({ userId: 'user-1', conids: [265598, 756733] })

    const calledUrl = mock.mock.calls[0][0] as string
    expect(calledUrl).toContain('conids=265598%2C756733')
    expect(calledUrl).toContain('fields=')
  })

  it('accepts custom fields', async () => {
    const mock = mockFetch([])
    installFetch(mock)
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    await handler({
      userId: 'user-1',
      conids: [265598],
      fields: ['31', '84', '86'],
    })

    const calledUrl = mock.mock.calls[0][0] as string
    expect(calledUrl).toContain('fields=31%2C84%2C86')
  })

  it('returns error when no conids provided', async () => {
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1', conids: [] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_MISSING_CONIDS')
    }
  })

  it('returns error when too many conids', async () => {
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    const conids = Array.from({ length: 101 }, (_, i) => i + 1)
    const result = await handler({ userId: 'user-1', conids })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_TOO_MANY_CONIDS')
    }
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Service unavailable', 503))
    const handler = createMarketSnapshotHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1', conids: [265598] })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_503')
    }
  })
})
