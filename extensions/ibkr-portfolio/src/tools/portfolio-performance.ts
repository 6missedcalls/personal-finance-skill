import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type {
  PerformanceSeries,
  PortfolioPerformanceInput,
  ToolResult,
} from '../types.js'

export const portfolioPerformanceTool = {
  name: 'ibkr_portfolio_performance',
  description:
    'Get Portfolio Analyst performance data including NAV time series, cumulative returns, and periodized returns. Supports multiple accounts.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for the finance skill session',
      },
      accountIds: {
        type: 'array',
        items: { type: 'string' },
        description: 'IBKR account IDs to include in performance analysis',
      },
      freq: {
        type: 'string',
        enum: ['D', 'W', 'M', 'Q'],
        description:
          'Frequency of data points: D=daily, W=weekly, M=monthly, Q=quarterly. Defaults to M.',
      },
    },
    required: ['userId', 'accountIds'],
  },
  handler: createPortfolioPerformanceHandler,
}

export function createPortfolioPerformanceHandler(config: IbkrConfig) {
  return async (
    input: PortfolioPerformanceInput
  ): Promise<ToolResult<PerformanceSeries>> => {
    try {
      if (input.accountIds.length === 0) {
        return {
          success: false,
          error:
            'At least one accountId is required. Call ibkr_list_accounts to get available accounts.',
          code: 'IBKR_MISSING_ACCOUNT',
        }
      }

      const body = {
        acctIds: input.accountIds,
        freq: input.freq ?? 'M',
      }

      const performance = await ibkrFetch<PerformanceSeries>(
        config,
        '/pa/performance',
        { method: 'POST', body }
      )

      return {
        success: true,
        data: performance,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
