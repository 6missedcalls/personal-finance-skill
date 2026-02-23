# Tax Engine Extension Reference

> **Extension:** `tax-engine`
> **Name:** Tax Engine
> **Version:** 0.1.0
> **Description:** Tax document parsing, liability estimation, tax-loss harvesting, wash sale detection, lot selection, and quarterly estimated payment calculation.
> **Last updated:** 2026-02-23

---

## Overview

The `tax-engine` extension consolidates tax document parsing and tax strategy computation into a single OpenClaw plugin. It provides five parser tools that normalize raw tax form data (1099-B, 1099-DIV, 1099-INT, W-2, Schedule K-1) into structured canonical objects, and five calculator tools that perform deterministic tax computations (liability estimation, tax-loss harvesting candidate identification, wash sale compliance checking, lot selection comparison, and quarterly estimated payment scheduling).

All ten tools are **READ-ONLY**. Parsers accept raw form field values and return validated, structured output. Calculators accept structured financial data and return deterministic numeric results. No tool in this extension modifies external state, places trades, or initiates transfers. Any action arising from tax-engine analysis (such as executing a tax-loss harvest) must go through the appropriate execution extension (e.g., `alpaca-trading`) with policy checks enforced by `finance-core`.

---

## Configuration

### Plugin Manifest (`openclaw.plugin.json`)

```json
{
  "id": "tax-engine",
  "name": "Tax Engine",
  "version": "0.1.0",
  "description": "Tax document parsing, liability estimation, tax-loss harvesting, wash sale detection, lot selection, and quarterly estimated payment calculation.",
  "configSchema": {
    "type": "object",
    "additionalProperties": false,
    "properties": {
      "defaultFilingStatus": {
        "type": "string",
        "enum": ["single", "married_filing_jointly", "married_filing_separately", "head_of_household"],
        "description": "Default filing status when not specified in tool calls."
      },
      "defaultState": {
        "type": "string",
        "pattern": "^[A-Z]{2}$",
        "description": "Two-letter state code for state tax calculations (e.g. CA, NY). Used when state is not specified in tool calls."
      },
      "defaultTaxYear": {
        "type": "number",
        "description": "Default tax year when not specified in tool calls."
      }
    }
  }
}
```

### Config Fields

| Field                | Type     | Required | Description                                                                                  |
|----------------------|----------|----------|----------------------------------------------------------------------------------------------|
| `defaultFilingStatus`| `string` | No       | One of `single`, `married_filing_jointly`, `married_filing_separately`, `head_of_household`. |
| `defaultState`       | `string` | No       | Two-letter state code (e.g. `CA`, `NY`) for state tax calculations.                         |
| `defaultTaxYear`     | `number` | No       | Default tax year applied when a tool call omits the `taxYear` parameter.                     |

---

## Tool Catalog

### Parsers (5 tools)

| Tool                  | Description                                                                                  | Risk Tier  |
|-----------------------|----------------------------------------------------------------------------------------------|------------|
| `tax_parse_1099b`     | Parse 1099-B data (proceeds, cost basis, wash sales, gain type).                             | READ-ONLY  |
| `tax_parse_1099div`   | Parse 1099-DIV data (ordinary/qualified dividends, capital gain distributions, foreign tax).  | READ-ONLY  |
| `tax_parse_1099int`   | Parse 1099-INT data (interest income, bond premiums, tax-exempt interest).                   | READ-ONLY  |
| `tax_parse_w2`        | Parse W-2 data (wages, withholding, Social Security, Medicare, Box 12 codes).                | READ-ONLY  |
| `tax_parse_k1`        | Parse Schedule K-1 data (partnership pass-through income, gains, deductions).                | READ-ONLY  |

### Calculators (5 tools)

| Tool                    | Description                                                                                        | Risk Tier  |
|-------------------------|----------------------------------------------------------------------------------------------------|------------|
| `tax_estimate_liability`| Calculate estimated federal and state tax liability using progressive brackets.                     | READ-ONLY  |
| `tax_find_tlh_candidates`| Identify tax-loss harvesting opportunities from current positions.                                | READ-ONLY  |
| `tax_check_wash_sales`  | Validate wash sale rule compliance across a 61-day window.                                         | READ-ONLY  |
| `tax_lot_selection`     | Compare FIFO, LIFO, and specific lot identification strategies for a proposed sale.                | READ-ONLY  |
| `tax_quarterly_estimate`| Calculate quarterly estimated tax payments with safe harbor analysis.                              | READ-ONLY  |

