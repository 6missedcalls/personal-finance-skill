# Tax Engine Extension Reference

> **Extension:** `tax-engine`
> **Name:** Tax Engine
> **Version:** 0.1.0
> **Description:** Tax document parsing (Form 1040, Schedules A–E/SE, Form 8949, Form 6251, 1099-B/DIV/INT, W-2, K-1, state returns), liability estimation, capital gains netting, state tax computation, AMT calculation, tax-loss harvesting, wash sale detection, lot selection, and quarterly estimated payment calculation.
> **Last updated:** 2026-02-23

---

## Overview

The `tax-engine` extension consolidates tax document parsing and tax strategy computation into a single OpenClaw plugin. It provides **fifteen parser tools** that normalize raw tax form data (Form 1040, Schedules A–E, Schedule SE, Schedule D, Form 8949, Form 6251/AMT, 1099-B, 1099-DIV, 1099-INT, W-2, Schedule K-1, and generic state returns) into structured canonical objects, and **eight calculator tools** that perform deterministic tax computations (liability estimation, capital gains netting, state income tax, Alternative Minimum Tax, tax-loss harvesting candidate identification, wash sale compliance checking, lot selection comparison, and quarterly estimated payment scheduling).

All twenty-three tools are **READ-ONLY**. Parsers accept raw form field values and return validated, structured output. Calculators accept structured financial data and return deterministic numeric results. No tool in this extension modifies external state, places trades, or initiates transfers. Any action arising from tax-engine analysis (such as executing a tax-loss harvest) must go through the appropriate execution extension (e.g., `alpaca-trading`) with policy checks enforced by `finance-core`.

---

## Configuration

### Plugin Manifest (`openclaw.plugin.json`)

```json
{
  "id": "tax-engine",
  "name": "Tax Engine",
  "version": "0.1.0",
  "description": "Tax document parsing (Form 1040, Schedules A-E/SE/D, Form 8949, Form 6251, 1099s, W-2, K-1, state returns), liability estimation, capital gains netting, state tax, AMT, tax-loss harvesting, wash sale detection, lot selection, and quarterly estimated payments.",
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

### Parsers (15 tools)

| #  | Tool                       | Description                                                                                  | Risk Tier  |
|----|----------------------------|----------------------------------------------------------------------------------------------|------------|
| 1  | `tax_parse_1099b`          | Parse 1099-B data (proceeds, cost basis, wash sales, gain type).                             | READ-ONLY  |
| 2  | `tax_parse_1099div`        | Parse 1099-DIV data (ordinary/qualified dividends, capital gain distributions, foreign tax).  | READ-ONLY  |
| 3  | `tax_parse_1099int`        | Parse 1099-INT data (interest income, bond premiums, tax-exempt interest).                   | READ-ONLY  |
| 4  | `tax_parse_w2`             | Parse W-2 data (wages, withholding, Social Security, Medicare, Box 12 codes).                | READ-ONLY  |
| 5  | `tax_parse_k1`             | Parse Schedule K-1 data (partnership pass-through income, gains, deductions).                | READ-ONLY  |
| 6  | `tax_parse_1040`           | Parse Form 1040 (main individual tax return — income, deductions, tax, payments).            | READ-ONLY  |
| 7  | `tax_parse_schedule_a`     | Parse Schedule A (itemized deductions: medical, SALT, mortgage interest, charitable).        | READ-ONLY  |
| 8  | `tax_parse_schedule_b`     | Parse Schedule B (interest and ordinary dividend detail, foreign account reporting).         | READ-ONLY  |
| 9  | `tax_parse_schedule_c`     | Parse Schedule C (self-employment profit/loss: gross receipts, expenses, net income).        | READ-ONLY  |
| 10 | `tax_parse_schedule_d`     | Parse Schedule D (capital gains and losses netting, carryover, tax computation method).      | READ-ONLY  |
| 11 | `tax_parse_schedule_e`     | Parse Schedule E (rental/royalty income, partnership/S-Corp pass-through income).            | READ-ONLY  |
| 12 | `tax_parse_schedule_se`    | Parse Schedule SE (self-employment tax: SS, Medicare, additional Medicare, deductible half).  | READ-ONLY  |
| 13 | `tax_parse_form_8949`      | Parse Form 8949 (sales and dispositions — short-term Part I, long-term Part II).             | READ-ONLY  |
| 14 | `tax_parse_state_return`   | Parse generic state return data (CA 540, NY IT-201, etc. — state AGI, tax, balance due).     | READ-ONLY  |
| 15 | `tax_parse_form_6251`      | Parse Form 6251 (Alternative Minimum Tax — AMTI, exemptions, tentative/actual AMT).         | READ-ONLY  |

### Calculators (8 tools)

| #  | Tool                       | Description                                                                                        | Risk Tier  |
|----|----------------------------|----------------------------------------------------------------------------------------------------|------------|
| 16 | `tax_estimate_liability`   | Calculate estimated federal and state tax liability using progressive brackets.                     | READ-ONLY  |
| 17 | `tax_find_tlh_candidates`  | Identify tax-loss harvesting opportunities from current positions.                                  | READ-ONLY  |
| 18 | `tax_check_wash_sales`     | Validate wash sale rule compliance across a 61-day window.                                         | READ-ONLY  |
| 19 | `tax_lot_selection`        | Compare FIFO, LIFO, and specific lot identification strategies for a proposed sale.                | READ-ONLY  |
| 20 | `tax_quarterly_estimate`   | Calculate quarterly estimated tax payments with safe harbor analysis.                              | READ-ONLY  |
| 21 | `tax_compute_schedule_d`   | Compute Schedule D capital gain/loss netting, $3,000 loss cap, and carryover character.            | READ-ONLY  |
| 22 | `tax_compute_state_tax`    | Compute state income tax for supported states (CA, NY, NJ, IL, PA, MA, TX, FL).                   | READ-ONLY  |
| 23 | `tax_compute_amt`          | Compute Alternative Minimum Tax with exemption phaseout and two-tier rate structure.               | READ-ONLY  |

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

### 6. `tax_parse_1040`

Parse Form 1040 (main individual income tax return). Extracts income lines 1-9, adjustments, AGI, deductions, taxable income, total tax, payments, and balance due/refund.

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
  parsed: Form1040
  warnings: string[]
  missingFields: string[]
}
```

