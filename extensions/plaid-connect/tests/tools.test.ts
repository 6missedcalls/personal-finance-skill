import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PlaidApi } from 'plaid'
import type { PlaidConfig } from '../src/config.js'
import { createLinkToken } from '../src/tools/create-link-token.js'
import { exchangeToken } from '../src/tools/exchange-token.js'
import { getAccounts } from '../src/tools/get-accounts.js'
import { getTransactions } from '../src/tools/get-transactions.js'
import { ZodError } from 'zod'

// --- Mock PlaidApi ---

function createMockPlaidClient(): {
  [K in keyof PlaidApi]: ReturnType<typeof vi.fn>
} {
  return {
    linkTokenCreate: vi.fn(),
    itemPublicTokenExchange: vi.fn(),
    accountsGet: vi.fn(),
    transactionsSync: vi.fn(),
    investmentsHoldingsGet: vi.fn(),
    investmentsTransactionsGet: vi.fn(),
    liabilitiesGet: vi.fn(),
    transactionsRecurringGet: vi.fn(),
  } as unknown as { [K in keyof PlaidApi]: ReturnType<typeof vi.fn> }
}

// --- Mock PlaidConfig ---

const mockConfig: PlaidConfig = {
  clientId: 'test-client-id',
  secret: 'test-secret',
  env: 'sandbox',
  webhookUrl: 'https://example.com/webhook',
  clientName: 'Test Finance App',
  countryCodes: ['US'],
}

// --- Helper to build a Plaid-style API error ---

function createPlaidApiError(
  errorType: string,
  errorCode: string,
  errorMessage: string,
  requestId: string
): Error {
  const err = new Error(errorMessage) as Error & {
    response: { data: Record<string, string> }
  }
  err.response = {
    data: {
      error_type: errorType,
      error_code: errorCode,
      error_message: errorMessage,
      request_id: requestId,
    },
  }
  return err
}

// --- Tests ---