---

## Parser Tool Details

### 1. `tax_parse_1099b`

Parse 1099-B data (proceeds, cost basis, wash sales, gain type). Returns structured transactions with validation warnings.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string          // User identifier
  taxYear: number         // Tax year for the form
  rawData: object         // Raw form field values as key-value pairs
}
```

#### Output Schema

```typescript
{
  parsed: Form1099B       // Structured 1099-B object
  warnings: string[]      // Validation warnings (e.g. inconsistent dates, unusual values)
  missingFields: string[] // Fields expected but not found in rawData
}
```

#### Form1099B Structure

| Field                      | Type      | IRS Box   | Description                                              |
|----------------------------|-----------|-----------|----------------------------------------------------------|
| `description`              | `string`  | Box 1a    | Description of property (security name, CUSIP, etc.)     |
| `dateAcquired`             | `string`  | Box 1b    | Date acquired (ISO date or "VARIOUS")                    |
| `dateSold`                 | `string`  | Box 1c    | Date sold or disposed                                    |
| `proceeds`                 | `number`  | Box 1d    | Gross proceeds                                           |
| `costBasis`                | `number`  | Box 1e    | Cost or other basis                                      |
| `accruedMarketDiscount`    | `number`  | Box 1f    | Accrued market discount                                  |
| `washSaleLossDisallowed`   | `number`  | Box 1g    | Wash sale loss disallowed                                |
| `gainType`                 | `string`  | Box 2     | `"short"` or `"long"` (short-term vs long-term)          |
| `basisReportedToIrs`       | `boolean` | Box 3     | Whether cost basis was reported to the IRS               |
| `federalTaxWithheld`       | `number`  | Box 4     | Federal income tax withheld                              |
| `noncoveredSecurity`       | `boolean` | Box 5     | Whether the security is noncovered                       |
| `reportedGrossOrNet`       | `string`  | Box 6     | Whether proceeds are reported gross or net of commissions |
| `lossNotAllowed`           | `number`  | Box 7     | Loss not allowed based on amount in Box 1d               |
| `profitOrLossRealized`     | `number`  | Box 8     | Profit or loss realized (Section 1256 contracts)         |
| `unrealizedProfitOrLoss`   | `number`  | Box 9     | Unrealized profit or loss on open contracts              |
| `basisOfPositions`         | `number`  | Box 10    | Aggregate basis of positions (Section 1256)              |
| `corporateObligationDiscount` | `number` | Box 11  | Original issue discount on corporate obligations         |
| `stateWithholding`         | `object`  | State     | State tax withheld, payer state number, state income     |

#### Tax Calculation Notes

- Realized gain/loss: `proceeds - costBasis - adjustments`
- Wash sale addback from `washSaleLossDisallowed` defers disallowed loss into replacement lot basis
- Covered vs noncovered (`basisReportedToIrs` / `noncoveredSecurity`) determines basis confidence and IRS reconciliation requirements

---

### 2. `tax_parse_1099div`

Parse 1099-DIV data (ordinary/qualified dividends, capital gain distributions, foreign tax). Returns structured dividend income.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object
}
```

#### Output Schema

```typescript
{
  parsed: Form1099DIV
  warnings: string[]
  missingFields: string[]
}
```

#### Form1099DIV Structure

| Field                                  | Type     | IRS Box   | Description                                             |
|----------------------------------------|----------|-----------|---------------------------------------------------------|
| `totalOrdinaryDividends`               | `number` | Box 1a    | Total ordinary dividends                                |
| `qualifiedDividends`                   | `number` | Box 1b    | Qualified dividends (eligible for preferential rates)   |
| `totalCapitalGainDistributions`        | `number` | Box 2a    | Total capital gain distributions                        |
| `unrecapSec1250Gain`                   | `number` | Box 2b    | Unrecaptured Section 1250 gain                          |
| `section1202Gain`                      | `number` | Box 2c    | Section 1202 gain (qualified small business stock)      |
| `collectibles28RateGain`              | `number` | Box 2d    | Collectibles (28%) rate gain                            |
| `nondividendDistributions`             | `number` | Box 3     | Nondividend distributions (return of capital)           |
| `federalTaxWithheld`                   | `number` | Box 4     | Federal income tax withheld                             |
| `section199aDividends`                 | `number` | Box 5     | Section 199A dividends (qualified REIT dividends)       |
| `foreignTaxPaid`                       | `number` | Box 7     | Foreign tax paid                                        |
| `foreignCountry`                       | `string` | Box 8     | Foreign country or U.S. possession                      |
| `cashLiquidationDistributions`         | `number` | Box 9     | Cash liquidation distributions                          |
| `noncashLiquidationDistributions`      | `number` | Box 10    | Noncash liquidation distributions                       |
| `exemptInterestDividends`              | `number` | Box 11    | Exempt-interest dividends                               |
| `specifiedPrivateActivityBondDividends`| `number` | Box 12    | Specified private activity bond interest dividends      |
| `stateWithholding`                     | `object` | State     | State tax withheld and related fields                   |

