/**
 * Tax Engine Extension — OpenClaw plugin registration.
 * Combines tax document parsing and tax strategy tools.
 */

import type { OpenClawPluginApi } from "openclaw/plugin-sdk"
import { emptyPluginConfigSchema } from "openclaw/plugin-sdk"

import { parse1099B } from "./tools/parse-1099b.js"
import { parse1099DIV } from "./tools/parse-1099div.js"
import { parse1099INT } from "./tools/parse-1099int.js"
import { parseW2 } from "./tools/parse-w2.js"
import { parseK1 } from "./tools/parse-k1.js"
import { parse1040 } from "./tools/parse-1040.js"
import { parseScheduleA } from "./tools/parse-schedule-a.js"
import { parseScheduleB } from "./tools/parse-schedule-b.js"
import { parseScheduleC } from "./tools/parse-schedule-c.js"
import { parseScheduleD } from "./tools/parse-schedule-d.js"
import { parseScheduleE } from "./tools/parse-schedule-e.js"
import { parseScheduleSE } from "./tools/parse-schedule-se.js"
import { parseForm8949 } from "./tools/parse-form-8949.js"
import { parseStateReturn } from "./tools/parse-state-return.js"
import { parseForm6251 } from "./tools/parse-form-6251.js"
import { estimateLiability } from "./tools/estimate-liability.js"
import { findTlhCandidates } from "./tools/find-tlh-candidates.js"
import { checkWashSalesHandler } from "./tools/check-wash-sales.js"
import { lotSelection } from "./tools/lot-selection.js"
import { quarterlyEstimate } from "./tools/quarterly-estimate.js"
import { computeScheduleD } from "./calculators/schedule-d-computation.js"
import { computeStateTax } from "./calculators/state-tax-brackets.js"
import { computeAmt } from "./calculators/amt-calculation.js"

// --- Tool Adapter ---

function jsonResult(payload: unknown) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    details: payload,
  }
}

function makeTool(
  name: string,
  description: string,
  input_schema: Record<string, unknown>,
  handler: (input: Record<string, unknown>) => Promise<unknown>,
) {
  return {
    name,
    label: name,
    description,
    parameters: input_schema,
    async execute(_toolCallId: string, params: unknown) {
      try {
        const result = await handler(params as Record<string, unknown>)
        return jsonResult(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return jsonResult({ success: false, error: message })
      }
    },
  }
}

// ─── JSON Schema Fragments ──────────────────────────────────────────

const parseFormInputSchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    userId: { type: "string" as const, description: "User identifier" },
    taxYear: { type: "number" as const, description: "Tax year (e.g. 2025)" },
    rawData: { type: "object" as const, description: "Raw form data with field values" },
  },
  required: ["userId", "taxYear", "rawData"],
}

const incomeSummarySchema = {
  type: "object" as const,
  additionalProperties: false,
  properties: {
    wages: { type: "number" as const },
    ordinaryDividends: { type: "number" as const },
    qualifiedDividends: { type: "number" as const },
    interestIncome: { type: "number" as const },
    taxExemptInterest: { type: "number" as const },
    shortTermGains: { type: "number" as const },
    longTermGains: { type: "number" as const },
    businessIncome: { type: "number" as const },
    rentalIncome: { type: "number" as const },
    otherIncome: { type: "number" as const },
    totalWithholding: { type: "number" as const },
    estimatedPayments: { type: "number" as const },
    deductions: { type: "number" as const },
    foreignTaxCredit: { type: "number" as const },
  },
  required: [
    "wages",
    "ordinaryDividends",
    "qualifiedDividends",
    "interestIncome",
    "taxExemptInterest",
    "shortTermGains",
    "longTermGains",
    "businessIncome",
    "rentalIncome",
    "otherIncome",
    "totalWithholding",
    "estimatedPayments",
    "deductions",
    "foreignTaxCredit",
  ],
}

