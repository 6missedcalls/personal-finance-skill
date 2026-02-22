import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createAuthStatusHandler } from '../../src/tools/auth-status.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_auth_status', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns authenticated status on success', async () => {
    const mockResponse = {
      authenticated: true,
      connected: true,
      competing: false,
      message: '',
      MAC: 'abc123',
      serverInfo: { serverName: 'v1', serverVersion: '1.0' },
    }

    installFetch(mockFetch(mockResponse))
    const handler = createAuthStatusHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.authenticated).toBe(true)
      expect(result.data.connected).toBe(true)
      expect(result.data.competing).toBe(false)
      expect(result.dataFreshness).toBeDefined()
    }
  })

  it('returns unauthenticated status', async () => {
    const mockResponse = {
      authenticated: false,
      connected: true,
      competing: false,
      message: 'Session expired',
      MAC: '',
      serverInfo: { serverName: 'v1', serverVersion: '1.0' },
    }

    installFetch(mockFetch(mockResponse))
    const handler = createAuthStatusHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.authenticated).toBe(false)
      expect(result.data.message).toBe('Session expired')
    }
  })

  it('calls POST /iserver/auth/status', async () => {
    const mock = mockFetch({ authenticated: true, connected: true, competing: false, message: '', MAC: '', serverInfo: {} })
    installFetch(mock)
    const handler = createAuthStatusHandler(TEST_CONFIG)
    await handler({ userId: 'user-1' })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/iserver/auth/status',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Gateway unreachable', 503))
    const handler = createAuthStatusHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Gateway unreachable')
      expect(result.code).toBe('IBKR_503')
    }
  })

  it('handles network errors', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('ECONNREFUSED'))
    )
    const handler = createAuthStatusHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('ECONNREFUSED')
      expect(result.code).toBe('IBKR_UNKNOWN')
    }
  })
})