#### Tax Calculation Notes

- Box 1a feeds ordinary dividend income on the return
- Box 1b is a subset of 1a eligible for qualified dividend tax rates (0%/15%/20%)
- Boxes 2a-2d feed Schedule D / Form 8949 logic
- Box 3 is return of capital (reduces cost basis; not taxable until basis is exhausted)
- Box 7 supports foreign tax credit calculation

---

### 3. `tax_parse_1099int`

Parse 1099-INT data (interest income, bond premiums, tax-exempt interest). Returns structured interest income.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object
}
```

#### Output Schema

```typescript
{
  parsed: Form1099INT
  warnings: string[]
  missingFields: string[]
}
```

#### Form1099INT Structure

| Field                              | Type     | IRS Box   | Description                                              |
|------------------------------------|----------|-----------|----------------------------------------------------------|
| `interestIncome`                   | `number` | Box 1     | Taxable interest income                                  |
| `earlyWithdrawalPenalty`           | `number` | Box 2     | Early withdrawal penalty                                 |
| `usSavingsBondInterest`            | `number` | Box 3     | Interest on U.S. savings bonds and Treasury obligations  |
| `federalTaxWithheld`              | `number` | Box 4     | Federal income tax withheld                              |
| `investmentExpenses`               | `number` | Box 5     | Investment expenses                                      |
| `foreignTaxPaid`                   | `number` | Box 6     | Foreign tax paid                                         |
| `foreignCountry`                   | `string` | Box 7     | Foreign country or U.S. possession                       |
| `taxExemptInterest`                | `number` | Box 8     | Tax-exempt interest                                      |
| `specifiedPrivateActivityBondInterest` | `number` | Box 9 | Specified private activity bond interest                 |
| `marketDiscount`                   | `number` | Box 10    | Market discount                                          |
| `bondPremium`                      | `number` | Box 11    | Bond premium                                             |
| `bondPremiumTreasury`              | `number` | Box 12    | Bond premium on Treasury obligations                     |
| `bondPremiumTaxExempt`             | `number` | Box 13    | Bond premium on tax-exempt bond                          |
| `taxExemptBondCusip`               | `string` | Box 14    | Tax-exempt and tax credit bond CUSIP number              |
| `stateWithholding`                 | `object` | Box 15-17 | State, state identification number, state tax withheld   |

#### Tax Calculation Notes

- Box 1 is taxable interest income
- Box 3 is U.S. Treasury interest (federally taxable, often state-exempt)
- Box 8 is tax-exempt interest (informational for return computation, may affect other calculations like Social Security taxability)
- Bond premium/discount boxes adjust effective interest income and basis handling

---

### 4. `tax_parse_w2`

Parse W-2 data (wages, withholding, Social Security, Medicare, Box 12 codes). Returns structured wage/tax statement.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object
}
```

#### Output Schema

```typescript
{
  parsed: FormW2
  warnings: string[]
  missingFields: string[]
}
```

#### FormW2 Structure