const taxLotSchema = {
  type: "object" as const,
  properties: {
    id: { type: "string" as const },
    symbol: { type: "string" as const },
    dateAcquired: { type: "string" as const },
    quantity: { type: "number" as const },
    costBasisPerShare: { type: "number" as const },
    totalCostBasis: { type: "number" as const },
    adjustedBasis: { type: "number" as const },
    washSaleAdjustment: { type: "number" as const },
    accountId: { type: "string" as const },
  },
  required: [
    "id",
    "symbol",
    "dateAcquired",
    "quantity",
    "costBasisPerShare",
    "totalCostBasis",
    "adjustedBasis",
    "washSaleAdjustment",
    "accountId",
  ],
}

// ─── Plugin Definition ───────────────────────────────────────────────

const plugin: { id: string; name: string; description: string; configSchema: any; register: (api: OpenClawPluginApi) => void } = {
  id: "tax-engine",
  name: "Tax Engine",
  description:
    "Tax document parsing (15 forms including 1040, Schedules A-E/SE, Form 8949, state returns, AMT), liability estimation, tax-loss harvesting, wash sale detection, lot selection, quarterly estimated payments, Schedule D computation, state tax brackets, and AMT calculation",
  configSchema: emptyPluginConfigSchema(),

  register(api: OpenClawPluginApi) {
    api.registerTool(
      makeTool(
        "tax_parse_1099b",
        "Parse 1099-B data (proceeds, cost basis, wash sales, gain type). Returns structured transactions with validation warnings.",
        parseFormInputSchema,
        async (input) => parse1099B(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_1099div",
        "Parse 1099-DIV data (ordinary/qualified dividends, capital gain distributions, foreign tax). Returns structured dividend income.",
        parseFormInputSchema,
        async (input) => parse1099DIV(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_1099int",
        "Parse 1099-INT data (interest income, bond premiums, tax-exempt interest). Returns structured interest income.",
        parseFormInputSchema,
        async (input) => parse1099INT(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_w2",
        "Parse W-2 data (wages, withholding, Social Security, Medicare, Box 12 codes). Returns structured wage/tax statement.",
        parseFormInputSchema,
        async (input) => parseW2(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_k1",
        "Parse Schedule K-1 data (partnership pass-through income, gains, deductions, guaranteed payments). Returns structured K-1.",
        parseFormInputSchema,
        async (input) => parseK1(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_estimate_liability",
        "Calculate estimated federal and state tax liability using progressive brackets. Includes ordinary tax, LTCG/qualified dividend tax, NIIT, and self-employment tax. All calculations are deterministic.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            userId: { type: "string" as const },
            taxYear: { type: "number" as const },
            filingStatus: {
              type: "string" as const,
              enum: [
                "single",
                "married_filing_jointly",
                "married_filing_separately",
                "head_of_household",
              ],
            },
            state: { type: "string" as const, description: "Two-letter state code (optional)" },
            income: incomeSummarySchema,
          },
          required: ["userId", "taxYear", "filingStatus", "income"],
        },
        async (input) => estimateLiability(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_find_tlh_candidates",
        "Identify tax-loss harvesting opportunities from current positions. Ranks by estimated tax savings and flags wash sale risks. All loss calculations are deterministic.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            userId: { type: "string" as const },
            positions: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  symbol: { type: "string" as const },
                  totalQuantity: { type: "number" as const },
                  currentPrice: { type: "number" as const },
                  accountId: { type: "string" as const },
                  lots: { type: "array" as const, items: taxLotSchema },
                },
              },
            },
            minLoss: {
              type: "number" as const,
              description: "Minimum unrealized loss threshold (default: $100)",
            },
            marginalRate: {
              type: "number" as const,
              description: "Marginal tax rate (default: 0.32)",
            },
            avoidWashSaleDays: { type: "number" as const },
            recentSales: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  symbol: { type: "string" as const },
                  saleDate: { type: "string" as const },
                },
              },
            },
          },
          required: ["userId", "positions"],
        },
        async (input) => findTlhCandidates(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_check_wash_sales",
        "Validate wash sale rule compliance. Checks 61-day window (30 days before/after sale) for substantially identical security purchases. Returns violations with disallowed loss amounts.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            userId: { type: "string" as const },
            sales: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  lotId: { type: "string" as const },
                  symbol: { type: "string" as const },
                  saleDate: { type: "string" as const },
                  loss: { type: "number" as const },
                },
                required: ["lotId", "symbol", "saleDate", "loss"],
              },
            },
            purchases: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  lotId: { type: "string" as const },
                  symbol: { type: "string" as const },
                  purchaseDate: { type: "string" as const },
                  quantity: { type: "number" as const },
                  costBasis: { type: "number" as const },
                },
                required: ["lotId", "symbol", "purchaseDate", "quantity", "costBasis"],
              },
            },
          },
          required: ["userId", "sales", "purchases"],
        },
        async (input) => checkWashSalesHandler(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_lot_selection",
        "Compare FIFO, LIFO, and specific lot identification strategies for a proposed sale. Shows gain/loss breakdown and estimated tax impact for each method.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            userId: { type: "string" as const },
            symbol: { type: "string" as const },
            quantityToSell: { type: "number" as const },
            currentPrice: { type: "number" as const },
            lots: { type: "array" as const, items: taxLotSchema },
            methods: {
              type: "array" as const,
              items: {
                type: "string" as const,
                enum: ["fifo", "lifo", "specific_id"],
              },
            },
            marginalRate: {
              type: "number" as const,
              description: "Marginal ordinary income rate (default: 0.32)",
            },
            longTermRate: {
              type: "number" as const,
              description: "Long-term capital gains rate (default: 0.15)",
            },
          },
          required: ["userId", "symbol", "quantityToSell", "currentPrice", "lots"],
        },
        async (input) => lotSelection(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_quarterly_estimate",
        "Calculate quarterly estimated tax payments with safe harbor analysis. Determines payment schedule, underpayment risk, and suggested next payment amount.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            userId: { type: "string" as const },
            taxYear: { type: "number" as const },
            filingStatus: {
              type: "string" as const,
              enum: [
                "single",
                "married_filing_jointly",
                "married_filing_separately",
                "head_of_household",
              ],
            },
            projectedIncome: incomeSummarySchema,
            priorYearTax: {
              type: "number" as const,
              description: "Total tax from prior year return",
            },
            quarterlyPaymentsMade: {
              type: "array" as const,
              items: {
                type: "object" as const,
                properties: {
                  quarter: { type: "number" as const, enum: [1, 2, 3, 4] },
                  amount: { type: "number" as const },
                  datePaid: { type: "string" as const },
                },
                required: ["quarter", "amount", "datePaid"],
              },
            },
          },
          required: [
            "userId",
            "taxYear",
            "filingStatus",
            "projectedIncome",
            "priorYearTax",
            "quarterlyPaymentsMade",
          ],
        },
        async (input) => quarterlyEstimate(input as any),
      ) as any,
    )

    // ─── New Parsers (10) ────────────────────────────────────────────

    api.registerTool(
      makeTool(
        "tax_parse_1040",
        "Parse Form 1040 data (main federal return — income, deductions, taxable income, total tax, payments, balance due). Returns structured 1040 with validation.",
        parseFormInputSchema,
        async (input) => parse1040(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_a",
        "Parse Schedule A data (itemized deductions — medical, SALT cap at $10K, mortgage interest, charitable contributions). Returns structured deductions.",
        parseFormInputSchema,
        async (input) => parseScheduleA(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_b",
        "Parse Schedule B data (interest payors, dividend payors, foreign account/trust reporting). Returns structured interest and dividend income.",
        parseFormInputSchema,
        async (input) => parseScheduleB(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_c",
        "Parse Schedule C data (self-employment — gross receipts, 23 expense categories, net profit/loss). Returns structured business income.",
        parseFormInputSchema,
        async (input) => parseScheduleC(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_d",
        "Parse Schedule D data (capital gains netting — ST/LT from Form 8949 and K-1, loss carryovers, capital gain distributions). Returns net gain/loss.",
        parseFormInputSchema,
        async (input) => parseScheduleD(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_e",
        "Parse Schedule E data (rental properties with 15 expense categories, partnership/S-Corp pass-through income). Returns rental and partnership totals.",
        parseFormInputSchema,
        async (input) => parseScheduleE(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_schedule_se",
        "Parse Schedule SE data (self-employment tax — SS/Medicare tax computation, deductible half). Returns SE tax breakdown.",
        parseFormInputSchema,
        async (input) => parseScheduleSE(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_form_8949",
        "Parse Form 8949 data (sales and dispositions — Part I short-term, Part II long-term, proceeds, basis, adjustments, gain/loss per transaction).",
        parseFormInputSchema,
        async (input) => parseForm8949(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_state_return",
        "Parse state tax return data (generic format for CA 540, NY IT-201, etc. — state AGI, deductions, tax, credits, withholding, balance due).",
        parseFormInputSchema,
        async (input) => parseStateReturn(input as any),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_parse_form_6251",
        "Parse Form 6251 data (Alternative Minimum Tax — AMTI, exemption, phaseout, tentative minimum tax, AMT due).",
        parseFormInputSchema,
        async (input) => parseForm6251(input as any),
      ) as any,
    )

    // ─── New Calculators (3) ─────────────────────────────────────────

    api.registerTool(
      makeTool(
        "tax_compute_schedule_d",
        "Compute Schedule D capital gains netting with loss carryover. Caps deduction at $3,000 ($1,500 MFS), preserves ST/LT character in carryover. All arithmetic is deterministic.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            shortTermGainLoss: { type: "number" as const, description: "Net short-term gain or loss" },
            longTermGainLoss: { type: "number" as const, description: "Net long-term gain or loss" },
            capitalLossCarryover: {
              type: "object" as const,
              properties: {
                shortTerm: { type: "number" as const },
                longTerm: { type: "number" as const },
              },
              required: ["shortTerm", "longTerm"],
            },
            capitalGainDistributions: { type: "number" as const, description: "Capital gain distributions (default: 0)" },
            filingStatus: {
              type: "string" as const,
              enum: ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"],
              description: "Filing status (affects loss cap for MFS)",
            },
          },
          required: ["shortTermGainLoss", "longTermGainLoss", "capitalLossCarryover"],
        },
        async (input) => computeScheduleD(input as any, (input as any).filingStatus),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_compute_state_tax",
        "Compute state income tax using progressive brackets for CA, NY, NJ, IL, PA, MA, TX, FL. Returns tax, effective/marginal rates, and bracket detail. All arithmetic is deterministic.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            stateCode: { type: "string" as const, description: "Two-letter state code (e.g. CA, NY, TX)" },
            taxableIncome: { type: "number" as const, description: "State taxable income" },
            filingStatus: {
              type: "string" as const,
              enum: ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"],
            },
          },
          required: ["stateCode", "taxableIncome", "filingStatus"],
        },
        async (input) => computeStateTax(
          (input as any).stateCode,
          (input as any).taxableIncome,
          (input as any).filingStatus,
        ),
      ) as any,
    )

    api.registerTool(
      makeTool(
        "tax_compute_amt",
        "Compute Alternative Minimum Tax (Form 6251). Adds back SALT, PAB interest, ISO bargain element; applies exemption with phaseout; 26%/28% rate structure. All arithmetic is deterministic.",
        {
          type: "object" as const,
          additionalProperties: false,
          properties: {
            taxableIncome: { type: "number" as const, description: "Taxable income from Form 1040 line 15" },
            filingStatus: {
              type: "string" as const,
              enum: ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"],
            },
            stateAndLocalTaxDeduction: { type: "number" as const, description: "SALT deduction to add back" },
            taxExemptInterestFromPABs: { type: "number" as const, description: "Private activity bond interest" },
            incentiveStockOptionBargainElement: { type: "number" as const, description: "ISO bargain element" },
            otherAdjustments: { type: "number" as const, description: "Other AMT adjustments" },
            regularTax: { type: "number" as const, description: "Regular tax from Form 1040" },
          },
          required: ["taxableIncome", "filingStatus", "stateAndLocalTaxDeduction", "taxExemptInterestFromPABs", "incentiveStockOptionBargainElement", "otherAdjustments", "regularTax"],
        },
        async (input) => computeAmt(input as any),
      ) as any,
    )
  },
}

export default plugin
