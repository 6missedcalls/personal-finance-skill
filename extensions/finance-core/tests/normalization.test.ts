import { describe, it, expect } from "vitest"

import {
  normalizePlaidAccount,
  normalizePlaidTransaction,
  normalizePlaidHolding,
  normalizePlaidLiability,
} from "../src/normalization/plaid.js"
import {
  normalizeAlpacaAccount,
  normalizeAlpacaPosition,
} from "../src/normalization/alpaca.js"
import {
  normalizeIbkrAccount,
  normalizeIbkrPosition,
} from "../src/normalization/ibkr.js"

describe("Plaid normalization", () => {
  describe("normalizePlaidAccount", () => {
    it("normalizes a checking account", () => {
      const plaidAccount = {
        account_id: "plaid_acct_123",
        name: "My Checking",
        official_name: "Premium Checking Account",
        type: "depository",
        subtype: "checking",
        balances: {
          current: 5000.50,
          available: 4800.00,
          limit: null,
          iso_currency_code: "USD",
        },
      }

      const result = normalizePlaidAccount(plaidAccount, "inst_1", "Chase")

      expect(result.source).toBe("plaid")
      expect(result.sourceAccountId).toBe("plaid_acct_123")
      expect(result.type).toBe("depository")
      expect(result.subtype).toBe("checking")
      expect(result.balances.current).toBe(5000.50)
      expect(result.institutionName).toBe("Chase")
      expect(result.isActive).toBe(true)
      expect(result.id).toMatch(/^acct_/)
    })

    it("handles unknown type gracefully", () => {
      const plaidAccount = {
        account_id: "plaid_acct_456",
        name: "Unknown Account",
        official_name: null,
        type: "unknown_type",
        subtype: null,
        balances: { current: 100, available: null, limit: null, iso_currency_code: null },
      }

      const result = normalizePlaidAccount(plaidAccount, "inst_1", "Bank")
      expect(result.type).toBe("other")
      expect(result.subtype).toBe("other")
      expect(result.currency).toBe("USD")
    })
  })

  describe("normalizePlaidTransaction", () => {
    it("normalizes a posted transaction", () => {
      const plaidTx = {
        transaction_id: "plaid_txn_789",
        account_id: "plaid_acct_123",
        date: "2026-01-15",
        authorized_date: "2026-01-14",
        amount: 42.50,
        iso_currency_code: "USD",
        name: "STARBUCKS #1234",
        merchant_name: "Starbucks",
        personal_finance_category: {
          primary: "FOOD_AND_DRINK",
          detailed: "FOOD_AND_DRINK_COFFEE",
        },
        pending: false,
        payment_channel: "in_store",
        location: {
          city: "San Francisco",
          region: "CA",
          country: "US",
          postal_code: "94105",
        },
      }

      const result = normalizePlaidTransaction(plaidTx, "acct_1")

      expect(result.source).toBe("plaid")
      expect(result.sourceTransactionId).toBe("plaid_txn_789")
      expect(result.amount).toBe(42.50)
      expect(result.category).toBe("food_and_drink")
      expect(result.status).toBe("posted")
      expect(result.merchantName).toBe("Starbucks")
      expect(result.location?.city).toBe("San Francisco")
    })

    it("marks pending transactions correctly", () => {
      const plaidTx = {
        transaction_id: "txn_pending",
        account_id: "acct_123",
        date: "2026-01-15",
        authorized_date: null,
        amount: 10,
        iso_currency_code: "USD",
        name: "Pending Charge",
        merchant_name: null,
        personal_finance_category: null,
        pending: true,
        payment_channel: null,
        location: null,
      }

      const result = normalizePlaidTransaction(plaidTx, "acct_1")
      expect(result.status).toBe("pending")
      expect(result.category).toBe("other")
    })
  })

  describe("normalizePlaidHolding", () => {
    it("normalizes an equity holding", () => {
      const holding = {
        security_id: "sec_123",
        account_id: "acct_inv",
        quantity: 100,
        cost_basis: 15000,
        institution_price: 175.50,
        institution_value: 17550,
        iso_currency_code: "USD",
        security: {
          ticker_symbol: "AAPL",
          name: "Apple Inc.",
          type: "equity",
        },
      }

      const result = normalizePlaidHolding(holding, "acct_1")

      expect(result.symbol).toBe("AAPL")
      expect(result.holdingType).toBe("equity")
      expect(result.quantity).toBe(100)
      expect(result.costBasis).toBe(15000)
      expect(result.costBasisPerShare).toBe(150)
      expect(result.marketValue).toBe(17550)
      expect(result.unrealizedGainLoss).toBe(2550)
    })
  })

  describe("normalizePlaidLiability", () => {
    it("normalizes a credit card liability", () => {
      const liability = {
        account_id: "acct_cc",
        type: "credit",
        current_balance: 2500,
        minimum_payment: 75,
        interest_rate: 22.99,
        next_payment_due_date: "2026-02-15",
      }

      const result = normalizePlaidLiability(liability, "acct_1")

      expect(result.type).toBe("credit")
      expect(result.currentBalance).toBe(2500)
      expect(result.minimumPayment).toBe(75)
      expect(result.interestRate).toBe(22.99)
    })
  })
})

