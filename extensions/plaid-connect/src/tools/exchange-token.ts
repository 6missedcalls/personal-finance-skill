import type { PlaidApi } from 'plaid'
import { createHash } from 'node:crypto'
import { ExchangeTokenInput, type ExchangeTokenOutput, formatPlaidError } from '../types.js'

export async function exchangeToken(
  client: PlaidApi,
  rawInput: unknown
): Promise<ExchangeTokenOutput> {
  const input = ExchangeTokenInput.parse(rawInput)

  try {
    const response = await client.itemPublicTokenExchange({
      public_token: input.publicToken,
    })

    const accessToken = response.data.access_token
    const tokenRef = createHash('sha256')
      .update(accessToken)
      .digest('hex')
      .slice(0, 16)

    return {
      itemId: response.data.item_id,
      accessTokenRef: `plaid_at_${tokenRef}`,
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