#### Form1040 Structure

| Field                          | Type     | IRS Line | Description                                     |
|--------------------------------|----------|----------|-------------------------------------------------|
| `filingStatus`                 | `string` | Header   | Filing status (single, MFJ, MFS, HoH)          |
| `taxYear`                      | `number` | Header   | Tax year                                        |
| `firstName`                    | `string` | Header   | Taxpayer first name                             |
| `lastName`                     | `string` | Header   | Taxpayer last name                              |
| `ssn`                          | `string` | Header   | Social Security number                          |
| `wages`                        | `number` | Line 1a  | Wages, salaries, tips                           |
| `taxExemptInterest`            | `number` | Line 2a  | Tax-exempt interest                             |
| `taxableInterest`              | `number` | Line 2b  | Taxable interest                                |
| `qualifiedDividends`           | `number` | Line 3a  | Qualified dividends                             |
| `ordinaryDividends`            | `number` | Line 3b  | Ordinary dividends                              |
| `iraDistributions`             | `number` | Line 4a  | IRA distributions                               |
| `taxableIraDistributions`      | `number` | Line 4b  | Taxable IRA distributions                       |
| `pensions`                     | `number` | Line 5a  | Pensions and annuities                          |
| `taxablePensions`              | `number` | Line 5b  | Taxable pensions                                |
| `socialSecurity`               | `number` | Line 6a  | Social Security benefits                        |
| `taxableSocialSecurity`        | `number` | Line 6b  | Taxable Social Security                         |
| `capitalGainOrLoss`            | `number` | Line 7   | Capital gain or loss (from Schedule D)          |
| `otherIncome`                  | `number` | Line 8   | Other income                                    |
| `totalIncome`                  | `number` | Line 9   | Total income                                    |
| `adjustmentsToIncome`          | `number` | Line 10  | Adjustments to income                           |
| `adjustedGrossIncome`          | `number` | Line 11  | Adjusted gross income                           |
| `standardOrItemizedDeduction`  | `number` | Line 12  | Standard or itemized deduction                  |
| `qualifiedBusinessDeduction`   | `number` | Line 13  | Qualified business income deduction (Sec 199A)  |
| `totalDeductions`              | `number` | Line 14  | Total deductions                                |
| `taxableIncome`                | `number` | Line 15  | Taxable income                                  |
| `totalTax`                     | `number` | Line 24  | Total tax                                       |
| `totalPayments`                | `number` | Line 33  | Total payments                                  |
| `amountOwed`                   | `number` | Line 37  | Amount owed                                     |
| `overpaid`                     | `number` | Line 34  | Overpayment (refund)                            |

---

### 7. `tax_parse_schedule_a`

