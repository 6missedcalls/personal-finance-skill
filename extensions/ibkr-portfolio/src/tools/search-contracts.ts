import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type {
  ContractSearchResult,
  SearchContractsInput,
  ToolResult,
} from '../types.js'

export const searchContractsTool = {
  name: 'ibkr_search_contracts',
  description:
    'Search for tradable contracts (stocks, options, futures, etc.) by symbol or name. Returns contract IDs (conid) needed for market data and order placement.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for the finance skill session',
      },
      symbol: {
        type: 'string',
        description: 'Ticker symbol to search for (e.g. AAPL, MSFT)',
      },
      name: {
        type: 'string',
        description: 'Company name to search for (optional, refines results)',
      },
      secType: {
        type: 'string',
        enum: ['STK', 'OPT', 'FUT', 'FOP', 'WAR', 'CFD', 'BOND'],
        description: 'Security type filter. Defaults to all types.',
      },
    },
    required: ['userId', 'symbol'],
  },
  handler: createSearchContractsHandler,
}

export function createSearchContractsHandler(config: IbkrConfig) {
  return async (
    input: SearchContractsInput
  ): Promise<ToolResult<ReadonlyArray<ContractSearchResult>>> => {
    try {
      const params: Record<string, string> = {
        symbol: input.symbol,
      }

      if (input.name) {
        params.name = input.name
      }

      if (input.secType) {
        params.secType = input.secType
      }

      const results = await ibkrFetch<ReadonlyArray<ContractSearchResult>>(
        config,
        '/iserver/secdef/search',
        { params }
      )

      return {
        success: true,
        data: results,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