| Field                     | Type       | IRS Box   | Description                                              |
|---------------------------|------------|-----------|----------------------------------------------------------|
| `wagesTipsOtherComp`     | `number`   | Box 1     | Wages, tips, other compensation                          |
| `federalTaxWithheld`     | `number`   | Box 2     | Federal income tax withheld                              |
| `socialSecurityWages`     | `number`   | Box 3     | Social Security wages                                    |
| `socialSecurityTaxWithheld` | `number` | Box 4     | Social Security tax withheld                             |
| `medicareWagesAndTips`    | `number`   | Box 5     | Medicare wages and tips                                  |
| `medicareTaxWithheld`     | `number`   | Box 6     | Medicare tax withheld                                    |
| `socialSecurityTips`      | `number`   | Box 7     | Social Security tips                                     |
| `allocatedTips`           | `number`   | Box 8     | Allocated tips                                           |
| `dependentCareBenefits`   | `number`   | Box 10    | Dependent care benefits                                  |
| `nonqualifiedPlans`       | `number`   | Box 11    | Nonqualified plans                                       |
| `box12Codes`              | `Array<{code: string, amount: number}>` | Box 12 | Box 12 coded entries (e.g. D, DD, W, AA, BB) |
| `box13Flags`              | `object`   | Box 13    | Statutory employee, retirement plan, third-party sick pay |
| `box14Other`              | `string`   | Box 14    | Other (employer-specific reporting)                      |
| `stateEmployerId`         | `string`   | Box 15    | State and employer's state ID number                     |
| `stateWages`              | `number`   | Box 16    | State wages, tips, etc.                                  |
| `stateIncomeTax`          | `number`   | Box 17    | State income tax                                         |
| `localWages`              | `number`   | Box 18    | Local wages, tips, etc.                                  |
| `localIncomeTax`          | `number`   | Box 19    | Local income tax                                         |
| `localityName`            | `string`   | Box 20    | Locality name                                            |

#### Tax Calculation Notes

- Box 1 and Box 2 anchor federal wage tax computation
- Boxes 3-6 are used for payroll tax reconciliation and Social Security/Medicare wage base checks
- Box 12 codes impact retirement contribution limits (code D = 401k deferrals, DD = employer health cost, W = HSA contributions, etc.)
- Box 13 flags affect Schedule C treatment (statutory employee) and retirement deduction eligibility

---

### 5. `tax_parse_k1`

Parse Schedule K-1 data (partnership pass-through income, gains, deductions, guaranteed payments). Returns structured K-1.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object
}
```

#### Output Schema

```typescript
{
  parsed: FormK1
  warnings: string[]
  missingFields: string[]
}
```

#### FormK1 Structure

| Field                          | Type     | Description                                              |
|--------------------------------|----------|----------------------------------------------------------|
| `ordinaryBusinessIncomeLoss`   | `number` | Ordinary business income (loss)                          |
| `netRentalRealEstateIncome`    | `number` | Net rental real estate income (loss)                     |
| `otherNetRentalIncome`         | `number` | Other net rental income (loss)                           |
| `guaranteedPayments`           | `number` | Guaranteed payments to partner                           |
| `interestIncome`               | `number` | Interest income                                          |
| `ordinaryDividends`            | `number` | Ordinary dividends                                       |
| `qualifiedDividends`           | `number` | Qualified dividends                                      |
| `netShortTermCapitalGainLoss`  | `number` | Net short-term capital gain (loss)                       |
| `netLongTermCapitalGainLoss`   | `number` | Net long-term capital gain (loss)                        |
| `section1231GainLoss`          | `number` | Net Section 1231 gain (loss)                             |
| `otherIncome`                  | `number` | Other income (loss)                                      |
| `selfEmploymentEarnings`       | `number` | Net earnings from self-employment                        |
| `partnerCapitalAccount`        | `object` | Beginning/ending capital account, contributions, withdrawals |
| `partnerSharePercentages`      | `object` | Profit, loss, and capital sharing percentages            |
| `partnerLiabilityShare`        | `object` | Recourse, qualified nonrecourse, nonrecourse liabilities |

#### Tax Calculation Notes

- K-1 is pass-through reporting: each amount flows to the recipient's return by character (ordinary income, capital gains, dividends, etc.)
- `guaranteedPayments` and `selfEmploymentEarnings` are subject to self-employment tax
- Attachment codes on boxes 13, 15, 16, and 20 are mandatory to correctly interpret many line items
- Capital account and liability share data are needed for at-risk and passive activity limitation calculations

---

## Calculator Tool Details

### 6. `tax_estimate_liability`

Calculate estimated federal and state tax liability using progressive brackets. Includes ordinary tax, long-term capital gains / qualified dividend tax, net investment income tax (NIIT), and self-employment tax. All calculations are deterministic.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  filingStatus: "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household"
  state?: string             // Two-letter state code; falls back to config defaultState
  income: IncomeSummary
}
```

#### IncomeSummary