Parse Schedule A (itemized deductions). Computes medical deduction threshold (7.5% of AGI), SALT cap ($10,000), and charitable contribution subtotals.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object   // Must include `agi` or `adjusted_gross_income` for threshold computation
}
```

#### Output Schema

```typescript
{
  parsed: ScheduleA
  warnings: string[]
  missingFields: string[]
}
```

#### ScheduleA Structure

| Field                          | Type     | IRS Line | Description                                     |
|--------------------------------|----------|----------|-------------------------------------------------|
| `taxYear`                      | `number` | —        | Tax year                                        |
| `medicalAndDentalExpenses`     | `number` | Line 1   | Medical and dental expenses                     |
| `medicalThreshold`             | `number` | Line 3   | 7.5% of AGI threshold                          |
| `deductibleMedical`            | `number` | Line 4   | Deductible medical (excess over threshold)      |
| `stateAndLocalTaxes`           | `number` | Line 5a-d| State and local taxes (pre-cap)                 |
| `saltDeductionCapped`          | `number` | Line 5e  | SALT deduction (capped at $10,000)              |
| `homeInterest`                 | `number` | Line 8   | Home mortgage interest                          |
| `charitableCashContributions`  | `number` | Line 11  | Charitable cash contributions                   |
| `charitableNonCash`            | `number` | Line 12  | Charitable non-cash contributions               |
| `charitableCarryover`          | `number` | Line 13  | Charitable carryover from prior year            |
| `totalCharitable`              | `number` | Line 14  | Total charitable contributions                  |
| `casualtyAndTheftLosses`       | `number` | Line 15  | Casualty and theft losses                       |
| `otherItemizedDeductions`      | `number` | Line 16  | Other itemized deductions                       |
| `totalItemizedDeductions`      | `number` | Line 17  | Total itemized deductions                       |

#### Validation Notes

- SALT is automatically capped at $10,000 with a warning if the raw amount exceeds the cap
- Charitable cash contributions exceeding 60% of AGI trigger a carryover warning
- Medical deduction = max(0, expenses - 7.5% of AGI)

---

### 8. `tax_parse_schedule_b`

Parse Schedule B (interest and ordinary dividends). Handles individual payor entries, computed totals, and foreign account (FBAR/FATCA) reporting.

**Risk Tier:** READ-ONLY (parsing)

#### Input Schema

```typescript
{
  userId: string
  taxYear: number
  rawData: object
}
```

#### ScheduleB Structure

| Field                      | Type              | Description                                       |
|----------------------------|-------------------|---------------------------------------------------|
| `taxYear`                  | `number`          | Tax year                                          |
| `interestPayors`           | `Array<{name, amount}>` | Individual interest payor entries            |
| `totalInterest`            | `number`          | Total interest (computed from payors or provided)  |
| `dividendPayors`           | `Array<{name, amount}>` | Individual dividend payor entries            |
| `totalOrdinaryDividends`   | `number`          | Total ordinary dividends                           |
| `hasForeignAccountOrTrust` | `boolean`         | Part III — foreign account or trust indicator      |
| `foreignCountries`         | `string[]`        | List of foreign countries                          |

---

### 9. `tax_parse_schedule_c`

Parse Schedule C (profit or loss from business / self-employment). Computes gross profit, gross income, total expenses, and net profit/loss from 23 expense categories.

**Risk Tier:** READ-ONLY (parsing)

#### ScheduleC Structure

| Field                     | Type              | Description                                      |
|---------------------------|-------------------|--------------------------------------------------|
| `taxYear`                 | `number`          | Tax year                                         |
| `businessName`            | `string`          | Business name                                    |
| `principalBusinessCode`   | `string`          | NAICS code                                       |
| `businessEin`             | `string`          | Business EIN                                     |
| `accountingMethod`        | `string`          | `"cash"`, `"accrual"`, or `"other"`              |
| `grossReceipts`           | `number`          | Gross receipts or sales                          |
| `returnsAndAllowances`    | `number`          | Returns and allowances                           |
| `costOfGoodsSold`         | `number`          | Cost of goods sold                               |
| `grossProfit`             | `number`          | Computed: receipts - returns - COGS              |
| `otherIncome`             | `number`          | Other income                                     |
| `grossIncome`             | `number`          | Computed: grossProfit + otherIncome              |
| `expenses`                | `ScheduleCExpenses` | 23 line-item expense categories                |
| `totalExpenses`           | `number`          | Sum of all expenses                              |
| `netProfitOrLoss`         | `number`          | Computed: grossIncome - totalExpenses            |

#### ScheduleCExpenses Fields

`advertising`, `carAndTruckExpenses`, `commissions`, `contractLabor`, `depletion`, `depreciation`, `employeeBenefits`, `insurance`, `interestMortgage`, `interestOther`, `legalAndProfessional`, `officeExpense`, `pensionAndProfitSharing`, `rentVehicles`, `rentOther`, `repairs`, `supplies`, `taxesAndLicenses`, `travel`, `meals`, `utilities`, `wages`, `otherExpenses`

---

### 10. `tax_parse_schedule_d`

Parse Schedule D (capital gains and losses). Nets short-term and long-term components including Form 8949 data, Schedule K-1 pass-through, capital gain distributions, and loss carryovers. Determines tax computation method.

**Risk Tier:** READ-ONLY (parsing)

#### ScheduleD Structure

| Field                              | Type     | Description                                           |
|------------------------------------|----------|-------------------------------------------------------|
| `taxYear`                          | `number` | Tax year                                              |
| `shortTermFromForm8949`            | `number` | Short-term gains/losses from Form 8949                |
| `shortTermFromScheduleK1`          | `number` | Short-term gains/losses from Schedule K-1             |
| `shortTermCapitalLossCarryover`    | `number` | Short-term capital loss carryover (negative)          |
| `netShortTermGainLoss`             | `number` | Computed net short-term total                         |
| `longTermFromForm8949`             | `number` | Long-term gains/losses from Form 8949                 |
| `longTermFromScheduleK1`           | `number` | Long-term gains/losses from Schedule K-1              |
| `longTermCapitalGainDistributions` | `number` | Long-term capital gain distributions                  |
| `longTermCapitalLossCarryover`     | `number` | Long-term capital loss carryover (negative)           |
| `netLongTermGainLoss`              | `number` | Computed net long-term total                          |
| `netGainLoss`                      | `number` | Net of ST + LT                                       |
| `qualifiesForExceptionToForm4952`  | `boolean`| Exception to investment interest limitation           |
| `taxComputationMethod`             | `string` | `"regular"`, `"schedule_d_worksheet"`, or `"qualified_dividends_worksheet"` |

#### Validation Notes

- Net loss exceeding $3,000 triggers a carryover warning
- Capital loss carryover presence triggers a prior-year verification warning
- Tax computation method is automatically determined from net gains

---

### 11. `tax_parse_schedule_e`

Parse Schedule E (supplemental income — rental/royalty income and partnership/S-Corp pass-through). Handles multiple rental properties and multiple partnership entities.

**Risk Tier:** READ-ONLY (parsing)

#### ScheduleE Structure

| Field                         | Type                     | Description                                  |
|-------------------------------|--------------------------|----------------------------------------------|
| `taxYear`                     | `number`                 | Tax year                                     |
| `rentalProperties`            | `Array<ScheduleERental>` | Per-property rental income/expenses          |
| `partnershipAndSCorpIncome`   | `Array<ScheduleEPartnership>` | Per-entity pass-through income          |
| `totalRentalIncomeLoss`       | `number`                 | Sum of all rental net income/loss            |
| `totalPartnershipIncomeLoss`  | `number`                 | Sum of all partnership net income/loss       |
| `totalScheduleEIncomeLoss`    | `number`                 | Total Schedule E income/loss                 |

#### ScheduleERental Fields

`propertyAddress`, `propertyType`, `personalUseDays`, `fairRentalDays`, `rentsReceived`, `expenses` (15 categories: advertising, auto, cleaning, commissions, insurance, legal, management, mortgage, otherInterest, repairs, supplies, taxes, utilities, depreciation, other), `totalExpenses`, `netIncomeLoss`

#### ScheduleEPartnership Fields

`entityName`, `entityEin`, `isPassiveActivity`, `ordinaryIncomeLoss`, `netRentalIncomeLoss`, `otherIncomeLoss`

---

### 12. `tax_parse_schedule_se`

Parse Schedule SE (self-employment tax). Computes Social Security tax, Medicare tax, additional Medicare tax (>$200K), total SE tax, and the deductible half. Uses 2025 wage base ($176,100) and 92.35% net earnings factor.

**Risk Tier:** READ-ONLY (parsing + computation)

#### ScheduleSE Structure

| Field                              | Type     | Description                                      |
|------------------------------------|----------|--------------------------------------------------|
| `taxYear`                          | `number` | Tax year                                         |
| `netEarningsFromSelfEmployment`    | `number` | Net SE earnings input                            |
| `socialSecurityWageBase`           | `number` | SS wage base (default: $176,100 for 2025)        |
| `socialSecurityTax`                | `number` | 12.4% on min(SE×92.35%, wage base)               |
| `medicareTax`                      | `number` | 2.9% on SE×92.35%                                |
| `additionalMedicareTax`            | `number` | 0.9% on SE earnings above $200,000               |
| `totalSelfEmploymentTax`           | `number` | Sum of SS + Medicare + additional Medicare        |
| `deductiblePartOfSeTax`            | `number` | 50% of total SE tax (above-the-line deduction)   |

---

### 13. `tax_parse_form_8949`

Parse Form 8949 (sales and other dispositions of capital assets). Handles short-term Part I and long-term Part II transaction lists with per-transaction gain/loss computation and aggregate totals.

**Risk Tier:** READ-ONLY (parsing)

#### Form8949 Structure

| Field                          | Type                        | Description                               |
|--------------------------------|-----------------------------|-------------------------------------------|
| `taxYear`                      | `number`                    | Tax year                                  |
| `shortTermPartI`               | `Array<Form8949Transaction>`| Short-term transactions                   |
| `longTermPartII`               | `Array<Form8949Transaction>`| Long-term transactions                    |
| `totalShortTermProceeds`       | `number`                    | Sum of short-term proceeds                |
| `totalShortTermBasis`          | `number`                    | Sum of short-term cost basis              |
| `totalShortTermAdjustments`    | `number`                    | Sum of short-term adjustments             |
| `totalShortTermGainLoss`       | `number`                    | Sum of short-term gain/loss               |
| `totalLongTermProceeds`        | `number`                    | Sum of long-term proceeds                 |
| `totalLongTermBasis`           | `number`                    | Sum of long-term cost basis               |
| `totalLongTermAdjustments`     | `number`                    | Sum of long-term adjustments              |
| `totalLongTermGainLoss`        | `number`                    | Sum of long-term gain/loss                |

#### Form8949Transaction Fields

| Field              | Type              | Description                                    |
|--------------------|-------------------|------------------------------------------------|
| `description`      | `string`          | Description of property                        |
| `dateAcquired`     | `string \| null`  | Date acquired (null if various/unknown)        |
| `dateSold`         | `string`          | Date sold or disposed                          |
| `proceeds`         | `number`          | Proceeds from sale                             |
| `costBasis`        | `number`          | Cost or other basis                            |
| `adjustmentCode`   | `string`          | Adjustment code (e.g., W for wash sale)        |
| `adjustmentAmount` | `number`          | Adjustment amount                              |
| `gainOrLoss`       | `number`          | Computed: proceeds - costBasis + adjustments   |

---

### 14. `tax_parse_state_return`

Parse generic state return data. Supports any state form (CA 540, NY IT-201, etc.) with a uniform structure covering federal AGI carryover, state adjustments, state-specific deductions, computed state tax, credits, and balance due/overpayment.

**Risk Tier:** READ-ONLY (parsing)

#### StateReturn Structure

| Field                     | Type     | Description                                    |
|---------------------------|----------|------------------------------------------------|
| `taxYear`                 | `number` | Tax year                                       |
| `stateCode`               | `string` | Two-letter state code (e.g., CA, NY)           |
| `formId`                  | `string` | Form identifier (e.g., "540", "IT-201")        |
| `filingStatus`            | `string` | Filing status                                  |
| `federalAGI`              | `number` | Federal AGI carried from Form 1040             |
| `stateAdditions`          | `number` | State additions to income                      |
| `stateSubtractions`       | `number` | State subtractions from income                 |
| `stateAGI`                | `number` | State adjusted gross income                    |
| `stateDeductions`         | `number` | State deductions (standard or itemized)        |
| `stateTaxableIncome`      | `number` | State taxable income                           |
| `stateTaxComputed`        | `number` | Computed state tax                             |
| `stateCredits`            | `number` | State tax credits                              |
| `stateWithholding`        | `number` | State tax withheld                             |
| `stateEstimatedPayments`  | `number` | State estimated payments made                  |
| `stateBalanceDue`         | `number` | Computed: tax - credits - withholding - est    |
| `stateOverpayment`        | `number` | Overpayment (refund)                           |

---

### 15. `tax_parse_form_6251`

Parse Form 6251 (Alternative Minimum Tax — Individuals). Computes Alternative Minimum Taxable Income (AMTI) from Form 1040 taxable income plus AMT adjustments (SALT addback, private activity bond interest, ISO exercise, other). Reports exemption, phaseout, tentative minimum tax, and actual AMT.

**Risk Tier:** READ-ONLY (parsing)

#### Form6251 Structure

| Field                               | Type     | Description                                          |
|-------------------------------------|----------|------------------------------------------------------|
| `taxYear`                           | `number` | Tax year                                             |
| `taxableIncomeFromForm1040`         | `number` | Taxable income from Form 1040 Line 15                |
| `stateAndLocalTaxDeduction`         | `number` | SALT deduction addback                               |
| `taxExemptInterest`                 | `number` | Tax-exempt interest from private activity bonds      |
| `incentiveStockOptions`             | `number` | ISO bargain element                                  |
| `otherAdjustments`                  | `number` | Other AMT adjustments                                |
| `alternativeMinimumTaxableIncome`   | `number` | Computed AMTI                                        |
| `exemptionAmount`                   | `number` | AMT exemption amount                                 |
| `amtExemptionPhaseout`              | `number` | Phaseout amount                                      |
| `reducedExemption`                  | `number` | Exemption after phaseout reduction                   |
| `amtTaxableAmount`                  | `number` | AMTI minus reduced exemption                         |
| `tentativeMinimumTax`               | `number` | Tentative minimum tax (26%/28% rates)                |
| `regularTax`                        | `number` | Regular tax from Form 1040                           |
| `alternativeMinimumTax`             | `number` | Computed: max(0, TMT - regularTax)                   |

#### Validation Notes

- ISO exercise triggers a warning about AMT credit carryforward eligibility
- Non-zero AMT triggers a planning strategies advisory warning

---

## Calculator Tool Details

### 16. `tax_estimate_liability` (original tool #6)

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

### 17. `tax_find_tlh_candidates`

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

### 18. `tax_check_wash_sales`

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

### 19. `tax_lot_selection`

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

### 20. `tax_quarterly_estimate`

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

### 21. `tax_compute_schedule_d`

Compute Schedule D capital gain/loss netting with $3,000 annual loss deduction cap ($1,500 for MFS), character-preserving carryover (short-term vs long-term), and preferential rate qualification. All math uses `decimal.ts` for deterministic arithmetic.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  shortTermGainLoss: number          // Net short-term gains/losses from current year
  longTermGainLoss: number           // Net long-term gains/losses from current year
  capitalLossCarryover: {
    shortTerm: number                // ST carryover from prior year (negative)
    longTerm: number                 // LT carryover from prior year (negative)
  }
  capitalGainDistributions: number   // Long-term capital gain distributions
  filingStatus?: FilingStatus        // Optional — affects $3K/$1.5K cap
}
```

