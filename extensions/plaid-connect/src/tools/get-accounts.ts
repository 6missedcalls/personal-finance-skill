import type { PlaidApi } from 'plaid'
import {
  GetAccountsInput,
  type GetAccountsOutput,
  type PlaidAccount,
  formatPlaidError,
} from '../types.js'

export async function getAccounts(
  client: PlaidApi,
  rawInput: unknown
): Promise<GetAccountsOutput> {
  const input = GetAccountsInput.parse(rawInput)

  try {
    const response = await client.accountsGet({
      access_token: input.accessToken,
      options: input.accountIds
        ? { account_ids: input.accountIds }
        : undefined,
    })

    const accounts: PlaidAccount[] = response.data.accounts.map(acct => ({
      accountId: acct.account_id,
      name: acct.name,
      officialName: acct.official_name ?? null,
      type: acct.type,
      subtype: acct.subtype ?? null,
      mask: acct.mask ?? null,
      balances: {
        available: acct.balances.available ?? null,
        current: acct.balances.current ?? null,
        limit: acct.balances.limit ?? null,
        isoCurrencyCode: acct.balances.iso_currency_code ?? null,
      },
    }))

    return {
      accounts,
      itemId: response.data.item.item_id,
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