```typescript
{
  wages: number                  // W-2 Box 1 total
  ordinaryDividends: number      // 1099-DIV Box 1a total
  qualifiedDividends: number     // 1099-DIV Box 1b total
  interestIncome: number         // 1099-INT Box 1 total
  taxExemptInterest: number      // 1099-INT Box 8 total (informational)
  shortTermGains: number         // Net short-term capital gains
  longTermGains: number          // Net long-term capital gains
  businessIncome: number         // Schedule C / K-1 ordinary business income
  rentalIncome: number           // Net rental income
  otherIncome: number            // Other taxable income
  totalWithholding: number       // Sum of all federal tax withheld (W-2 Box 2, 1099 Box 4, etc.)
  estimatedPayments: number      // Estimated tax payments already made
  deductions: number             // Total deductions (standard or itemized)
  foreignTaxCredit: number       // Foreign tax credit from 1099-DIV Box 7 / 1099-INT Box 6
}
```

#### Output Schema

```typescript
{
  taxYear: number
  filingStatus: string
  grossIncome: number
  adjustedGrossIncome: number
  taxableOrdinaryIncome: number
  ordinaryTax: number                // Tax on ordinary income using progressive brackets
  qualifiedDividendTax: number       // Tax on qualified dividends at preferential rates
  longTermCapitalGainsTax: number    // Tax on net long-term capital gains at preferential rates
  netInvestmentIncomeTax: number     // 3.8% NIIT on investment income above AGI threshold
  selfEmploymentTax: number          // SE tax on self-employment earnings
  totalFederalTax: number            // Sum of all federal tax components
  stateTax: number                   // Estimated state tax (if state provided)
  totalTax: number                   // Federal + state
  totalWithholding: number           // Withholding already applied
  estimatedPayments: number          // Estimated payments already made
  balanceDue: number                 // totalTax - totalWithholding - estimatedPayments
  effectiveRate: number              // totalFederalTax / grossIncome
  marginalRate: number               // Marginal ordinary income tax bracket rate
  assumptions: string[]              // List of assumptions made in the calculation
}
```

---

### 7. `tax_find_tlh_candidates`

Identify tax-loss harvesting opportunities from current positions. Ranks candidates by estimated tax savings and flags wash sale risks. All loss calculations are deterministic.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  userId: string
  positions: Array<{
    symbol: string
    totalQuantity: number
    currentPrice: number
    accountId: string
    lots: TaxLot[]
  }>
  minLoss?: number                // Minimum unrealized loss to qualify (default: $100)
  marginalRate?: number           // Marginal tax rate for savings estimate (default: 0.32)
  avoidWashSaleDays?: number      // Days to check for wash sale risk window
  recentSales?: Array<{
    symbol: string
    saleDate: string              // ISO date of recent sale
  }>
}
```

#### TaxLot

```typescript
{
  lotId: string
  purchaseDate: string            // ISO date
  quantity: number
  costBasis: number               // Per-share cost basis
  adjustedBasis?: number          // Basis after wash sale adjustments
}
```

#### Output Schema

```typescript
Array<{
  symbol: string
  lotId: string
  currentPrice: number
  costBasis: number
  unrealizedLoss: number          // Negative number representing the loss
  quantity: number
  holdingPeriod: "short" | "long"
  washSaleRisk: boolean           // True if sale would trigger wash sale based on recent activity
  estimatedTaxSavings: number     // unrealizedLoss * marginalRate (adjusted for holding period)
  rationale: string               // Human-readable explanation of the opportunity
}>
```

---

### 8. `tax_check_wash_sales`

Validate wash sale rule compliance. Checks the 61-day window (30 days before the sale, the sale date, and 30 days after the sale) for purchases of substantially identical securities. Returns violations with disallowed loss amounts.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  userId: string
  sales: Array<{
    lotId: string
    symbol: string
    saleDate: string              // ISO date
    loss: number                  // Loss amount (positive number representing the loss)
  }>
  purchases: Array<{
    lotId: string
    symbol: string
    purchaseDate: string          // ISO date
    quantity: number
    costBasis: number             // Total cost basis for the purchased lot
  }>
}
```

#### Output Schema

```typescript
{
  violations: Array<{
    saleLotId: string
    saleSymbol: string
    saleDate: string
    purchaseLotId: string
    purchaseDate: string
    disallowedLoss: number        // Amount of loss disallowed
    basisAdjustment: number       // Amount added to replacement lot basis
    windowStart: string           // Start of 61-day window (sale date - 30 days)
    windowEnd: string             // End of 61-day window (sale date + 30 days)
  }>
  totalDisallowedLoss: number     // Sum of all disallowed losses
  compliant: boolean              // True if no violations found
}
```

