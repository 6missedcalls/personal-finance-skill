import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type { GetPositionsInput, Position, ToolResult } from '../types.js'

export const getPositionsTool = {
  name: 'ibkr_get_positions',
  description:
    'Get portfolio positions for an IBKR account. Returns paginated results — use pageId to fetch subsequent pages. Call ibkr_list_accounts first to initialize account context.',
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
        description: 'IBKR account ID (e.g. U1234567)',
      },
      pageId: {
        type: 'number',
        description: 'Page number for pagination (0-indexed). Defaults to 0.',
      },
    },
    required: ['userId', 'accountId'],
  },
  handler: createGetPositionsHandler,
}

interface PositionsResult {
  readonly positions: ReadonlyArray<Position>
  readonly pageId: number
  readonly hasMore: boolean
}

export function createGetPositionsHandler(config: IbkrConfig) {
  return async (
    input: GetPositionsInput
  ): Promise<ToolResult<PositionsResult>> => {
    try {
      const accountId = input.accountId ?? config.defaultAccountId

      if (!accountId) {
        return {
          success: false,
          error:
            'accountId is required. Call ibkr_list_accounts first, then pass an account ID.',
          code: 'IBKR_MISSING_ACCOUNT',
        }
      }

      const pageId = input.pageId ?? 0

      // Initialize portfolio account context
      await ibkrFetch(config, '/portfolio/accounts')

      const positions = await ibkrFetch<ReadonlyArray<Position>>(
        config,
        `/portfolio/${accountId}/positions/${pageId}`
      )

      return {
        success: true,
        data: {
          positions,
          pageId,
          hasMore: positions.length > 0,
        },
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