#### Output Schema

```typescript
{
  netShortTermGainLoss: number       // Net ST after carryover
  netLongTermGainLoss: number        // Net LT after carryover + distributions
  netCapitalGainLoss: number         // Combined net
  capitalLossDeduction: number       // Capped at $3,000 ($1,500 MFS)
  carryoverToNextYear: {
    shortTerm: number                // ST loss carryforward (preserves character)
    longTerm: number                 // LT loss carryforward (preserves character)
  }
  qualifiesForPreferentialRates: boolean  // True if net LT > 0
}
```

#### Computation Logic

1. Net ST = currentShortTerm + STcarryover
2. Net LT = currentLongTerm + LTcarryover + capitalGainDistributions
3. Net total = Net ST + Net LT
4. If net total < 0: deduction = min(|net total|, $3,000) — $1,500 for MFS
5. Carryover absorbs deduction against ST first, then LT (preserving character)
6. Preferential rates apply when Net LT > 0

---

### 22. `tax_compute_state_tax`

Compute state income tax for supported states using progressive brackets (CA, NY, NJ), flat rates (IL 4.95%, PA 3.07%), flat + surtax (MA 5% + 4% millionaire's tax), or zero-tax states (TX, FL). Uses 2025 bracket tables with MFJ scaling. All math uses `decimal.ts`.

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  stateCode: string                  // Two-letter state code (CA, NY, NJ, IL, PA, MA, TX, FL)
  taxableIncome: number              // State taxable income
  filingStatus: FilingStatus         // Affects bracket thresholds for CA, NY, NJ
}
```

#### Output Schema

```typescript
{
  stateCode: string
  taxableIncome: number
  stateTax: number                   // Computed state tax
  effectiveRate: number              // stateTax / taxableIncome
  marginalRate: number               // Top marginal bracket rate
  brackets: Array<{
    min: number
    max: number | null
    rate: number
  }>
  notes: string[]                    // Special notes (e.g., "CA Mental Health Services Tax")
}
```

#### Supported States

| State | Type        | Rate Range         | Notes                                      |
|-------|-------------|--------------------|--------------------------------------------|
| CA    | Progressive | 1% – 13.3%        | 10 brackets; Mental Health Services Tax >$1M|
| NY    | Progressive | 4% – 10.9%        | 9 brackets; single and MFJ tables          |
| NJ    | Progressive | 1.4% – 10.75%     | 7 brackets; single and MFJ tables          |
| IL    | Flat        | 4.95%              | Flat rate                                  |
| PA    | Flat        | 3.07%              | Flat rate                                  |
| MA    | Flat+Surtax | 5% + 4% over $1M  | Millionaire's surtax                       |
| TX    | None        | 0%                 | No state income tax                        |
| FL    | None        | 0%                 | No state income tax                        |

---

### 23. `tax_compute_amt`

Compute Alternative Minimum Tax using 2025 parameters. Handles AMTI calculation from Form 1040 taxable income plus AMT adjustments, exemption phaseout at 25% rate, and two-tier AMT rate structure (26% on first $248,300, 28% above).

**Risk Tier:** READ-ONLY (computation)

#### Input Schema

```typescript
{
  taxableIncome: number              // Form 1040 Line 15 taxable income
  filingStatus: FilingStatus         // Determines exemption and phaseout thresholds
  stateAndLocalTaxDeduction: number  // SALT deduction added back for AMT
  taxExemptInterestFromPABs: number  // Private activity bond interest
  incentiveStockOptionBargainElement: number  // ISO exercise bargain element
  otherAdjustments: number           // Other AMT preference items
  regularTax: number                 // Regular tax from Form 1040
}
```

#### Output Schema

```typescript
{
  amti: number                       // Alternative Minimum Taxable Income
  exemptionAmount: number            // Base exemption for filing status
  exemptionPhaseoutStart: number     // AMTI threshold where phaseout begins
  reducedExemption: number           // Exemption after phaseout (min: 0)
  amtBase: number                    // max(0, AMTI - reducedExemption)
  tentativeMinimumTax: number        // 26%/28% two-tier tax on amtBase
  alternativeMinimumTax: number      // max(0, TMT - regularTax)
  isSubjectToAmt: boolean            // True if AMT > 0
}
```

#### 2025 AMT Parameters

| Filing Status | Exemption   | Phaseout Start | Bracket Threshold |
|---------------|-------------|----------------|-------------------|
| Single        | $88,100     | $609,350       | $248,300          |
| HoH           | $88,100     | $609,350       | $248,300          |
| MFJ           | $137,000    | $1,218,700     | $248,300          |
| MFS           | $68,500     | $609,350       | $124,150          |

#### Computation Logic

1. AMTI = taxableIncome + SALT addback + PAB interest + ISO bargain + other
2. Exemption phaseout: reduced = max(0, exemption - 25% × max(0, AMTI - phaseoutStart))
3. AMT base = max(0, AMTI - reducedExemption)
4. TMT = 26% × min(base, threshold) + 28% × max(0, base - threshold)
5. AMT = max(0, TMT - regularTax)

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

### Form 1040

| IRS Line | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| Line 1a  | `wages`                            | Wages, salaries, tips                    |
| Line 2a  | `taxExemptInterest`                | Tax-exempt interest                      |
| Line 2b  | `taxableInterest`                  | Taxable interest                         |
| Line 3a  | `qualifiedDividends`               | Qualified dividends                      |
| Line 3b  | `ordinaryDividends`                | Ordinary dividends                       |
| Line 7   | `capitalGainOrLoss`                | Capital gain or loss                     |
| Line 9   | `totalIncome`                      | Total income                             |
| Line 11  | `adjustedGrossIncome`              | Adjusted gross income                    |
| Line 15  | `taxableIncome`                    | Taxable income                           |
| Line 24  | `totalTax`                         | Total tax                                |
| Line 33  | `totalPayments`                    | Total payments                           |

### Schedule A

| IRS Line | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| Line 1   | `medicalAndDentalExpenses`         | Medical and dental expenses              |
| Line 5   | `stateAndLocalTaxes`               | State and local taxes (pre-cap)          |
| Line 5e  | `saltDeductionCapped`              | SALT deduction (capped at $10,000)       |
| Line 8   | `homeInterest`                     | Home mortgage interest                   |
| Line 11  | `charitableCashContributions`      | Charitable cash contributions            |
| Line 17  | `totalItemizedDeductions`          | Total itemized deductions                |

### Schedule C

| IRS Line | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| Line 1   | `grossReceipts`                    | Gross receipts or sales                  |
| Line 7   | `grossProfit`                      | Gross profit                             |
| Line 28  | `totalExpenses`                    | Total expenses                           |
| Line 31  | `netProfitOrLoss`                  | Net profit or loss                       |

### Schedule D

| IRS Line | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| Part I   | `shortTermFromForm8949`            | Short-term from Form 8949               |
| Part I   | `netShortTermGainLoss`             | Net short-term gain/loss                 |
| Part II  | `longTermFromForm8949`             | Long-term from Form 8949                |
| Part II  | `netLongTermGainLoss`              | Net long-term gain/loss                  |
| Line 16  | `netGainLoss`                      | Combination of ST and LT                 |

### Form 8949

| Column   | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| (a)      | `description`                      | Description of property                  |
| (b)      | `dateAcquired`                     | Date acquired                            |
| (c)      | `dateSold`                         | Date sold                                |
| (d)      | `proceeds`                         | Proceeds                                 |
| (e)      | `costBasis`                        | Cost or other basis                      |
| (f)      | `adjustmentCode`                   | Code (e.g., W for wash sale)             |
| (g)      | `adjustmentAmount`                 | Adjustment amount                        |
| (h)      | `gainOrLoss`                       | Gain or loss                             |

### Form 6251

| IRS Line | Canonical Field                    | Description                              |
|----------|------------------------------------|------------------------------------------|
| Line 1   | `taxableIncomeFromForm1040`        | Taxable income from Form 1040            |
| Line 2a  | `stateAndLocalTaxDeduction`        | SALT deduction addback                   |
| Line 2g  | `taxExemptInterest`                | Private activity bond interest           |
| Line 2i  | `incentiveStockOptions`            | ISO bargain element                      |
| Line 7   | `alternativeMinimumTaxableIncome`  | AMTI                                     |
| Line 9   | `tentativeMinimumTax`              | Tentative minimum tax                    |
| Line 11  | `alternativeMinimumTax`            | AMT (TMT minus regular tax)              |

---

## Calculator Notes

### Deterministic Computation

All calculator tools produce deterministic outputs. Given the same inputs, the same outputs are always returned. The agent must never use LLM arithmetic for tax numbers -- all numeric financial outputs flow through these calculator tools.

### Assumptions

Calculator tools document their assumptions in the output `assumptions` array. Common assumptions include:

- **Standard deduction assumed** unless a specific deduction amount is provided
- **Single state of residence** -- multi-state apportionment is not supported in v0.1.0
- **AMT supported via `tax_compute_amt`** -- uses 2025 parameters with exemption phaseout and 26%/28% two-tier rates
- **No credits beyond foreign tax credit** -- child tax credit, education credits, etc. are not included
- **Federal bracket rates are sourced from IRS Revenue Procedures** for the specified tax year
- **State tax supported for 8 states** via `tax_compute_state_tax` -- CA, NY, NJ (progressive), IL, PA (flat), MA (flat+surtax), TX, FL (none). Full state-specific deduction and credit logic varies by state.
- **NIIT threshold is $200,000 (single) / $250,000 (MFJ)** per IRC Section 1411
- **Self-employment tax uses 92.35% of SE earnings** with Social Security wage base cap for the tax year

### Bracket Sources

- Federal ordinary income brackets: IRS Revenue Procedure for the applicable tax year
- Long-term capital gains / qualified dividend rates: 0%, 15%, 20% based on taxable income thresholds
- Net Investment Income Tax: 3.8% on investment income above AGI threshold (IRC Section 1411)
- Self-employment tax: 15.3% (12.4% Social Security + 2.9% Medicare) with applicable wage base

---

## Usage Notes

### Typical Workflows

#### Full Tax Return Analysis

Parse a complete set of tax documents in sequence:

1. **Parse income sources** -- `tax_parse_w2`, `tax_parse_1099int`, `tax_parse_1099div`, `tax_parse_k1`, `tax_parse_schedule_c`
2. **Parse capital transactions** -- `tax_parse_1099b` → `tax_parse_form_8949` → `tax_parse_schedule_d`
3. **Compute capital gains netting** -- `tax_compute_schedule_d` for loss cap and carryover
4. **Parse deductions and credits** -- `tax_parse_schedule_a`, `tax_parse_schedule_b`, `tax_parse_schedule_e`
5. **Parse main return** -- `tax_parse_1040` to verify everything ties together
6. **Compute SE tax** -- `tax_parse_schedule_se` (if self-employment income present)
7. **Estimate liability** -- `tax_estimate_liability` for federal + state projection
8. **Check AMT exposure** -- `tax_compute_amt` with SALT addback and ISO data
9. **Compute state tax** -- `tax_compute_state_tax` for detailed state liability
10. **Parse state return** -- `tax_parse_state_return` to verify state filing data
11. **Check AMT form data** -- `tax_parse_form_6251` to verify AMT computations

#### Tax Planning & Strategy

1. **Find TLH opportunities** -- `tax_find_tlh_candidates` with current positions (from `alpaca-trading` or `ibkr-portfolio`)
2. **Check wash sale compliance** -- `tax_check_wash_sales` with proposed sales and recent purchase history
3. **Compare lot selection** -- `tax_lot_selection` to compare FIFO, LIFO, and specific identification
4. **Calculate quarterly estimates** -- `tax_quarterly_estimate` for payment schedule and safe harbor status

#### Self-Employment Tax Analysis

```
tax_parse_schedule_c(rawData)
  → tax_parse_schedule_se(rawData)
  → tax_estimate_liability(income with businessIncome)
  → tax_quarterly_estimate(projectedIncome)
```

#### AMT Planning

```
tax_compute_amt({
  taxableIncome, filingStatus,
  stateAndLocalTaxDeduction: scheduleA.saltDeductionCapped,
  incentiveStockOptionBargainElement: <ISO data>,
  regularTax: estimatedLiability.ordinaryTax
})
  → If AMT > 0: review ISO exercise timing, SALT impact
```

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
