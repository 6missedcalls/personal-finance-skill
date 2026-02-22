import type { PlaidApi } from 'plaid'
import {
  GetTransactionsInput,
  type GetTransactionsOutput,
  type PlaidTransaction,
  formatPlaidError,
} from '../types.js'

function mapTransaction(txn: any): PlaidTransaction {
  return {
    transactionId: txn.transaction_id,
    accountId: txn.account_id,
    amount: txn.amount,
    isoCurrencyCode: txn.iso_currency_code ?? null,
    date: txn.date,
    name: txn.name,
    merchantName: txn.merchant_name ?? null,
    paymentChannel: txn.payment_channel,
    pending: txn.pending,
    category: txn.category ?? null,
    personalFinanceCategory: txn.personal_finance_category
      ? {
          primary: txn.personal_finance_category.primary,
          detailed: txn.personal_finance_category.detailed,
        }
      : null,
  }
}

export async function getTransactions(
  client: PlaidApi,
  rawInput: unknown
): Promise<GetTransactionsOutput> {
  const input = GetTransactionsInput.parse(rawInput)

  try {
    const response = await client.transactionsSync({
      access_token: input.accessToken,
      cursor: input.cursor ?? '',
      count: input.count,
    })

    return {
      added: response.data.added.map(mapTransaction),
      modified: response.data.modified.map(mapTransaction),
      removed: response.data.removed.map(r => r.transaction_id),
      nextCursor: response.data.next_cursor,
      hasMore: response.data.has_more,
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
