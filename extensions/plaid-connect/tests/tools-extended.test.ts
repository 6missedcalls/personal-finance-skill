import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { PlaidApi } from 'plaid'
import { getInvestments } from '../src/tools/get-investments.js'
import { getLiabilities } from '../src/tools/get-liabilities.js'
import { getRecurring } from '../src/tools/get-recurring.js'
import { webhookHandler } from '../src/tools/webhook-handler.js'

// --- Mock PlaidApi Factory ---

function createMockClient() {
  return {
    investmentsHoldingsGet: vi.fn(),
    investmentsTransactionsGet: vi.fn(),
    liabilitiesGet: vi.fn(),
    transactionsRecurringGet: vi.fn(),
  } as unknown as PlaidApi & {
    investmentsHoldingsGet: ReturnType<typeof vi.fn>
    investmentsTransactionsGet: ReturnType<typeof vi.fn>
    liabilitiesGet: ReturnType<typeof vi.fn>
    transactionsRecurringGet: ReturnType<typeof vi.fn>
  }
}

// --- Shared valid inputs ---

const validBaseInput = {
  userId: 'user-123',
  accessToken: 'access-sandbox-abc123',
}

// ============================================================
// getInvestments
// ============================================================

describe('getInvestments', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
  })

  it('should return mapped holdings, securities, and investment transactions', async () => {
    client.investmentsHoldingsGet.mockResolvedValue({
      data: {
        holdings: [
          {
            account_id: 'acct-1',
            security_id: 'sec-1',
            quantity: 10,
            cost_basis: 1500.0,
            institution_value: 1800.0,
            iso_currency_code: 'USD',
          },
        ],
        securities: [
          {
            security_id: 'sec-1',
            name: 'Apple Inc',
            ticker_symbol: 'AAPL',
            type: 'equity',
            isin: 'US0378331005',
            cusip: '037833100',
            close_price: 180.0,
            close_price_as_of: '2026-02-21',
            iso_currency_code: 'USD',
          },
        ],
        request_id: 'req-inv-001',
      },
    })

    client.investmentsTransactionsGet.mockResolvedValue({
      data: {
        investment_transactions: [
          {
            investment_transaction_id: 'inv-txn-1',
            account_id: 'acct-1',
            security_id: 'sec-1',
            amount: -500.0,
            quantity: 3,
            price: 166.67,
            type: 'buy',
            subtype: 'buy',
            date: '2026-02-10',
            name: 'BUY AAPL',
            iso_currency_code: 'USD',
          },
        ],
        request_id: 'req-inv-txn-001',
      },
    })

    const result = await getInvestments(client, {
      ...validBaseInput,
      startDate: '2026-01-01',
      endDate: '2026-02-22',
    })

    expect(result.holdings).toHaveLength(1)
    expect(result.holdings[0]).toEqual({
      accountId: 'acct-1',
      securityId: 'sec-1',
      quantity: 10,
      costBasis: 1500.0,
      institutionValue: 1800.0,
      isoCurrencyCode: 'USD',
    })

    expect(result.securities).toHaveLength(1)
    expect(result.securities[0]).toEqual({
      securityId: 'sec-1',
      name: 'Apple Inc',
      tickerSymbol: 'AAPL',
      type: 'equity',
      isin: 'US0378331005',
      cusip: '037833100',
      closePrice: 180.0,
      closePriceAsOf: '2026-02-21',
      isoCurrencyCode: 'USD',
    })

    expect(result.investmentTransactions).toHaveLength(1)
    expect(result.investmentTransactions[0]).toEqual({
      investmentTransactionId: 'inv-txn-1',
      accountId: 'acct-1',
      securityId: 'sec-1',
      amount: -500.0,
      quantity: 3,
      price: 166.67,
      type: 'buy',
      subtype: 'buy',
      date: '2026-02-10',
      name: 'BUY AAPL',
      isoCurrencyCode: 'USD',
    })

    expect(result.requestId).toBe('req-inv-001')
  })

  it('should use default date range when startDate and endDate are omitted', async () => {
    client.investmentsHoldingsGet.mockResolvedValue({
      data: { holdings: [], securities: [], request_id: 'req-def' },
    })
    client.investmentsTransactionsGet.mockResolvedValue({
      data: { investment_transactions: [], request_id: 'req-def-txn' },
    })

    await getInvestments(client, validBaseInput)

    const txnCall = client.investmentsTransactionsGet.mock.calls[0][0]
    expect(txnCall.start_date).toBeDefined()
    expect(txnCall.end_date).toBeDefined()
    expect(txnCall.access_token).toBe(validBaseInput.accessToken)
  })

  it('should map null/undefined optional fields gracefully', async () => {
    client.investmentsHoldingsGet.mockResolvedValue({
      data: {
        holdings: [
          {
            account_id: 'acct-2',
            security_id: 'sec-2',
            quantity: 5,
          },
        ],
        securities: [
          {
            security_id: 'sec-2',
          },
        ],
        request_id: 'req-nulls',
      },
    })
    client.investmentsTransactionsGet.mockResolvedValue({
      data: { investment_transactions: [], request_id: 'req-nulls-txn' },
    })

    const result = await getInvestments(client, validBaseInput)

    expect(result.holdings[0].costBasis).toBeNull()
    expect(result.holdings[0].institutionValue).toBeNull()
    expect(result.holdings[0].isoCurrencyCode).toBeNull()
    expect(result.securities[0].name).toBeNull()
    expect(result.securities[0].tickerSymbol).toBeNull()
    expect(result.securities[0].closePrice).toBeNull()
  })

  it('should throw validation error when userId is missing', async () => {
    await expect(
      getInvestments(client, { accessToken: 'tok-123' })
    ).rejects.toThrow()
  })

  it('should throw validation error when accessToken is missing', async () => {
    await expect(
      getInvestments(client, { userId: 'user-1' })
    ).rejects.toThrow()
  })

  it('should throw validation error when userId is empty string', async () => {
    await expect(
      getInvestments(client, { userId: '', accessToken: 'tok-123' })
    ).rejects.toThrow()
  })

  it('should throw a formatted PlaidToolError when API call fails', async () => {
    const apiError = {
      response: {
        data: {
          error_type: 'ITEM_ERROR',
          error_code: 'ITEM_LOGIN_REQUIRED',
          error_message: 'The login details for this item have changed',
          request_id: 'req-err-001',
        },
      },
    }
    client.investmentsHoldingsGet.mockRejectedValue(apiError)
    client.investmentsTransactionsGet.mockResolvedValue({
      data: { investment_transactions: [], request_id: 'ok' },
    })

    try {
      await getInvestments(client, validBaseInput)
      expect.fail('Expected getInvestments to throw')
    } catch (err: any) {
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('ITEM_ERROR')
      expect(err.errorCode).toBe('ITEM_LOGIN_REQUIRED')
      expect(err.errorMessage).toBe('The login details for this item have changed')
      expect(err.requestId).toBe('req-err-001')
    }
  })

  it('should handle unknown error format gracefully', async () => {
    client.investmentsHoldingsGet.mockRejectedValue(new Error('Network timeout'))
    client.investmentsTransactionsGet.mockResolvedValue({
      data: { investment_transactions: [], request_id: 'ok' },
    })

    try {
      await getInvestments(client, validBaseInput)
      expect.fail('Expected getInvestments to throw')
    } catch (err: any) {
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('UNKNOWN')
      expect(err.errorCode).toBe('UNKNOWN')
      expect(err.errorMessage).toBe('Network timeout')
      expect(err.requestId).toBeNull()
    }
  })
})

