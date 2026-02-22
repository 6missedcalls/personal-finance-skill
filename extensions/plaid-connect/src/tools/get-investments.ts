import type { PlaidApi } from 'plaid'
import {
  GetInvestmentsInput,
  type GetInvestmentsOutput,
  type PlaidHolding,
  type PlaidSecurity,
  type PlaidInvestmentTransaction,
  formatPlaidError,
} from '../types.js'

function mapHolding(h: any): PlaidHolding {
  return {
    accountId: h.account_id,
    securityId: h.security_id,
    quantity: h.quantity,
    costBasis: h.cost_basis ?? null,
    institutionValue: h.institution_value ?? null,
    isoCurrencyCode: h.iso_currency_code ?? null,
  }
}

function mapSecurity(s: any): PlaidSecurity {
  return {
    securityId: s.security_id,
    name: s.name ?? null,
    tickerSymbol: s.ticker_symbol ?? null,
    type: s.type ?? null,
    isin: s.isin ?? null,
    cusip: s.cusip ?? null,
    closePrice: s.close_price ?? null,
    closePriceAsOf: s.close_price_as_of ?? null,
    isoCurrencyCode: s.iso_currency_code ?? null,
  }
}

function mapInvestmentTransaction(t: any): PlaidInvestmentTransaction {
  return {
    investmentTransactionId: t.investment_transaction_id,
    accountId: t.account_id,
    securityId: t.security_id ?? null,
    amount: t.amount,
    quantity: t.quantity,
    price: t.price,
    type: t.type,
    subtype: t.subtype,
    date: t.date,
    name: t.name,
    isoCurrencyCode: t.iso_currency_code ?? null,
  }
}

export async function getInvestments(
  client: PlaidApi,
  rawInput: unknown
): Promise<GetInvestmentsOutput> {
  const input = GetInvestmentsInput.parse(rawInput)
  const today = new Date().toISOString().slice(0, 10)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)

  try {
    const [holdingsRes, txnRes] = await Promise.all([
      client.investmentsHoldingsGet({
        access_token: input.accessToken,
      }),
      client.investmentsTransactionsGet({
        access_token: input.accessToken,
        start_date: input.startDate ?? thirtyDaysAgo,
        end_date: input.endDate ?? today,
      }),
    ])

    return {
      holdings: holdingsRes.data.holdings.map(mapHolding),
      securities: holdingsRes.data.securities.map(mapSecurity),
      investmentTransactions: txnRes.data.investment_transactions.map(mapInvestmentTransaction),
      requestId: holdingsRes.data.request_id,
    }
  } catch (err) {
    throw formatPlaidError(err)
  }
}
