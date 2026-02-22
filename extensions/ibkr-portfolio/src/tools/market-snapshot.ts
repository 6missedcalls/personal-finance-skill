import { ibkrFetch, toToolError, freshness, type IbkrConfig } from '../config.js'
import type {
  MarketSnapshot,
  MarketSnapshotInput,
  ToolResult,
  MARKET_DATA_FIELDS,
} from '../types.js'
import { MARKET_DATA_FIELDS as FIELDS } from '../types.js'

export const marketSnapshotTool = {
  name: 'ibkr_market_snapshot',
  description:
    'Get real-time market data snapshot for one or more contracts. Requires contract IDs (conid) from ibkr_search_contracts. Returns last price, bid, ask, volume, and other fields. Max 100 conids per request.',
  input_schema: {
    type: 'object' as const,
    additionalProperties: false,
    properties: {
      userId: {
        type: 'string',
        description: 'User identifier for the finance skill session',
      },
      conids: {
        type: 'array',
        items: { type: 'number' },
        description:
          'Contract IDs to get market data for (max 100). Get these from ibkr_search_contracts.',
        maxItems: 100,
      },
      fields: {
        type: 'array',
        items: { type: 'string' },
        description:
          'Market data field IDs to request (max 50). Common: 31=last, 84=bid, 86=ask, 87=volume, 82=change, 83=change%. Defaults to core price fields.',
        maxItems: 50,
      },
    },
    required: ['userId', 'conids'],
  },
  handler: createMarketSnapshotHandler,
}

const DEFAULT_FIELDS = [
  FIELDS.LAST_PRICE,
  FIELDS.BID,
  FIELDS.ASK,
  FIELDS.VOLUME,
  FIELDS.CHANGE,
  FIELDS.CHANGE_PCT,
  FIELDS.HIGH,
  FIELDS.LOW,
  FIELDS.SYMBOL,
  FIELDS.AVAILABILITY,
]

export function createMarketSnapshotHandler(config: IbkrConfig) {
  return async (
    input: MarketSnapshotInput
  ): Promise<ToolResult<ReadonlyArray<MarketSnapshot>>> => {
    try {
      if (input.conids.length === 0) {
        return {
          success: false,
          error:
            'At least one conid is required. Use ibkr_search_contracts to find contract IDs.',
          code: 'IBKR_MISSING_CONIDS',
        }
      }

      if (input.conids.length > 100) {
        return {
          success: false,
          error: 'Maximum 100 conids per request.',
          code: 'IBKR_TOO_MANY_CONIDS',
        }
      }

      const fields = input.fields ?? DEFAULT_FIELDS

      const params: Record<string, string> = {
        conids: input.conids.join(','),
        fields: fields.join(','),
      }

      const snapshots = await ibkrFetch<ReadonlyArray<MarketSnapshot>>(
        config,
        '/iserver/marketdata/snapshot',
        { params }
      )

      return {
        success: true,
        data: snapshots,
        dataFreshness: freshness(),
      }
    } catch (error) {
      return toToolError(error)
    }
  }
}
