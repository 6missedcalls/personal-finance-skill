import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type { AuthStatus, AuthStatusInput, ToolResult } from '../types.js'

export const authStatusTool = {
  name: 'ibkr_auth_status',
  description:
    'Check IBKR Client Portal Gateway authentication and session status. Use this before other IBKR calls to verify the session is active.',
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
  handler: createAuthStatusHandler,
}

export function createAuthStatusHandler(config: IbkrConfig) {
  return async (input: AuthStatusInput): Promise<ToolResult<AuthStatus>> => {
    try {
      const status = await ibkrFetch<AuthStatus>(
        config,
        '/iserver/auth/status',
        { method: 'POST' }
      )

      return {
        success: true,
        data: status,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
