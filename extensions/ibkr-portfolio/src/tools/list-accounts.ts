import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type {
  AccountsResponse,
  ListAccountsInput,
  ToolResult,
} from '../types.js'

export const listAccountsTool = {
  name: 'ibkr_list_accounts',
  description:
    'List all tradable IBKR accounts for the active session. Must be called before portfolio or order endpoints to initialize account context.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for the finance skill session',
      },
    },
    required: ['userId'],
  },
  handler: createListAccountsHandler,
}

export function createListAccountsHandler(config: IbkrConfig) {
  return async (
    input: ListAccountsInput
  ): Promise<ToolResult<AccountsResponse>> => {
    try {
      const accounts = await ibkrFetch<AccountsResponse>(
        config,
        '/iserver/accounts'
      )

      return {
        success: true,
        data: accounts,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
