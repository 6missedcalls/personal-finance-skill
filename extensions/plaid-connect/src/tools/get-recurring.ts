import type { PlaidApi } from 'plaid'
import {
  GetRecurringInput,
  type GetRecurringOutput,
  type PlaidRecurringTransaction,
  formatPlaidError,
} from '../types.js'

function mapStream(s: any): PlaidRecurringTransaction {
  return {
    streamId: s.stream_id,
    accountId: s.account_id,
    category: s.category ?? null,
    description: s.description,
    merchantName: s.merchant_name ?? null,
    averageAmount: {
      amount: s.average_amount?.amount ?? 0,
      isoCurrencyCode: s.average_amount?.iso_currency_code ?? null,
    },
    lastAmount: {
      amount: s.last_amount?.amount ?? 0,
      isoCurrencyCode: s.last_amount?.iso_currency_code ?? null,
    },
    frequency: s.frequency,
    lastDate: s.last_date,
    isActive: s.is_active ?? true,
    status: s.status,
  }
}

export async function getRecurring(
  client: PlaidApi,
  rawInput: unknown
): Promise<GetRecurringOutput> {
  const input = GetRecurringInput.parse(rawInput)

  try {
    const response = await client.transactionsRecurringGet({
      access_token: input.accessToken,
      account_ids: input.accountIds ?? [],
    })

    return {
      inflowStreams: response.data.inflow_streams.map(mapStream),
      outflowStreams: response.data.outflow_streams.map(mapStream),
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
