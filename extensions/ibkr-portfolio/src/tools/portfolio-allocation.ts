import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type {
  AllocationResponse,
  PortfolioAllocationInput,
  ToolResult,
} from '../types.js'

export const portfolioAllocationTool = {
  name: 'ibkr_portfolio_allocation',
  description:
    'Get asset allocation breakdown for an IBKR account by asset class, sector, and industry group. Useful for drift analysis and rebalancing checks.',
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
    },
    required: ['userId', 'accountId'],
  },
  handler: createPortfolioAllocationHandler,
}

export function createPortfolioAllocationHandler(config: IbkrConfig) {
  return async (
    input: PortfolioAllocationInput
  ): Promise<ToolResult<AllocationResponse>> => {
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

      // Initialize portfolio account context
      await ibkrFetch(config, '/portfolio/accounts')

      const allocation = await ibkrFetch<AllocationResponse>(
        config,
        `/portfolio/${accountId}/allocation`
      )

      return {
        success: true,
        data: allocation,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