// ============================================================
// getLiabilities
// ============================================================

describe('getLiabilities', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
  })

  it('should return mapped credit, student loan, and mortgage liabilities', async () => {
    client.liabilitiesGet.mockResolvedValue({
      data: {
        liabilities: {
          credit: [
            {
              account_id: 'acct-cc-1',
              aprs: [
                {
                  apr_percentage: 24.99,
                  apr_type: 'purchase',
                  balance_subject_to_apr: 3200.0,
                },
              ],
              is_overdue: false,
              last_payment_amount: 150.0,
              last_payment_date: '2026-02-01',
              last_statement_balance: 3200.0,
              minimum_payment_amount: 35.0,
              next_payment_due_date: '2026-03-01',
            },
          ],
          student: [
            {
              account_id: 'acct-sl-1',
              account_number: '1234567890',
              disbursement_dates: ['2020-08-15'],
              expected_payoff_date: '2030-08-15',
              interest_rate_percentage: 4.5,
              is_overdue: false,
              last_payment_amount: 250.0,
              last_payment_date: '2026-02-01',
              loan_name: 'Federal Direct Unsub',
              loan_status: { type: 'repayment', end_date: '2030-08-15' },
              minimum_payment_amount: 200.0,
              next_payment_due_date: '2026-03-01',
              origination_date: '2020-08-15',
              origination_principal_amount: 30000.0,
              outstanding_interest_amount: 450.0,
              repayment_plan: { type: 'standard', description: 'Standard repayment' },
            },
          ],
          mortgage: [
            {
              account_id: 'acct-mtg-1',
              account_number: 'MTG-9876',
              current_late_fee: null,
              escrow_balance: 4500.0,
              has_pmi: false,
              interest_rate: { percentage: 3.25, type: 'fixed' },
              last_payment_amount: 2100.0,
              last_payment_date: '2026-02-01',
              loan_term: 360,
              loan_type_description: '30-year fixed',
              maturity_date: '2053-01-01',
              next_monthly_payment: 2100.0,
              next_payment_due_date: '2026-03-01',
              origination_date: '2023-01-15',
              origination_principal_amount: 450000.0,
              past_due_amount: null,
              property_address: {
                city: 'Austin',
                country: 'US',
                postal_code: '78701',
                region: 'TX',
                street: '123 Main St',
              },
              ytd_interest_paid: 2400.0,
              ytd_principal_paid: 1800.0,
            },
          ],
        },
        request_id: 'req-liab-001',
      },
    })

    const result = await getLiabilities(client, validBaseInput)

    expect(result.credit).toHaveLength(1)
    expect(result.credit[0].accountId).toBe('acct-cc-1')
    expect(result.credit[0].aprs).toHaveLength(1)
    expect(result.credit[0].aprs[0]).toEqual({
      aprPercentage: 24.99,
      aprType: 'purchase',
      balanceSubjectToApr: 3200.0,
    })
    expect(result.credit[0].isOverdue).toBe(false)
    expect(result.credit[0].minimumPaymentAmount).toBe(35.0)

    expect(result.student).toHaveLength(1)
    expect(result.student[0].accountId).toBe('acct-sl-1')
    expect(result.student[0].interestRatePercentage).toBe(4.5)
    expect(result.student[0].loanStatus).toEqual({
      type: 'repayment',
      endDate: '2030-08-15',
    })
    expect(result.student[0].repaymentPlan).toEqual({
      type: 'standard',
      description: 'Standard repayment',
    })

    expect(result.mortgage).toHaveLength(1)
    expect(result.mortgage[0].accountId).toBe('acct-mtg-1')
    expect(result.mortgage[0].interestRate).toEqual({
      percentage: 3.25,
      type: 'fixed',
    })
    expect(result.mortgage[0].propertyAddress).toEqual({
      city: 'Austin',
      country: 'US',
      postalCode: '78701',
      region: 'TX',
      street: '123 Main St',
    })
    expect(result.mortgage[0].loanTermMonths).toBe(360)

    expect(result.requestId).toBe('req-liab-001')
  })

  it('should pass accountIds filter to the API when provided', async () => {
    client.liabilitiesGet.mockResolvedValue({
      data: {
        liabilities: { credit: [], student: [], mortgage: [] },
        request_id: 'req-filter',
      },
    })

    await getLiabilities(client, {
      ...validBaseInput,
      accountIds: ['acct-cc-1'],
    })

    expect(client.liabilitiesGet).toHaveBeenCalledWith({
      access_token: validBaseInput.accessToken,
      options: { account_ids: ['acct-cc-1'] },
    })
  })

  it('should pass undefined options when accountIds is not provided', async () => {
    client.liabilitiesGet.mockResolvedValue({
      data: {
        liabilities: { credit: [], student: [], mortgage: [] },
        request_id: 'req-no-filter',
      },
    })

    await getLiabilities(client, validBaseInput)

    expect(client.liabilitiesGet).toHaveBeenCalledWith({
      access_token: validBaseInput.accessToken,
      options: undefined,
    })
  })

  it('should handle empty liability categories gracefully', async () => {
    client.liabilitiesGet.mockResolvedValue({
      data: {
        liabilities: { credit: null, student: null, mortgage: null },
        request_id: 'req-empty',
      },
    })

    const result = await getLiabilities(client, validBaseInput)

    expect(result.credit).toEqual([])
    expect(result.student).toEqual([])
    expect(result.mortgage).toEqual([])
  })

  it('should map null optional fields on mortgage without property address', async () => {
    client.liabilitiesGet.mockResolvedValue({
      data: {
        liabilities: {
          credit: [],
          student: [],
          mortgage: [
            {
              account_id: 'acct-mtg-2',
              interest_rate: {},
            },
          ],
        },
        request_id: 'req-sparse',
      },
    })

    const result = await getLiabilities(client, validBaseInput)

    expect(result.mortgage[0].propertyAddress).toBeNull()
    expect(result.mortgage[0].interestRate).toEqual({
      percentage: null,
      type: null,
    })
    expect(result.mortgage[0].escrowBalance).toBeNull()
  })

  it('should throw validation error when userId is missing', async () => {
    await expect(
      getLiabilities(client, { accessToken: 'tok-123' })
    ).rejects.toThrow()
  })

  it('should throw validation error when accessToken is missing', async () => {
    await expect(
      getLiabilities(client, { userId: 'user-1' })
    ).rejects.toThrow()
  })

  it('should throw validation error when input is empty object', async () => {
    await expect(getLiabilities(client, {})).rejects.toThrow()
  })

  it('should throw a formatted PlaidToolError when API call fails', async () => {
    client.liabilitiesGet.mockRejectedValue({
      response: {
        data: {
          error_type: 'INVALID_REQUEST',
          error_code: 'INVALID_ACCESS_TOKEN',
          error_message: 'The access token is invalid',
          request_id: 'req-err-liab',
        },
      },
    })

    try {
      await getLiabilities(client, validBaseInput)
      expect.fail('Expected getLiabilities to throw')
    } catch (err: any) {
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('INVALID_REQUEST')
      expect(err.errorCode).toBe('INVALID_ACCESS_TOKEN')
      expect(err.errorMessage).toBe('The access token is invalid')
      expect(err.requestId).toBe('req-err-liab')
    }
  })
})

