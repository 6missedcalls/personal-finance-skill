import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { createGetOrdersHandler } from '../../src/tools/get-orders.js'
import {
  TEST_CONFIG,
  mockFetch,
  mockFetchError,
  installFetch,
} from '../helpers.js'

describe('ibkr_get_orders', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('returns all orders when no accountId filter', async () => {
    const ordersResponse = {
      orders: [
        {
          acct: 'U1234567',
          conid: 265598,
          conidex: '265598',
          orderId: 1001,
          cashCcy: 'USD',
          sizeAndFills: '10/10',
          orderDesc: 'Buy 10 AAPL',
          description1: 'AAPL',
          ticker: 'AAPL',
          secType: 'STK',
          listingExchange: 'NASDAQ',
          remainingQuantity: 0,
          filledQuantity: 10,
          totalSize: 10,
          avgPrice: 193.18,
          lastFillPrice: 193.18,
          side: 'BUY',
          orderType: 'LMT',
          timeInForce: 'DAY',
          status: 'Filled',
          bgColor: '#000000',
          fgColor: '#00FF00',
        },
      ],
      snapshot: true,
    }

    installFetch(mockFetch(ordersResponse))
    const handler = createGetOrdersHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orders).toHaveLength(1)
      expect(result.data.orders[0].ticker).toBe('AAPL')
      expect(result.data.orders[0].status).toBe('Filled')
    }
  })

  it('filters orders by accountId', async () => {
    const ordersResponse = {
      orders: [
        {
          acct: 'U1234567',
          conid: 265598,
          conidex: '265598',
          orderId: 1001,
          cashCcy: 'USD',
          sizeAndFills: '10/10',
          orderDesc: 'Buy AAPL',
          description1: 'AAPL',
          ticker: 'AAPL',
          secType: 'STK',
          listingExchange: 'NASDAQ',
          remainingQuantity: 0,
          filledQuantity: 10,
          totalSize: 10,
          avgPrice: 193.18,
          lastFillPrice: 193.18,
          side: 'BUY',
          orderType: 'LMT',
          timeInForce: 'DAY',
          status: 'Filled',
          bgColor: '',
          fgColor: '',
        },
        {
          acct: 'U7654321',
          conid: 756733,
          conidex: '756733',
          orderId: 1002,
          cashCcy: 'USD',
          sizeAndFills: '5/0',
          orderDesc: 'Buy MSFT',
          description1: 'MSFT',
          ticker: 'MSFT',
          secType: 'STK',
          listingExchange: 'NASDAQ',
          remainingQuantity: 5,
          filledQuantity: 0,
          totalSize: 5,
          avgPrice: 0,
          lastFillPrice: 0,
          side: 'BUY',
          orderType: 'MKT',
          timeInForce: 'GTC',
          status: 'Submitted',
          bgColor: '',
          fgColor: '',
        },
      ],
      snapshot: true,
    }

    installFetch(mockFetch(ordersResponse))
    const handler = createGetOrdersHandler(TEST_CONFIG)
    const result = await handler({
      userId: 'user-1',
      accountId: 'U1234567',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orders).toHaveLength(1)
      expect(result.data.orders[0].acct).toBe('U1234567')
    }
  })

  it('calls GET /iserver/account/orders', async () => {
    const mock = mockFetch({ orders: [], snapshot: false })
    installFetch(mock)
    const handler = createGetOrdersHandler(TEST_CONFIG)
    await handler({ userId: 'user-1' })

    expect(mock).toHaveBeenCalledWith(
      'https://localhost:5000/v1/api/iserver/account/orders',
      expect.objectContaining({ method: 'GET' })
    )
  })

  it('returns error on API failure', async () => {
    installFetch(mockFetchError('Forbidden', 403))
    const handler = createGetOrdersHandler(TEST_CONFIG)
    const result = await handler({ userId: 'user-1' })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.code).toBe('IBKR_403')
    }
  })
})
