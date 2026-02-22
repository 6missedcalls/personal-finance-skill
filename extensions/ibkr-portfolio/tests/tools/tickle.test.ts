import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createTickleHandler } from '../../src/tools/tickle.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_tickle', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns session info on success', async () => {
    const mockResponse = {
      session: 'abc123',
      ssoExpires: 1702334859712,
      collission: false,
      userId: 12345,
      iserver: {
        authStatus: {
          authenticated: true,
          competing: false,
          connected: true,
        },
      },
    }

    installFetch(mockFetch(mockResponse))
    const handler = createTickleHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.session).toBe('abc123')
      expect(result.data.iserver.authStatus.authenticated).toBe(true)
      expect(result.dataFreshness).toBeDefined()
    }
  })

  it('calls POST /tickle', async () => {
    const mock = mockFetch({ session: 's1', ssoExpires: 0, collission: false, userId: 1, iserver: { authStatus: { authenticated: true, competing: false, connected: true } } })
    installFetch(mock)
    const handler = createTickleHandler(TEST_CONFIG)
    await handler({ userId: 'user-1' })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/tickle',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('returns error on failure', async () => {
    installFetch(mockFetchError('Session lost', 401))
    const handler = createTickleHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Session lost')
      expect(result.code).toBe('IBKR_401')
    }
  })
})