// ============================================================
// getRecurring
// ============================================================

describe('getRecurring', () => {
  let client: ReturnType<typeof createMockClient>

  beforeEach(() => {
    client = createMockClient()
  })

  it('should return mapped inflow and outflow recurring streams', async () => {
    client.transactionsRecurringGet.mockResolvedValue({
      data: {
        inflow_streams: [
          {
            stream_id: 'stream-in-1',
            account_id: 'acct-1',
            category: ['Income', 'Payroll'],
            description: 'Direct Deposit - Employer',
            merchant_name: 'ACME Corp',
            average_amount: { amount: 4500.0, iso_currency_code: 'USD' },
            last_amount: { amount: 4500.0, iso_currency_code: 'USD' },
            frequency: 'SEMI_MONTHLY',
            last_date: '2026-02-15',
            is_active: true,
            status: 'MATURE',
          },
        ],
        outflow_streams: [
          {
            stream_id: 'stream-out-1',
            account_id: 'acct-1',
            category: ['Service', 'Subscription'],
            description: 'Netflix',
            merchant_name: 'Netflix',
            average_amount: { amount: 15.99, iso_currency_code: 'USD' },
            last_amount: { amount: 15.99, iso_currency_code: 'USD' },
            frequency: 'MONTHLY',
            last_date: '2026-02-10',
            is_active: true,
            status: 'MATURE',
          },
          {
            stream_id: 'stream-out-2',
            account_id: 'acct-1',
            category: ['Housing', 'Rent'],
            description: 'Monthly Rent',
            merchant_name: null,
            average_amount: { amount: 2200.0, iso_currency_code: 'USD' },
            last_amount: { amount: 2200.0, iso_currency_code: 'USD' },
            frequency: 'MONTHLY',
            last_date: '2026-02-01',
            is_active: true,
            status: 'MATURE',
          },
        ],
        request_id: 'req-recur-001',
      },
    })

    const result = await getRecurring(client, validBaseInput)

    expect(result.inflowStreams).toHaveLength(1)
    expect(result.inflowStreams[0]).toEqual({
      streamId: 'stream-in-1',
      accountId: 'acct-1',
      category: ['Income', 'Payroll'],
      description: 'Direct Deposit - Employer',
      merchantName: 'ACME Corp',
      averageAmount: { amount: 4500.0, isoCurrencyCode: 'USD' },
      lastAmount: { amount: 4500.0, isoCurrencyCode: 'USD' },
      frequency: 'SEMI_MONTHLY',
      lastDate: '2026-02-15',
      isActive: true,
      status: 'MATURE',
    })

    expect(result.outflowStreams).toHaveLength(2)
    expect(result.outflowStreams[0].streamId).toBe('stream-out-1')
    expect(result.outflowStreams[1].merchantName).toBeNull()

    expect(result.requestId).toBe('req-recur-001')
  })

  it('should pass accountIds to the API when provided', async () => {
    client.transactionsRecurringGet.mockResolvedValue({
      data: {
        inflow_streams: [],
        outflow_streams: [],
        request_id: 'req-filter-recur',
      },
    })

    await getRecurring(client, {
      ...validBaseInput,
      accountIds: ['acct-1', 'acct-2'],
    })

    expect(client.transactionsRecurringGet).toHaveBeenCalledWith({
      access_token: validBaseInput.accessToken,
      account_ids: ['acct-1', 'acct-2'],
    })
  })

  it('should default accountIds to empty array when not provided', async () => {
    client.transactionsRecurringGet.mockResolvedValue({
      data: {
        inflow_streams: [],
        outflow_streams: [],
        request_id: 'req-default-ids',
      },
    })

    await getRecurring(client, validBaseInput)

    expect(client.transactionsRecurringGet).toHaveBeenCalledWith({
      access_token: validBaseInput.accessToken,
      account_ids: [],
    })
  })

  it('should handle null/missing optional fields on streams', async () => {
    client.transactionsRecurringGet.mockResolvedValue({
      data: {
        inflow_streams: [
          {
            stream_id: 'stream-sparse',
            account_id: 'acct-1',
            description: 'Sparse deposit',
            average_amount: {},
            last_amount: {},
            frequency: 'MONTHLY',
            last_date: '2026-01-15',
            status: 'EARLY_DETECTION',
          },
        ],
        outflow_streams: [],
        request_id: 'req-sparse-recur',
      },
    })

    const result = await getRecurring(client, validBaseInput)

    expect(result.inflowStreams[0].category).toBeNull()
    expect(result.inflowStreams[0].merchantName).toBeNull()
    expect(result.inflowStreams[0].averageAmount.amount).toBe(0)
    expect(result.inflowStreams[0].averageAmount.isoCurrencyCode).toBeNull()
    expect(result.inflowStreams[0].lastAmount.amount).toBe(0)
    expect(result.inflowStreams[0].isActive).toBe(true)
  })

  it('should throw validation error when userId is missing', async () => {
    await expect(
      getRecurring(client, { accessToken: 'tok-123' })
    ).rejects.toThrow()
  })

  it('should throw validation error when accessToken is missing', async () => {
    await expect(
      getRecurring(client, { userId: 'user-1' })
    ).rejects.toThrow()
  })

  it('should throw validation error for completely invalid input', async () => {
    await expect(getRecurring(client, 'not-an-object')).rejects.toThrow()
  })

  it('should throw a formatted PlaidToolError when API call fails', async () => {
    client.transactionsRecurringGet.mockRejectedValue({
      response: {
        data: {
          error_type: 'ITEM_ERROR',
          error_code: 'PRODUCT_NOT_READY',
          error_message: 'Recurring transactions data is not yet available',
          request_id: 'req-err-recur',
        },
      },
    })

    try {
      await getRecurring(client, validBaseInput)
      expect.fail('Expected getRecurring to throw')
    } catch (err: any) {
      expect(err.error).toBe(true)
      expect(err.errorType).toBe('ITEM_ERROR')
      expect(err.errorCode).toBe('PRODUCT_NOT_READY')
      expect(err.errorMessage).toBe('Recurring transactions data is not yet available')
      expect(err.requestId).toBe('req-err-recur')
    }
  })
})