describe("Alpaca normalization", () => {
  describe("normalizeAlpacaAccount", () => {
    it("normalizes a paper trading account", () => {
      const alpacaAcct = {
        id: "alp_123",
        account_number: "PA1234567",
        status: "ACTIVE",
        currency: "USD",
        cash: "50000.00",
        portfolio_value: "75000.00",
        buying_power: "100000.00",
        equity: "75000.00",
        last_equity: "74500.00",
        long_market_value: "25000.00",
        short_market_value: "0.00",
        daytrade_count: 0,
        pattern_day_trader: false,
      }

      const result = normalizeAlpacaAccount(alpacaAcct, "paper")

      expect(result.source).toBe("alpaca")
      expect(result.type).toBe("brokerage")
      expect(result.balances.current).toBe(75000)
      expect(result.balances.available).toBe(100000)
      expect(result.institutionName).toBe("Alpaca (paper)")
      expect(result.isActive).toBe(true)
    })
  })

  describe("normalizeAlpacaPosition", () => {
    it("normalizes an equity position", () => {
      const pos = {
        asset_id: "asset_123",
        symbol: "AAPL",
        exchange: "NASDAQ",
        asset_class: "us_equity",
        qty: "50",
        avg_entry_price: "150.00",
        side: "long",
        market_value: "8750.00",
        cost_basis: "7500.00",
        unrealized_pl: "1250.00",
        unrealized_plpc: "0.1667",
        current_price: "175.00",
        lastday_price: "173.50",
        change_today: "0.0087",
      }

      const result = normalizeAlpacaPosition(pos, "acct_1")

      expect(result.symbol).toBe("AAPL")
      expect(result.holdingType).toBe("equity")
      expect(result.quantity).toBe(50)
      expect(result.costBasis).toBe(7500)
      expect(result.costBasisPerShare).toBe(150)
      expect(result.currentPrice).toBe(175)
      expect(result.marketValue).toBe(8750)
      expect(result.unrealizedGainLoss).toBe(1250)
    })
  })
})

describe("IBKR normalization", () => {
  describe("normalizeIbkrAccount", () => {
    it("normalizes an individual brokerage account", () => {
      const ibkrAcct = {
        accountId: "U1234567",
        accountTitle: "John Doe Individual",
        accountType: "INDIVIDUAL",
        currency: "USD",
        netliquidation: 250000,
        availablefunds: 100000,
      }

      const result = normalizeIbkrAccount(ibkrAcct)

      expect(result.source).toBe("ibkr")
      expect(result.sourceAccountId).toBe("U1234567")
      expect(result.type).toBe("brokerage")
      expect(result.subtype).toBe("brokerage_taxable")
      expect(result.balances.current).toBe(250000)
      expect(result.institutionName).toBe("Interactive Brokers")
    })

    it("normalizes an IRA account", () => {
      const ibkrAcct = {
        accountId: "U7654321",
        accountTitle: "John Doe IRA",
        accountType: "IRA",
        currency: "USD",
        netliquidation: 150000,
      }

      const result = normalizeIbkrAccount(ibkrAcct)
      expect(result.type).toBe("retirement")
      expect(result.subtype).toBe("ira_traditional")
    })
  })

  describe("normalizeIbkrPosition", () => {
    it("normalizes a stock position", () => {
      const pos = {
        acctId: "U1234567",
        conid: 265598,
        contractDesc: "AAPL",
        ticker: "AAPL",
        position: 200,
        mktPrice: 175.50,
        mktValue: 35100,
        avgCost: 150.25,
        avgPrice: 150.25,
        unrealizedPnl: 5050,
        currency: "USD",
        assetClass: "STK",
      }

      const result = normalizeIbkrPosition(pos, "acct_1")

      expect(result.symbol).toBe("AAPL")
      expect(result.holdingType).toBe("equity")
      expect(result.quantity).toBe(200)
      expect(result.currentPrice).toBe(175.50)
      expect(result.marketValue).toBe(35100)
      expect(result.unrealizedGainLoss).toBe(5050)
    })

    it("normalizes an option position", () => {
      const pos = {
        acctId: "U1234567",
        conid: 999999,
        contractDesc: "AAPL MAR26 180 C",
        position: 5,
        mktPrice: 8.50,
        mktValue: 4250,
        avgCost: 5.00,
        avgPrice: 5.00,
        unrealizedPnl: 1750,
        currency: "USD",
        assetClass: "OPT",
      }

      const result = normalizeIbkrPosition(pos, "acct_1")
      expect(result.holdingType).toBe("option")
      expect(result.name).toBe("AAPL MAR26 180 C")
    })
  })
})