#### Wash Sale Rule Reference

- **Window:** 30 days before sale, sale date, 30 days after sale (61-day total)
- **Effect:** Disallowed loss is added to the cost basis of replacement shares; holding period of replacement shares may tack from the relinquished shares
- **Scope:** Must track across all taxable accounts under taxpayer control
- **Substantially identical:** Same security is clearly substantially identical; ETFs/funds/options may be substantially identical depending on exposure (facts-and-circumstances test)

---

### 9. `tax_lot_selection`

Compare FIFO, LIFO, and specific lot identification strategies for a proposed sale. Shows gain/loss breakdown and estimated tax impact for each method.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  userId: string
  symbol: string
  quantityToSell: number
  currentPrice: number
  lots: TaxLot[]                  // Available tax lots (same TaxLot structure as above)
  methods?: Array<"fifo" | "lifo" | "specific_id">  // Methods to compare (default: all three)
  marginalRate?: number           // Marginal ordinary income tax rate (default: 0.32)
  longTermRate?: number           // Long-term capital gains tax rate (default: 0.15)
}
```

#### Output Schema

```typescript
Array<{
  method: "fifo" | "lifo" | "specific_id"
  selectedLots: Array<{
    lotId: string
    quantity: number              // Quantity sold from this lot
    purchaseDate: string
    costBasis: number             // Per-share basis
    holdingPeriod: "short" | "long"
    gainLoss: number              // Gain (positive) or loss (negative) for this lot
  }>
  totalProceeds: number           // quantityToSell * currentPrice
  totalBasis: number              // Sum of cost basis for selected lots
  totalGainLoss: number           // totalProceeds - totalBasis
  shortTermGainLoss: number       // Gain/loss from short-term lots
  longTermGainLoss: number        // Gain/loss from long-term lots
  estimatedTaxImpact: number      // (shortTermGainLoss * marginalRate) + (longTermGainLoss * longTermRate)
}>
```

#### Lot Selection Methods

| Method          | Strategy                                                                                  |
|-----------------|-------------------------------------------------------------------------------------------|
| **FIFO**        | First-in, first-out. Oldest shares sold first. Default in many broker systems.            |
| **LIFO**        | Last-in, first-out. Newest shares sold first. Often yields different short/long mix.      |
| **Specific ID** | Taxpayer/broker identifies exact lots. Highest control for gain/loss and holding-period optimization. Must be documented contemporaneously by broker records. |

---

### 10. `tax_quarterly_estimate`

Calculate quarterly estimated tax payments with safe harbor analysis. Determines payment schedule, underpayment risk, and suggested next payment amount.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  filingStatus: "single" | "married_filing_jointly" | "married_filing_separately" | "head_of_household"
  projectedIncome: IncomeSummary  // Same IncomeSummary structure as tax_estimate_liability
  priorYearTax: number            // Total tax liability from the prior year
  quarterlyPaymentsMade: Array<{
    quarter: 1 | 2 | 3 | 4
    amount: number
    datePaid: string              // ISO date of payment
  }>
}
```

#### Output Schema

```typescript
{
  taxYear: number
  quarters: Array<{
    quarter: 1 | 2 | 3 | 4
    dueDate: string               // Standard due date (e.g. "2026-04-15" for Q1)
    requiredPayment: number       // Minimum payment to stay on track for safe harbor
    amountPaid: number            // Amount already paid for this quarter
    shortfall: number             // requiredPayment - amountPaid (0 if overpaid)
    status: "paid" | "partial" | "unpaid" | "upcoming"
  }>
  totalEstimatedTax: number       // Projected total tax liability for the year
  totalPaid: number               // Sum of all quarterly payments made + withholding
  totalRemaining: number          // totalEstimatedTax - totalPaid
  safeHarborMet: boolean          // Whether payments meet IRS safe harbor threshold
  underpaymentRisk: "low" | "medium" | "high"
  nextDueDate: string             // Next upcoming quarterly payment due date
  suggestedNextPayment: number    // Recommended amount for the next quarterly payment
}
```

#### Quarterly Payment Schedule

