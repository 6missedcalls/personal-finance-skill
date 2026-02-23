# IRS Tax Forms and Calculation Rules Reference

## Quick Start
1. Normalize brokerage/payroll forms into internal schemas for 1099-B, 1099-DIV, 1099-INT, W-2, and K-1.
2. Map each form field to tax calculation buckets (ordinary income, qualified dividends, short/long gains, withholding, basis adjustments).
3. Apply wash sale rules before final gain/loss computation.
4. Use lot selection policy (FIFO/LIFO/Specific ID) consistently for basis.
5. Validate e-file outputs against IRS MeF schema requirements before submission.

## Common Form Schemas

## Form 1099-B (Proceeds From Broker and Barter Exchange Transactions)

### Core payer/recipient identifiers
- `payer_name`, `payer_tin`
- `recipient_name`, `recipient_tin`
- `account_number`

### Per-sale fields (basis and gain engine critical)
- `box_1a_description` (security description)
- `box_1b_date_acquired`
- `box_1c_date_sold_or_disposed`
- `box_1d_proceeds`
- `box_1e_cost_or_other_basis`
- `box_1f_accrued_market_discount`
- `box_1g_wash_sale_loss_disallowed`
- `box_2_gain_type` (short/long indicator)
- `box_3_basis_reported_to_irs` (boolean)
- `box_4_federal_income_tax_withheld`
- `box_5_noncovered_security` (boolean)
- `box_6_reported_gross_or_net`
- `box_7_loss_not_allowed` (where applicable)
- `box_8_profit_or_loss_realized` (Section 1256 contracts)
- `box_9_unrealized_profit_or_loss` (Section 1256)
- `box_10_basis_of_positions` (Section 1256)
- `box_11_corporate_obligation_discount`
- `box_12_broker_barter_exchange`
- `state_withholding_fields` (state tax withheld, payer state no., state income)

### Tax calculation meaning
- Realized gain/loss base: `proceeds - basis - adjustments`.
- Wash sale addback from `box_1g` defers disallowed loss into replacement lot basis.
- Covered vs noncovered (`box_3`/`box_5`) drives basis confidence and reconciliation.

## Form 1099-DIV (Dividends and Distributions)

### Core boxes
- `box_1a_total_ordinary_dividends`
- `box_1b_qualified_dividends`
- `box_2a_total_capital_gain_distributions`
- `box_2b_unrecap_sec_1250_gain`
- `box_2c_section_1202_gain`
- `box_2d_collectibles_28_rate_gain`
- `box_3_nondividend_distributions`
- `box_4_federal_income_tax_withheld`
- `box_5_section_199a_dividends`
- `box_7_foreign_tax_paid`
- `box_8_foreign_country_or_us_possession`
- `box_9_cash_liquidation_distributions`
- `box_10_noncash_liquidation_distributions`
- `box_11_exempt_interest_dividends`
- `box_12_specified_private_activity_bond_interest_dividends`
- `state_withholding_fields`

### Tax calculation meaning
- `1a` -> ordinary dividend income.
- `1b` subset eligible for qualified dividend rates.
- `2a-2d` feed Schedule D/8949 logic.
- `3` is return of capital (basis reduction, not current taxable dividend until basis exhausted).
- `7` supports foreign tax credit workflows.

## Form 1099-INT (Interest Income)

### Core boxes
- `box_1_interest_income`
- `box_2_early_withdrawal_penalty`
- `box_3_interest_on_us_savings_bonds_treasury_obligations`
- `box_4_federal_income_tax_withheld`
- `box_5_investment_expenses`
- `box_6_foreign_tax_paid`
- `box_7_foreign_country_or_us_possession`
- `box_8_tax_exempt_interest`
- `box_9_specified_private_activity_bond_interest`
- `box_10_market_discount`
- `box_11_bond_premium`
- `box_12_bond_premium_on_treasury_obligations`
- `box_13_bond_premium_on_tax_exempt_bond`
- `box_14_tax_exempt_and_tax_credit_bond_cusip`
- `box_15_state`, `box_16_state_identification_no`, `box_17_state_tax_withheld`

### Tax calculation meaning
- `1` taxable interest.
- `3` treasury interest (federal taxable, often state-exempt).
- `8` tax-exempt interest (still informational for return computations).
- Premium/discount boxes adjust effective interest and basis handling.

## Form W-2 (Wage and Tax Statement)

### Core boxes for return prep
- `box_1_wages_tips_other_compensation`
- `box_2_federal_income_tax_withheld`
- `box_3_social_security_wages`
- `box_4_social_security_tax_withheld`
- `box_5_medicare_wages_and_tips`
- `box_6_medicare_tax_withheld`
- `box_7_social_security_tips`
- `box_8_allocated_tips`
- `box_10_dependent_care_benefits`
- `box_11_nonqualified_plans`
- `box_12_codes[]` (e.g., D, DD, W, AA, BB, etc.)
- `box_13_flags` (statutory employee, retirement plan, third-party sick pay)
- `box_14_other`
- `box_15_state_employer_id`
- `box_16_state_wages`
- `box_17_state_income_tax`
- `box_18_local_wages`
- `box_19_local_income_tax`
- `box_20_locality_name`

### Tax calculation meaning
- Box 1 and withholding (Box 2) anchor federal wage tax computation.
- Boxes 3-6 used for payroll tax reconciliation and wage base checks.
- Box 12/13 codes impact deductions, retirement limits, and credits.

