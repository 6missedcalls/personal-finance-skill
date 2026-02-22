import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type { GetOrdersInput, OrdersResponse, ToolResult } from '../types.js'

export const getOrdersTool = {
  name: 'ibkr_get_orders',
  description:
    'List recent and open orders for the active IBKR session. Returns order status, fills, and details. Call ibkr_list_accounts first to set account context.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for the finance skill session',
      },
      accountId: {
        type: 'string',
        description:
          'IBKR account ID to filter orders for (optional, uses selected account if omitted)',
      },
    },
    required: ['userId'],
  },
  handler: createGetOrdersHandler,
}

export function createGetOrdersHandler(config: IbkrConfig) {
  return async (
    input: GetOrdersInput
  ): Promise<ToolResult<OrdersResponse>> => {
    try {
      const orders = await ibkrFetch<OrdersResponse>(
        config,
        '/iserver/account/orders'
      )

      const filteredOrders =
        input.accountId
          ? {
              ...orders,
              orders: orders.orders.filter((o) => o.acct === input.accountId),
            }
          : orders

      return {
        success: true,
        data: filteredOrders,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
