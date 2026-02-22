import type { PlaidApi } from 'plaid'
import { CountryCode, Products } from 'plaid'
import type { PlaidConfig } from '../config.js'
import { CreateLinkTokenInput, type CreateLinkTokenOutput, formatPlaidError } from '../types.js'

export async function createLinkToken(
  client: PlaidApi,
  config: PlaidConfig,
  rawInput: unknown
): Promise<CreateLinkTokenOutput> {
  const input = CreateLinkTokenInput.parse(rawInput)

  try {
    const response = await client.linkTokenCreate({
      user: { client_user_id: input.userId },
      client_name: config.clientName,
      products: input.products.map(p => p as Products),
      country_codes: config.countryCodes.map(c => c as CountryCode),
      language: 'en',
      webhook: config.webhookUrl,
      redirect_uri: input.redirectUri,
    })

    return {
      linkToken: response.data.link_token,
      expiresAt: response.data.expiration,
      requestId: response.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
