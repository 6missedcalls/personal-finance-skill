/**
 * Tax Engine Extension — OpenClaw tool registration.
 * Combines tax document parsing and tax strategy tools.
 */

import { parse1099B } from './tools/parse-1099b.js'
import { parse1099DIV } from './tools/parse-1099div.js'
import { parse1099INT } from './tools/parse-1099int.js'
import { parseW2 } from './tools/parse-w2.js'
import { parseK1 } from './tools/parse-k1.js'
import { estimateLiability } from './tools/estimate-liability.js'
import { findTlhCandidates } from './tools/find-tlh-candidates.js'
import { checkWashSalesHandler } from './tools/check-wash-sales.js'
import { lotSelection } from './tools/lot-selection.js'
import { quarterlyEstimate } from './tools/quarterly-estimate.js'

// ─── JSON Schema Fragments ──────────────────────────────────────────

const parseFormInputSchema = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    userId: { type: 'string' as const, description: 'User identifier' },
    taxYear: { type: 'number' as const, description: 'Tax year (e.g. 2025)' },
    rawData: { type: 'object' as const, description: 'Raw form data with field values' },
  },
  required: ['userId', 'taxYear', 'rawData'],
}

const incomeSummarySchema = {
  type: 'object' as const,
  additionalProperties: false,
  properties: {
    wages: { type: 'number' as const },
    ordinaryDividends: { type: 'number' as const },
    qualifiedDividends: { type: 'number' as const },
    interestIncome: { type: 'number' as const },
    taxExemptInterest: { type: 'number' as const },
    shortTermGains: { type: 'number' as const },
    longTermGains: { type: 'number' as const },
    businessIncome: { type: 'number' as const },
    rentalIncome: { type: 'number' as const },
    otherIncome: { type: 'number' as const },
    totalWithholding: { type: 'number' as const },
    estimatedPayments: { type: 'number' as const },
    deductions: { type: 'number' as const },
    foreignTaxCredit: { type: 'number' as const },
  },
  required: [
    'wages', 'ordinaryDividends', 'qualifiedDividends', 'interestIncome',
    'taxExemptInterest', 'shortTermGains', 'longTermGains', 'businessIncome',
    'rentalIncome', 'otherIncome', 'totalWithholding', 'estimatedPayments',
    'deductions', 'foreignTaxCredit',
  ],
}

const taxLotSchema = {
  type: 'object' as const,
  properties: {
    id: { type: 'string' as const },
    symbol: { type: 'string' as const },
    dateAcquired: { type: 'string' as const },
    quantity: { type: 'number' as const },
    costBasisPerShare: { type: 'number' as const },
    totalCostBasis: { type: 'number' as const },
    adjustedBasis: { type: 'number' as const },
    washSaleAdjustment: { type: 'number' as const },
    accountId: { type: 'string' as const },
  },
  required: ['id', 'symbol', 'dateAcquired', 'quantity', 'costBasisPerShare', 'totalCostBasis', 'adjustedBasis', 'washSaleAdjustment', 'accountId'],
}

// ─── Tool Definitions ───────────────────────────────────────────────