describe('createLinkToken', () => {
  let client: ReturnType<typeof createMockPlaidClient>

  beforeEach(() => {
    client = createMockPlaidClient()
  })

  it('should call linkTokenCreate with correct args and return mapped response', async () => {
    client.linkTokenCreate.mockResolvedValue({
      data: {
        link_token: 'link-sandbox-abc123',
        expiration: '2026-02-23T00:00:00Z',
        request_id: 'req-001',
      },
    })

    const result = await createLinkToken(
      client as unknown as PlaidApi,
      mockConfig,
      {
        userId: 'user-42',
        products: ['transactions', 'investments'],
      }
    )

    expect(client.linkTokenCreate).toHaveBeenCalledOnce()
    expect(client.linkTokenCreate).toHaveBeenCalledWith({
      user: { client_user_id: 'user-42' },
      client_name: 'Test Finance App',
      products: ['transactions', 'investments'],
      country_codes: ['US'],
      language: 'en',
      webhook: 'https://example.com/webhook',
      redirect_uri: undefined,
    })

    expect(result).toEqual({
      linkToken: 'link-sandbox-abc123',
      expiresAt: '2026-02-23T00:00:00Z',
      requestId: 'req-001',
    })
  })

  it('should pass optional redirectUri when provided', async () => {
    client.linkTokenCreate.mockResolvedValue({
      data: {
        link_token: 'link-sandbox-xyz',
        expiration: '2026-02-24T00:00:00Z',
        request_id: 'req-002',
      },
    })

    await createLinkToken(
      client as unknown as PlaidApi,
      mockConfig,
      {
        userId: 'user-99',
        products: ['transactions'],
        redirectUri: 'https://app.example.com/oauth',
      }
    )

    expect(client.linkTokenCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        redirect_uri: 'https://app.example.com/oauth',
      })
    )
  })

  it('should throw ZodError when userId is missing', async () => {
    await expect(
      createLinkToken(client as unknown as PlaidApi, mockConfig, {
        products: ['transactions'],
      })
    ).rejects.toThrow(ZodError)

    expect(client.linkTokenCreate).not.toHaveBeenCalled()
  })

  it('should throw ZodError when products array is empty', async () => {
    await expect(
      createLinkToken(client as unknown as PlaidApi, mockConfig, {
        userId: 'user-1',
        products: [],
      })
    ).rejects.toThrow(ZodError)

    expect(client.linkTokenCreate).not.toHaveBeenCalled()
  })

  it('should throw ZodError when userId is an empty string', async () => {
    await expect(
      createLinkToken(client as unknown as PlaidApi, mockConfig, {
        userId: '',
        products: ['transactions'],
      })
    ).rejects.toThrow(ZodError)
  })

  it('should throw ZodError when redirectUri is not a valid URL', async () => {
    await expect(
      createLinkToken(client as unknown as PlaidApi, mockConfig, {
        userId: 'user-1',
        products: ['transactions'],
        redirectUri: 'not-a-url',
      })
    ).rejects.toThrow(ZodError)
  })

  it('should throw formatted PlaidToolError on API failure', async () => {
    const apiError = createPlaidApiError(
      'INVALID_REQUEST',
      'INVALID_FIELD',
      'client_name is required',
      'req-err-001'
    )
    client.linkTokenCreate.mockRejectedValue(apiError)

    try {
      await createLinkToken(client as unknown as PlaidApi, mockConfig, {
        userId: 'user-1',
        products: ['transactions'],
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('INVALID_REQUEST')
      expect(err.errorCode).toBe('INVALID_FIELD')
      expect(err.errorMessage).toBe('client_name is required')
      expect(err.requestId).toBe('req-err-001')
    }
  })

  it('should handle unknown errors with fallback formatting', async () => {
    client.linkTokenCreate.mockRejectedValue(new Error('Network timeout'))

    try {
      await createLinkToken(client as unknown as PlaidApi, mockConfig, {
        userId: 'user-1',
        products: ['transactions'],
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string | null
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('UNKNOWN')
      expect(err.errorCode).toBe('UNKNOWN')
      expect(err.errorMessage).toBe('Network timeout')
      expect(err.requestId).toBeNull()
    }
  })
})

describe('exchangeToken', () => {
  let client: ReturnType<typeof createMockPlaidClient>

  beforeEach(() => {
    client = createMockPlaidClient()
  })

  it('should call itemPublicTokenExchange and return mapped response with hashed token ref', async () => {
    client.itemPublicTokenExchange.mockResolvedValue({
      data: {
        access_token: 'access-sandbox-secret-token',
        item_id: 'item-abc-123',
        request_id: 'req-010',
      },
    })

    const result = await exchangeToken(
      client as unknown as PlaidApi,
      {
        userId: 'user-55',
        publicToken: 'public-sandbox-token-xyz',
      }
    )

    expect(client.itemPublicTokenExchange).toHaveBeenCalledOnce()
    expect(client.itemPublicTokenExchange).toHaveBeenCalledWith({
      public_token: 'public-sandbox-token-xyz',
    })

    expect(result.itemId).toBe('item-abc-123')
    expect(result.requestId).toBe('req-010')
    expect(result.accessTokenRef).toMatch(/^plaid_at_[a-f0-9]{16}$/)
  })

  it('should produce a deterministic accessTokenRef for the same access token', async () => {
    const mockResponse = {
      data: {
        access_token: 'access-sandbox-deterministic',
        item_id: 'item-det',
        request_id: 'req-det',
      },
    }

    client.itemPublicTokenExchange.mockResolvedValue(mockResponse)

    const result1 = await exchangeToken(
      client as unknown as PlaidApi,
      { userId: 'user-1', publicToken: 'public-token-1' }
    )

    client.itemPublicTokenExchange.mockResolvedValue(mockResponse)

    const result2 = await exchangeToken(
      client as unknown as PlaidApi,
      { userId: 'user-1', publicToken: 'public-token-1' }
    )

    expect(result1.accessTokenRef).toBe(result2.accessTokenRef)
  })

  it('should pass optional institution and accounts without affecting Plaid call', async () => {
    client.itemPublicTokenExchange.mockResolvedValue({
      data: {
        access_token: 'access-sandbox-opt',
        item_id: 'item-opt',
        request_id: 'req-opt',
      },
    })

    await exchangeToken(
      client as unknown as PlaidApi,
      {
        userId: 'user-1',
        publicToken: 'pt-123',
        institution: { institutionId: 'ins_1', name: 'Chase' },
        accounts: [{ id: 'acct-1', name: 'Checking', type: 'depository' }],
      }
    )

    expect(client.itemPublicTokenExchange).toHaveBeenCalledWith({
      public_token: 'pt-123',
    })
  })

  it('should throw ZodError when userId is missing', async () => {
    await expect(
      exchangeToken(client as unknown as PlaidApi, {
        publicToken: 'pt-abc',
      })
    ).rejects.toThrow(ZodError)

    expect(client.itemPublicTokenExchange).not.toHaveBeenCalled()
  })

  it('should throw ZodError when publicToken is missing', async () => {
    await expect(
      exchangeToken(client as unknown as PlaidApi, {
        userId: 'user-1',
      })
    ).rejects.toThrow(ZodError)

    expect(client.itemPublicTokenExchange).not.toHaveBeenCalled()
  })

  it('should throw ZodError when publicToken is empty string', async () => {
    await expect(
      exchangeToken(client as unknown as PlaidApi, {
        userId: 'user-1',
        publicToken: '',
      })
    ).rejects.toThrow(ZodError)
  })

  it('should throw formatted PlaidToolError on API failure', async () => {
    const apiError = createPlaidApiError(
      'INVALID_INPUT',
      'INVALID_PUBLIC_TOKEN',
      'The public token is expired or invalid',
      'req-err-010'
    )
    client.itemPublicTokenExchange.mockRejectedValue(apiError)

    try {
      await exchangeToken(client as unknown as PlaidApi, {
        userId: 'user-1',
        publicToken: 'expired-token',
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('INVALID_INPUT')
      expect(err.errorCode).toBe('INVALID_PUBLIC_TOKEN')
      expect(err.errorMessage).toBe('The public token is expired or invalid')
      expect(err.requestId).toBe('req-err-010')
    }
  })
})

describe('getAccounts', () => {
  let client: ReturnType<typeof createMockPlaidClient>

  beforeEach(() => {
    client = createMockPlaidClient()
  })

  const basePlaidAccount = {
    account_id: 'acct-001',
    name: 'My Checking',
    official_name: 'PREMIUM CHECKING',
    type: 'depository',
    subtype: 'checking',
    mask: '1234',
    balances: {
      available: 1500.5,
      current: 1600.75,
      limit: null,
      iso_currency_code: 'USD',
    },
  }

  it('should call accountsGet with correct args and map the response', async () => {
    client.accountsGet.mockResolvedValue({
      data: {
        accounts: [basePlaidAccount],
        item: { item_id: 'item-acct-001' },
        request_id: 'req-020',
      },
    })

    const result = await getAccounts(
      client as unknown as PlaidApi,
      {
        userId: 'user-1',
        accessToken: 'access-sandbox-token',
      }
    )

    expect(client.accountsGet).toHaveBeenCalledOnce()
    expect(client.accountsGet).toHaveBeenCalledWith({
      access_token: 'access-sandbox-token',
      options: undefined,
    })

    expect(result).toEqual({
      accounts: [
        {
          accountId: 'acct-001',
          name: 'My Checking',
          officialName: 'PREMIUM CHECKING',
          type: 'depository',
          subtype: 'checking',
          mask: '1234',
          balances: {
            available: 1500.5,
            current: 1600.75,
            limit: null,
            isoCurrencyCode: 'USD',
          },
        },
      ],
      itemId: 'item-acct-001',
      requestId: 'req-020',
    })
  })

  it('should pass account_ids filter when accountIds is provided', async () => {
    client.accountsGet.mockResolvedValue({
      data: {
        accounts: [],
        item: { item_id: 'item-filter' },
        request_id: 'req-021',
      },
    })

    await getAccounts(
      client as unknown as PlaidApi,
      {
        userId: 'user-1',
        accessToken: 'access-token',
        accountIds: ['acct-a', 'acct-b'],
      }
    )

    expect(client.accountsGet).toHaveBeenCalledWith({
      access_token: 'access-token',
      options: { account_ids: ['acct-a', 'acct-b'] },
    })
  })

  it('should map null optional fields correctly', async () => {
    const accountWithNulls = {
      account_id: 'acct-nulls',
      name: 'Savings',
      official_name: undefined,
      type: 'depository',
      subtype: undefined,
      mask: undefined,
      balances: {
        available: undefined,
        current: 500,
        limit: undefined,
        iso_currency_code: undefined,
      },
    }

    client.accountsGet.mockResolvedValue({
      data: {
        accounts: [accountWithNulls],
        item: { item_id: 'item-null' },
        request_id: 'req-null',
      },
    })

    const result = await getAccounts(
      client as unknown as PlaidApi,
      { userId: 'user-1', accessToken: 'at-123' }
    )

    const account = result.accounts[0]
    expect(account.officialName).toBeNull()
    expect(account.subtype).toBeNull()
    expect(account.mask).toBeNull()
    expect(account.balances.available).toBeNull()
    expect(account.balances.limit).toBeNull()
    expect(account.balances.isoCurrencyCode).toBeNull()
  })

  it('should handle multiple accounts in response', async () => {
    const secondAccount = {
      ...basePlaidAccount,
      account_id: 'acct-002',
      name: 'Savings',
      type: 'depository',
      subtype: 'savings',
    }

    client.accountsGet.mockResolvedValue({
      data: {
        accounts: [basePlaidAccount, secondAccount],
        item: { item_id: 'item-multi' },
        request_id: 'req-multi',
      },
    })

    const result = await getAccounts(
      client as unknown as PlaidApi,
      { userId: 'user-1', accessToken: 'at-123' }
    )

    expect(result.accounts).toHaveLength(2)
    expect(result.accounts[0].accountId).toBe('acct-001')
    expect(result.accounts[1].accountId).toBe('acct-002')
  })

  it('should throw ZodError when accessToken is missing', async () => {
    await expect(
      getAccounts(client as unknown as PlaidApi, {
        userId: 'user-1',
      })
    ).rejects.toThrow(ZodError)

    expect(client.accountsGet).not.toHaveBeenCalled()
  })

  it('should throw ZodError when userId is missing', async () => {
    await expect(
      getAccounts(client as unknown as PlaidApi, {
        accessToken: 'at-123',
      })
    ).rejects.toThrow(ZodError)

    expect(client.accountsGet).not.toHaveBeenCalled()
  })

  it('should throw formatted PlaidToolError on API failure', async () => {
    const apiError = createPlaidApiError(
      'ITEM_ERROR',
      'ITEM_LOGIN_REQUIRED',
      'The login details of this item have changed',
      'req-err-020'
    )
    client.accountsGet.mockRejectedValue(apiError)

    try {
      await getAccounts(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'stale-token',
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('ITEM_ERROR')
      expect(err.errorCode).toBe('ITEM_LOGIN_REQUIRED')
      expect(err.errorMessage).toBe('The login details of this item have changed')
      expect(err.requestId).toBe('req-err-020')
    }
  })
})

describe('getTransactions', () => {
  let client: ReturnType<typeof createMockPlaidClient>

  beforeEach(() => {
    client = createMockPlaidClient()
  })

  const basePlaidTransaction = {
    transaction_id: 'txn-001',
    account_id: 'acct-001',
    amount: 25.99,
    iso_currency_code: 'USD',
    date: '2026-02-20',
    name: 'Coffee Shop',
    merchant_name: 'Starbucks',
    payment_channel: 'in store',
    pending: false,
    category: ['Food and Drink', 'Coffee Shop'],
    personal_finance_category: {
      primary: 'FOOD_AND_DRINK',
      detailed: 'FOOD_AND_DRINK_COFFEE',
    },
  }

  const baseRemovedTransaction = {
    transaction_id: 'txn-removed-001',
  }

  it('should call transactionsSync with correct args and map the response', async () => {
    client.transactionsSync.mockResolvedValue({
      data: {
        added: [basePlaidTransaction],
        modified: [],
        removed: [baseRemovedTransaction],
        next_cursor: 'cursor-next-abc',
        has_more: false,
        request_id: 'req-030',
      },
    })

    const result = await getTransactions(
      client as unknown as PlaidApi,
      {
        userId: 'user-1',
        accessToken: 'access-token-123',
      }
    )

    expect(client.transactionsSync).toHaveBeenCalledOnce()
    expect(client.transactionsSync).toHaveBeenCalledWith({
      access_token: 'access-token-123',
      cursor: '',
      count: undefined,
    })

    expect(result).toEqual({
      added: [
        {
          transactionId: 'txn-001',
          accountId: 'acct-001',
          amount: 25.99,
          isoCurrencyCode: 'USD',
          date: '2026-02-20',
          name: 'Coffee Shop',
          merchantName: 'Starbucks',
          paymentChannel: 'in store',
          pending: false,
          category: ['Food and Drink', 'Coffee Shop'],
          personalFinanceCategory: {
            primary: 'FOOD_AND_DRINK',
            detailed: 'FOOD_AND_DRINK_COFFEE',
          },
        },
      ],
      modified: [],
      removed: ['txn-removed-001'],
      nextCursor: 'cursor-next-abc',
      hasMore: false,
      requestId: 'req-030',
    })
  })

  it('should pass cursor and count when provided', async () => {
    client.transactionsSync.mockResolvedValue({
      data: {
        added: [],
        modified: [],
        removed: [],
        next_cursor: 'cursor-page-2',
        has_more: true,
        request_id: 'req-031',
      },
    })

    await getTransactions(
      client as unknown as PlaidApi,
      {
        userId: 'user-1',
        accessToken: 'at-cursor',
        cursor: 'cursor-page-1',
        count: 100,
      }
    )

    expect(client.transactionsSync).toHaveBeenCalledWith({
      access_token: 'at-cursor',
      cursor: 'cursor-page-1',
      count: 100,
    })
  })

  it('should map transactions without optional fields to null', async () => {
    const minimalTransaction = {
      transaction_id: 'txn-minimal',
      account_id: 'acct-001',
      amount: 10.0,
      iso_currency_code: undefined,
      date: '2026-02-21',
      name: 'Unknown Merchant',
      merchant_name: undefined,
      payment_channel: 'online',
      pending: true,
      category: undefined,
      personal_finance_category: undefined,
    }

    client.transactionsSync.mockResolvedValue({
      data: {
        added: [minimalTransaction],
        modified: [],
        removed: [],
        next_cursor: 'cursor-min',
        has_more: false,
        request_id: 'req-min',
      },
    })

    const result = await getTransactions(
      client as unknown as PlaidApi,
      { userId: 'user-1', accessToken: 'at-min' }
    )

    const txn = result.added[0]
    expect(txn.isoCurrencyCode).toBeNull()
    expect(txn.merchantName).toBeNull()
    expect(txn.category).toBeNull()
    expect(txn.personalFinanceCategory).toBeNull()
    expect(txn.pending).toBe(true)
  })

  it('should handle modified transactions correctly', async () => {
    const modifiedTransaction = {
      ...basePlaidTransaction,
      transaction_id: 'txn-mod-001',
      amount: 30.0,
      pending: false,
    }

    client.transactionsSync.mockResolvedValue({
      data: {
        added: [],
        modified: [modifiedTransaction],
        removed: [],
        next_cursor: 'cursor-mod',
        has_more: false,
        request_id: 'req-mod',
      },
    })

    const result = await getTransactions(
      client as unknown as PlaidApi,
      { userId: 'user-1', accessToken: 'at-mod' }
    )

    expect(result.modified).toHaveLength(1)
    expect(result.modified[0].transactionId).toBe('txn-mod-001')
    expect(result.modified[0].amount).toBe(30.0)
    expect(result.added).toHaveLength(0)
  })

  it('should report hasMore correctly when pagination continues', async () => {
    client.transactionsSync.mockResolvedValue({
      data: {
        added: [basePlaidTransaction],
        modified: [],
        removed: [],
        next_cursor: 'cursor-more',
        has_more: true,
        request_id: 'req-more',
      },
    })

    const result = await getTransactions(
      client as unknown as PlaidApi,
      { userId: 'user-1', accessToken: 'at-more' }
    )

    expect(result.hasMore).toBe(true)
    expect(result.nextCursor).toBe('cursor-more')
  })

  it('should throw ZodError when accessToken is missing', async () => {
    await expect(
      getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
      })
    ).rejects.toThrow(ZodError)

    expect(client.transactionsSync).not.toHaveBeenCalled()
  })

  it('should throw ZodError when userId is missing', async () => {
    await expect(
      getTransactions(client as unknown as PlaidApi, {
        accessToken: 'at-123',
      })
    ).rejects.toThrow(ZodError)

    expect(client.transactionsSync).not.toHaveBeenCalled()
  })

  it('should throw ZodError when count exceeds maximum of 500', async () => {
    await expect(
      getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'at-123',
        count: 501,
      })
    ).rejects.toThrow(ZodError)

    expect(client.transactionsSync).not.toHaveBeenCalled()
  })

  it('should throw ZodError when count is less than 1', async () => {
    await expect(
      getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'at-123',
        count: 0,
      })
    ).rejects.toThrow(ZodError)

    expect(client.transactionsSync).not.toHaveBeenCalled()
  })

  it('should throw ZodError when count is not an integer', async () => {
    await expect(
      getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'at-123',
        count: 10.5,
      })
    ).rejects.toThrow(ZodError)

    expect(client.transactionsSync).not.toHaveBeenCalled()
  })

  it('should throw formatted PlaidToolError on API failure', async () => {
    const apiError = createPlaidApiError(
      'ITEM_ERROR',
      'PRODUCT_NOT_READY',
      'Transactions data is not yet available',
      'req-err-030'
    )
    client.transactionsSync.mockRejectedValue(apiError)

    try {
      await getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'at-not-ready',
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('ITEM_ERROR')
      expect(err.errorCode).toBe('PRODUCT_NOT_READY')
      expect(err.errorMessage).toBe('Transactions data is not yet available')
      expect(err.requestId).toBe('req-err-030')
    }
  })

  it('should handle unknown error without response.data gracefully', async () => {
    client.transactionsSync.mockRejectedValue(new Error('ECONNREFUSED'))

    try {
      await getTransactions(client as unknown as PlaidApi, {
        userId: 'user-1',
        accessToken: 'at-connrefused',
      })
      expect.fail('Should have thrown')
    } catch (thrown) {
      const err = thrown as {
        error: boolean
        errorType: string
        errorCode: string
        errorMessage: string
        requestId: string | null
      }
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('UNKNOWN')
      expect(err.errorCode).toBe('UNKNOWN')
      expect(err.errorMessage).toBe('ECONNREFUSED')
      expect(err.requestId).toBeNull()
    }
  })
})