| Quarter | Standard Due Date                  |
|---------|------------------------------------|
| Q1      | April 15                           |
| Q2      | June 15                            |
| Q3      | September 15                       |
| Q4      | January 15 of the following year   |

When a due date falls on a weekend or holiday, the deadline shifts to the next business day.

#### Safe Harbor Rules

The tool evaluates safe harbor compliance using IRS guidelines:

- **100% of prior year tax:** Payments totaling at least 100% of the prior year's tax liability avoid underpayment penalties (110% if AGI exceeds $150,000 for joint filers, $75,000 for married filing separately).
- **90% of current year tax:** Payments totaling at least 90% of the current year's projected tax liability also satisfy safe harbor.
- The tool checks both thresholds and reports `safeHarborMet: true` if either is satisfied.

---

## Tax Form Field Mappings

Quick reference mapping IRS box numbers to canonical field names used across parser tools.

### 1099-B

| IRS Box  | Canonical Field              | Description                            |
|----------|------------------------------|----------------------------------------|
| Box 1a   | `description`                | Description of property                |
| Box 1b   | `dateAcquired`               | Date acquired                          |
| Box 1c   | `dateSold`                   | Date sold or disposed                  |
| Box 1d   | `proceeds`                   | Gross proceeds                         |
| Box 1e   | `costBasis`                  | Cost or other basis                    |
| Box 1f   | `accruedMarketDiscount`      | Accrued market discount                |
| Box 1g   | `washSaleLossDisallowed`     | Wash sale loss disallowed              |
| Box 2    | `gainType`                   | Short-term / long-term indicator       |
| Box 3    | `basisReportedToIrs`         | Basis reported to IRS                  |
| Box 4    | `federalTaxWithheld`         | Federal income tax withheld            |

### 1099-DIV

| IRS Box  | Canonical Field                         | Description                         |
|----------|-----------------------------------------|-------------------------------------|
| Box 1a   | `totalOrdinaryDividends`                | Total ordinary dividends            |
| Box 1b   | `qualifiedDividends`                    | Qualified dividends                 |
| Box 2a   | `totalCapitalGainDistributions`         | Total capital gain distributions    |
| Box 7    | `foreignTaxPaid`                        | Foreign tax paid                    |
| Box 11   | `exemptInterestDividends`               | Exempt-interest dividends           |

### 1099-INT

| IRS Box  | Canonical Field              | Description                            |
|----------|------------------------------|----------------------------------------|
| Box 1    | `interestIncome`             | Interest income                        |
| Box 6    | `foreignTaxPaid`             | Foreign tax paid                       |
| Box 8    | `taxExemptInterest`          | Tax-exempt interest                    |
| Box 11   | `bondPremium`                | Bond premium                           |

### W-2

| IRS Box  | Canonical Field              | Description                            |
|----------|------------------------------|----------------------------------------|
| Box 1    | `wagesTipsOtherComp`        | Wages, tips, other compensation        |
| Box 2    | `federalTaxWithheld`        | Federal income tax withheld            |
| Box 3    | `socialSecurityWages`        | Social Security wages                  |
| Box 5    | `medicareWagesAndTips`       | Medicare wages and tips                |
| Box 12   | `box12Codes`                 | Coded entries (retirement, health, HSA)|
| Box 16   | `stateWages`                 | State wages, tips, etc.                |
| Box 17   | `stateIncomeTax`             | State income tax                       |

### Schedule K-1

| Line Item                    | Canonical Field                    | Description                        |
|------------------------------|------------------------------------|------------------------------------|
| Ordinary business income     | `ordinaryBusinessIncomeLoss`       | Ordinary business income (loss)    |
| Guaranteed payments          | `guaranteedPayments`               | Guaranteed payments to partner     |
| Interest income              | `interestIncome`                   | Interest income                    |
| Qualified dividends          | `qualifiedDividends`               | Qualified dividends                |
| Net ST capital gain/loss     | `netShortTermCapitalGainLoss`      | Net short-term capital gain (loss) |
| Net LT capital gain/loss     | `netLongTermCapitalGainLoss`       | Net long-term capital gain (loss)  |
| Section 1231 gain/loss       | `section1231GainLoss`              | Net Section 1231 gain (loss)       |
| Self-employment earnings     | `selfEmploymentEarnings`           | Net SE earnings                    |

---

## Calculator Notes

### Deterministic Computation