// ============================================================
// webhookHandler
// ============================================================

describe('webhookHandler', () => {
  const validHeaders = { 'content-type': 'application/json' }

  describe('accepted webhook types', () => {
    const supportedTypes = [
      'TRANSACTIONS',
      'ITEM',
      'HOLDINGS',
      'INVESTMENTS_TRANSACTIONS',
      'LIABILITIES',
      'AUTH',
    ]

    it.each(supportedTypes)(
      'should accept webhook type: %s',
      async (webhookType) => {
        const result = await webhookHandler({
          headers: validHeaders,
          body: {
            webhook_type: webhookType,
            webhook_code: 'DEFAULT_UPDATE',
            item_id: 'item-abc',
          },
        })

        expect(result.accepted).toBe(true)
        expect(result.webhookType).toBe(webhookType)
        expect(result.webhookCode).toBe('DEFAULT_UPDATE')
        expect(result.itemId).toBe('item-abc')
        expect(result.error).toBeNull()
      }
    )
  })

  describe('rejected / unsupported webhook types', () => {
    it('should reject an unsupported webhook type', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'INCOME',
          webhook_code: 'INCOME_VERIFICATION',
          item_id: 'item-xyz',
        },
      })

      expect(result.accepted).toBe(false)
      expect(result.webhookType).toBe('INCOME')
      expect(result.webhookCode).toBe('INCOME_VERIFICATION')
      expect(result.itemId).toBe('item-xyz')
      expect(result.error).toBe('Unsupported webhook type: INCOME')
    })

    it('should reject unknown/empty webhook type', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_code: 'SOME_CODE',
        },
      })

      expect(result.accepted).toBe(false)
      expect(result.webhookType).toBe('UNKNOWN')
      expect(result.error).toBe('Unsupported webhook type: UNKNOWN')
    })

    it('should reject BANK_TRANSFERS webhook type', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'BANK_TRANSFERS',
          webhook_code: 'BANK_TRANSFERS_EVENTS_UPDATE',
          item_id: 'item-bt',
        },
      })

      expect(result.accepted).toBe(false)
      expect(result.error).toBe('Unsupported webhook type: BANK_TRANSFERS')
    })
  })

  describe('error field extraction', () => {
    it('should extract error_message from body.error object', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'ITEM',
          webhook_code: 'ERROR',
          item_id: 'item-err',
          error: {
            error_type: 'ITEM_ERROR',
            error_code: 'ITEM_LOGIN_REQUIRED',
            error_message: 'The login credentials have changed',
          },
        },
      })

      expect(result.accepted).toBe(true)
      expect(result.webhookType).toBe('ITEM')
      expect(result.webhookCode).toBe('ERROR')
      expect(result.itemId).toBe('item-err')
      expect(result.error).toBe('The login credentials have changed')
    })

    it('should use fallback message when error object lacks error_message', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'ITEM',
          webhook_code: 'ERROR',
          item_id: 'item-err-2',
          error: { error_type: 'ITEM_ERROR' },
        },
      })

      expect(result.accepted).toBe(true)
      expect(result.error).toBe('Unknown webhook error')
    })

    it('should return null error when no error field in body', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'TRANSACTIONS',
          webhook_code: 'SYNC_UPDATES_AVAILABLE',
          item_id: 'item-ok',
        },
      })

      expect(result.accepted).toBe(true)
      expect(result.error).toBeNull()
    })

    it('should handle missing item_id gracefully', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'TRANSACTIONS',
          webhook_code: 'SYNC_UPDATES_AVAILABLE',
        },
      })

      expect(result.accepted).toBe(true)
      expect(result.itemId).toBeNull()
    })

    it('should handle missing webhook_code gracefully', async () => {
      const result = await webhookHandler({
        headers: validHeaders,
        body: {
          webhook_type: 'HOLDINGS',
        },
      })

      expect(result.accepted).toBe(true)
      expect(result.webhookCode).toBe('UNKNOWN')
    })
  })

  describe('input validation', () => {
    it('should throw validation error when headers is missing', async () => {
      await expect(
        webhookHandler({ body: { webhook_type: 'TRANSACTIONS' } })
      ).rejects.toThrow()
    })

    it('should throw validation error when body is missing', async () => {
      await expect(
        webhookHandler({ headers: validHeaders })
      ).rejects.toThrow()
    })

    it('should throw validation error for non-object input', async () => {
      await expect(webhookHandler('bad-input')).rejects.toThrow()
    })

    it('should throw validation error for null input', async () => {
      await expect(webhookHandler(null)).rejects.toThrow()
    })
  })
})
