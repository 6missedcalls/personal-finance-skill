import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createListAccountsHandler } from '../../src/tools/list-accounts.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_list_accounts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns accounts list on success', async () => {
    const mockResponse = {
      accounts: ['U1234567', 'U7654321'],
      aliases: { U1234567: 'Main', U7654321: 'IRA' },
      selectedAccount: 'U1234567',
    }

    installFetch(mockFetch(mockResponse))
    const handler = createListAccountsHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.accounts).toEqual(['U1234567', 'U7654321'])
      expect(result.data.aliases.U1234567).toBe('Main')
      expect(result.data.selectedAccount).toBe('U1234567')
    }
  })

  it('calls GET /iserver/accounts', async () => {
    const mock = mockFetch({ accounts: [], aliases: {}, selectedAccount: '' })
    installFetch(mock)
    const handler = createListAccountsHandler(TEST_CONFIG)
    await handler({ userId: 'user-1' })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/iserver/accounts',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('returns error on failure', async () => {
    installFetch(mockFetchError('Not authenticated', 401))
    const handler = createListAccountsHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_401')
    }
  })
})