## Schedule K-1 (Partnership/S-Corp/Trust beneficiary variants)

Most investment workflows see Partnership K-1 (`Form 1065 Schedule K-1`).

### Common K-1 fields (partnership-centric)
- Partner identity: `partner_name`, `partner_tin`, address, partner type.
- Entity identity: `partnership_ein`, name/address.
- Ownership and capital:
  - `beginning_capital_account`
  - `ending_capital_account`
  - `profit_loss_capital_sharing_percentages`
  - `partner_liability_share`
- Income/loss line items:
  - `ordinary_business_income_loss`
  - `net_rental_real_estate_income_loss`
  - `other_net_rental_income_loss`
  - `guaranteed_payments`
  - `interest_income`
  - `ordinary_dividends`
  - `qualified_dividends`
  - `net_short_term_capital_gain_loss`
  - `net_long_term_capital_gain_loss`
  - `section_1231_gain_loss`
  - `other_income`
- Deductions/credits and AMT/foreign transaction detail through coded boxes (notably box 13, 15, 16, 20 with statement attachments).

### Tax calculation meaning
- K-1 is pass-through reporting: amounts flow into recipient return schedules by character.
- Attachment codes are mandatory to interpret many boxes.

## Tax-Loss Harvesting Rules

## Wash sale rule (IRC Section 1091)
A loss is disallowed if taxpayer acquires substantially identical stock/securities within the wash window around the sale.

### Window
- 30 days before sale date
- sale date
- 30 days after sale date

Net: 61-day window centered on sale date.

### Effect
- Disallowed loss is added to basis of replacement shares.
- Holding period of replacement shares may tack from relinquished shares.

### Substantially identical
- Not strictly defined as only same CUSIP; facts-and-circumstances test.
- Generally same security is clearly substantially identical.
- ETFs/funds/options can be substantially identical in some cases depending on exposure/rights.

### Operational requirements
- Track across all taxable accounts under taxpayer control.
- Adjust lot basis and holding period when wash sale triggered.
- Preserve linkage between sold lot and replacement lot for auditability.

## Capital Gains Cost Basis Methods

## FIFO (First-In, First-Out)
- Default in many broker systems if no lot instruction.
- Oldest shares sold first.
- Usually maximizes long-term holding recognition when position aged.

## LIFO (Last-In, First-Out)
- Newest shares sold first (if broker supports/election applied).
- Often yields different short-vs-long mix and gain timing.

## Specific Identification (Spec ID)
- Taxpayer/broker identifies exact lot at sale time.
- Highest control for gain/loss optimization and holding-period targeting.
- Must be documented/confirmed contemporaneously by broker records.

## Calculation template
For each executed lot:
- `gain_loss = proceeds - adjusted_basis - transaction_costs`
- classify short/long using holding period.
- apply wash sale adjustments before final Schedule D/8949 export.

## IRS MeF Program Overview

## What MeF is
IRS Modernized e-File (MeF) is the IRS electronic filing platform for individual, business, and information returns. It uses schema-based XML submissions, business rules, acknowledgments, and retransmission workflows.

## MeF processing model
1. Transmitter/software creates XML return matching IRS schema version.
2. Submission sent via authorized MeF channel.
3. IRS validates against:
   - schema constraints
   - business rules
   - identity/signature requirements
4. IRS sends acknowledgment:
   - accepted
   - rejected (with reject codes)
5. Rejected returns can be corrected and retransmitted.

## MeF ecosystem roles
- Taxpayer
- ERO/transmitter
- software developer
- IRS e-Services/MeF platform

## Implementation concerns for developers
- Use exact tax-year schema versions.
- Keep reject-code catalog mapped to remediation actions.
- Support acknowledgments polling and idempotent retransmission.
- Log submission IDs, timestamps, and acknowledgment states.

## Estimated Tax Payment Schedule and Rules

Reference tax year schedule (standard individual estimated tax cadence):
- Q1 payment due: April 15
- Q2 payment due: June 15
- Q3 payment due: September 15
- Q4 payment due: January 15 of following year

When due date falls on weekend/holiday, deadline shifts to next business day.

As of Sunday, February 22, 2026:
- next common individual estimated payment due date is **April 15, 2026** (for 2026 Q1 period).

## Who generally must pay estimated tax
Taxpayers expecting tax due after withholding/credits above IRS thresholds (commonly including self-employed, investors with significant untaxed income, pass-through recipients).

## Safe harbor concepts (high level)
Avoid underpayment penalty by paying sufficient amount through withholding + estimated payments (for example, percentage of current-year tax or prior-year tax under IRS safe harbor rules, subject to AGI and special cases).

## Payment methods
- IRS Direct Pay
- EFTPS
- IRS account/online payment
- check/voucher (Form 1040-ES)

## Primary Sources
- https://www.irs.gov/instructions/i1099b
- https://www.irs.gov/instructions/i1099div
- https://www.irs.gov/instructions/i1099int
- https://www.irs.gov/forms-pubs/about-form-w-2
- https://www.irs.gov/forms-pubs/about-schedule-k-1-form-1065
- https://www.irs.gov/publications/p550
- https://www.irs.gov/e-file-providers/modernized-e-file-mef-overview
- https://www.irs.gov/payments/estimated-taxes
- https://www.irs.gov/forms-pubs/about-form-1040-es
