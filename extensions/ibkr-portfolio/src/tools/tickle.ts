import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type { TickleInput, TickleResponse, ToolResult } from '../types.js'

export const tickleTool = {
  name: 'ibkr_tickle',
  description:
    'Keep the IBKR Client Portal Gateway session alive. Call this at ~1 minute intervals to prevent idle timeout (5-6 min without traffic).',
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
  handler: createTickleHandler,
}

export function createTickleHandler(config: IbkrConfig) {
  return async (input: TickleInput): Promise<ToolResult<TickleResponse>> => {
    try {
      const response = await ibkrFetch<TickleResponse>(config, '/tickle', {
        method: 'POST',
      })

      return {
        success: true,
        data: response,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