const tools = [
  {
    name: 'tax_parse_1099b',
    description: 'Parse 1099-B data (proceeds, cost basis, wash sales, gain type). Returns structured transactions with validation warnings.',
    input_schema: parseFormInputSchema,
    handler: async (input: Record<string, unknown>) => parse1099B(input as any),
  },
  {
    name: 'tax_parse_1099div',
    description: 'Parse 1099-DIV data (ordinary/qualified dividends, capital gain distributions, foreign tax). Returns structured dividend income.',
    input_schema: parseFormInputSchema,
    handler: async (input: Record<string, unknown>) => parse1099DIV(input as any),
  },
  {
    name: 'tax_parse_1099int',
    description: 'Parse 1099-INT data (interest income, bond premiums, tax-exempt interest). Returns structured interest income.',
    input_schema: parseFormInputSchema,
    handler: async (input: Record<string, unknown>) => parse1099INT(input as any),
  },
  {
    name: 'tax_parse_w2',
    description: 'Parse W-2 data (wages, withholding, Social Security, Medicare, Box 12 codes). Returns structured wage/tax statement.',
    input_schema: parseFormInputSchema,
    handler: async (input: Record<string, unknown>) => parseW2(input as any),
  },
  {
    name: 'tax_parse_k1',
    description: 'Parse Schedule K-1 data (partnership pass-through income, gains, deductions, guaranteed payments). Returns structured K-1.',
    input_schema: parseFormInputSchema,
    handler: async (input: Record<string, unknown>) => parseK1(input as any),
  },
  {
    name: 'tax_estimate_liability',
    description: 'Calculate estimated federal and state tax liability using progressive brackets. Includes ordinary tax, LTCG/qualified dividend tax, NIIT, and self-employment tax. All calculations are deterministic.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        userId: { type: 'string' as const },
        taxYear: { type: 'number' as const },
        filingStatus: { type: 'string' as const, enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'] },
        state: { type: 'string' as const, description: 'Two-letter state code (optional)' },
        income: incomeSummarySchema,
      },
      required: ['userId', 'taxYear', 'filingStatus', 'income'],
    },
    handler: async (input: Record<string, unknown>) => estimateLiability(input as any),
  },
  {
    name: 'tax_find_tlh_candidates',
    description: 'Identify tax-loss harvesting opportunities from current positions. Ranks by estimated tax savings and flags wash sale risks. All loss calculations are deterministic.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        userId: { type: 'string' as const },
        positions: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              symbol: { type: 'string' as const },
              totalQuantity: { type: 'number' as const },
              currentPrice: { type: 'number' as const },
              accountId: { type: 'string' as const },
              lots: { type: 'array' as const, items: taxLotSchema },
            },
          },
        },
        minLoss: { type: 'number' as const, description: 'Minimum unrealized loss threshold (default: $100)' },
        marginalRate: { type: 'number' as const, description: 'Marginal tax rate (default: 0.32)' },
        avoidWashSaleDays: { type: 'number' as const },
        recentSales: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              symbol: { type: 'string' as const },
              saleDate: { type: 'string' as const },
            },
          },
        },
      },
      required: ['userId', 'positions'],
    },
    handler: async (input: Record<string, unknown>) => findTlhCandidates(input as any),
  },
  {
    name: 'tax_check_wash_sales',
    description: 'Validate wash sale rule compliance. Checks 61-day window (30 days before/after sale) for substantially identical security purchases. Returns violations with disallowed loss amounts.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        userId: { type: 'string' as const },
        sales: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              lotId: { type: 'string' as const },
              symbol: { type: 'string' as const },
              saleDate: { type: 'string' as const },
              loss: { type: 'number' as const },
            },
            required: ['lotId', 'symbol', 'saleDate', 'loss'],
          },
        },
        purchases: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              lotId: { type: 'string' as const },
              symbol: { type: 'string' as const },
              purchaseDate: { type: 'string' as const },
              quantity: { type: 'number' as const },
              costBasis: { type: 'number' as const },
            },
            required: ['lotId', 'symbol', 'purchaseDate', 'quantity', 'costBasis'],
          },
        },
      },
      required: ['userId', 'sales', 'purchases'],
    },
    handler: async (input: Record<string, unknown>) => checkWashSalesHandler(input as any),
  },
  {
    name: 'tax_lot_selection',
    description: 'Compare FIFO, LIFO, and specific lot identification strategies for a proposed sale. Shows gain/loss breakdown and estimated tax impact for each method.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        userId: { type: 'string' as const },
        symbol: { type: 'string' as const },
        quantityToSell: { type: 'number' as const },
        currentPrice: { type: 'number' as const },
        lots: { type: 'array' as const, items: taxLotSchema },
        methods: { type: 'array' as const, items: { type: 'string' as const, enum: ['fifo', 'lifo', 'specific_id'] } },
        marginalRate: { type: 'number' as const, description: 'Marginal ordinary income rate (default: 0.32)' },
        longTermRate: { type: 'number' as const, description: 'Long-term capital gains rate (default: 0.15)' },
      },
      required: ['userId', 'symbol', 'quantityToSell', 'currentPrice', 'lots'],
    },
    handler: async (input: Record<string, unknown>) => lotSelection(input as any),
  },
  {
    name: 'tax_quarterly_estimate',
    description: 'Calculate quarterly estimated tax payments with safe harbor analysis. Determines payment schedule, underpayment risk, and suggested next payment amount.',
    input_schema: {
      type: 'object' as const,
      additionalProperties: false,
      properties: {
        userId: { type: 'string' as const },
        taxYear: { type: 'number' as const },
        filingStatus: { type: 'string' as const, enum: ['single', 'married_filing_jointly', 'married_filing_separately', 'head_of_household'] },
        projectedIncome: incomeSummarySchema,
        priorYearTax: { type: 'number' as const, description: 'Total tax from prior year return' },
        quarterlyPaymentsMade: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              quarter: { type: 'number' as const, enum: [1, 2, 3, 4] },
              amount: { type: 'number' as const },
              datePaid: { type: 'string' as const },
            },
            required: ['quarter', 'amount', 'datePaid'],
          },
        },
      },
      required: ['userId', 'taxYear', 'filingStatus', 'projectedIncome', 'priorYearTax', 'quarterlyPaymentsMade'],
    },
    handler: async (input: Record<string, unknown>) => quarterlyEstimate(input as any),
  },
]

// ─── Extension Export ───────────────────────────────────────────────

export default tools