All calculator tools produce deterministic outputs. Given the same inputs, the same outputs are always returned. The agent must never use LLM arithmetic for tax numbers -- all numeric financial outputs flow through these calculator tools.

### Assumptions

Calculator tools document their assumptions in the output `assumptions` array. Common assumptions include:

- **Standard deduction assumed** unless a specific deduction amount is provided
- **Single state of residence** -- multi-state apportionment is not supported in v0.1.0
- **No AMT calculation** -- Alternative Minimum Tax is not computed in this version
- **No credits beyond foreign tax credit** -- child tax credit, education credits, etc. are not included
- **Federal bracket rates are sourced from IRS Revenue Procedures** for the specified tax year
- **State tax calculations use simplified flat or progressive brackets** (full state-specific deduction and credit logic varies by state)
- **NIIT threshold is $200,000 (single) / $250,000 (MFJ)** per IRC Section 1411
- **Self-employment tax uses 92.35% of SE earnings** with Social Security wage base cap for the tax year

### Bracket Sources

- Federal ordinary income brackets: IRS Revenue Procedure for the applicable tax year
- Long-term capital gains / qualified dividend rates: 0%, 15%, 20% based on taxable income thresholds
- Net Investment Income Tax: 3.8% on investment income above AGI threshold (IRC Section 1411)
- Self-employment tax: 15.3% (12.4% Social Security + 2.9% Medicare) with applicable wage base

---

## Usage Notes

### Typical Workflow

The standard tax analysis workflow follows this sequence:

1. **Parse tax documents** -- Use parser tools (`tax_parse_1099b`, `tax_parse_1099div`, `tax_parse_1099int`, `tax_parse_w2`, `tax_parse_k1`) to normalize raw form data into structured objects. Review `warnings` and `missingFields` in each output.

2. **Estimate tax liability** -- Feed parsed data into `tax_estimate_liability` to compute projected federal and state tax. Review `assumptions` and `balanceDue`.

3. **Find TLH opportunities** -- Use `tax_find_tlh_candidates` with current positions (from `alpaca-trading` or `ibkr-portfolio`) to identify harvesting candidates ranked by estimated tax savings.

4. **Check wash sale compliance** -- Before executing any TLH sale, run `tax_check_wash_sales` with the proposed sales and recent purchase history to verify no wash sale violations would occur.

5. **Compare lot selection strategies** -- Use `tax_lot_selection` to compare FIFO, LIFO, and specific identification for any proposed sale, selecting the method with the best after-tax outcome.

6. **Calculate quarterly estimates** -- Use `tax_quarterly_estimate` to determine payment schedule, safe harbor status, and suggested next payment amount.

### Integration with Other Extensions

| Extension          | Integration Point                                                                            |
|--------------------|----------------------------------------------------------------------------------------------|
| `finance-core`     | Store parsed tax data via `finance.upsert_snapshot`. Log recommendations via `finance.log_decision_packet`. Run `finance.evaluate_policy` before any tax-motivated trades. |
| `alpaca-trading`   | Retrieve current positions for TLH analysis. Execute harvesting trades after policy approval. |
| `ibkr-portfolio`   | Retrieve IBKR positions and trade history for TLH analysis and wash sale checking.           |
| `plaid-connect`    | Retrieve investment holdings and transactions for supplemental position data.                |

### Disclaimer Requirement

Every response containing a tax recommendation must include:

> **This is not tax advice.** This analysis is generated by an automated system based on the data available. Consult a qualified tax professional before making tax-related decisions.

---

## Cross-References

| Document                                           | Relevance                                                                   |
|----------------------------------------------------|-----------------------------------------------------------------------------|
| `references/api-irs-tax-forms.md`                  | IRS form schemas, box field definitions, wash sale rules, lot selection methods, MeF overview, estimated tax schedule |
| `references/data-models-and-schemas.md`            | Canonical data models for `TaxLot`, `Position`, `IncomeSummary`, and other shared types |
| `references/risk-and-policy-guardrails.md`         | Policy engine rules, approval tiers, non-negotiable hard rules (deterministic computation, disclaimer requirements) |
| `references/api-openclaw-extension-patterns.md`    | Plugin manifest structure, tool registration, config schema validation      |
| `references/api-alpaca-trading.md`                 | Alpaca position and order endpoints used in TLH execution workflows         |
| `references/api-ibkr-client-portal.md`             | IBKR position and trade endpoints used for portfolio data in TLH analysis   |
