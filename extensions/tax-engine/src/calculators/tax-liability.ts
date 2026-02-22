/**
 * Federal + state tax liability estimation.
 * Deterministic bracket-based computation. No LLM math.
 */

import type {
  FilingStatus,
  IncomeSummary,
  TaxBracket,
  TaxLiabilityResult,
} from '../types.js'
import {
  add,
  applyRate,
  clampMin,
  roundToWholeDollar,
  subtract,
  sumAll,
} from './decimal.js'
import {
  getLtcgBrackets,
  getNiitThreshold,
  getOrdinaryBrackets,
  getStandardDeduction,
  getStateTaxRate,
  NIIT_RATE,
  SE_MEDICARE_ADDITIONAL_RATE,
  SE_MEDICARE_ADDITIONAL_THRESHOLD,
  SE_SOCIAL_SECURITY_CAP,
  SE_TAX_RATE,
} from './tax-brackets.js'

/**
 * Apply progressive tax brackets to a given amount of taxable income.
 * Returns the total tax computed across all brackets.
 */
export function applyBrackets(
  taxableIncome: number,
  brackets: ReadonlyArray<TaxBracket>
): number {
  let tax = 0
  let remaining = clampMin(taxableIncome, 0)

  for (const bracket of brackets) {
    if (remaining <= 0) break

    const bracketWidth =
      bracket.max !== null ? subtract(bracket.max, bracket.min) : remaining
    const taxableInBracket = Math.min(remaining, bracketWidth)
    tax = add(tax, applyRate(taxableInBracket, bracket.rate))
    remaining = subtract(remaining, taxableInBracket)
  }

  return roundToWholeDollar(tax)
}

/**
 * Get the marginal tax rate for a given taxable income level.
 */
export function getMarginalRate(
  taxableIncome: number,
  status: FilingStatus
): number {
  const brackets = getOrdinaryBrackets(status)
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (taxableIncome > brackets[i].min) {
      return brackets[i].rate
    }
  }
  return brackets[0].rate
}

/**
 * Compute self-employment tax on business income.
 */
function computeSelfEmploymentTax(businessIncome: number): number {
  if (businessIncome <= 0) return 0

  // 92.35% of net SE earnings are taxable
  const taxableSeEarnings = applyRate(businessIncome, 0.9235)

  // Social Security portion (12.4%) up to cap
  const ssWages = Math.min(taxableSeEarnings, SE_SOCIAL_SECURITY_CAP)
  const ssTax = applyRate(ssWages, 0.124)

  // Medicare portion (2.9%) on all earnings
  const medicareTax = applyRate(taxableSeEarnings, 0.029)

  // Additional Medicare tax (0.9%) on earnings over threshold
  const additionalMedicare =
    taxableSeEarnings > SE_MEDICARE_ADDITIONAL_THRESHOLD
      ? applyRate(
          subtract(taxableSeEarnings, SE_MEDICARE_ADDITIONAL_THRESHOLD),
          SE_MEDICARE_ADDITIONAL_RATE
        )
      : 0

  return roundToWholeDollar(sumAll([ssTax, medicareTax, additionalMedicare]))
}

/**
 * Compute Net Investment Income Tax (3.8%) on investment income
 * above AGI threshold.
 */
function computeNiit(
  agi: number,
  investmentIncome: number,
  status: FilingStatus
): number {
  const threshold = getNiitThreshold(status)
  if (agi <= threshold) return 0

  const excessAgi = subtract(agi, threshold)
  const niitBase = Math.min(investmentIncome, excessAgi)
  return roundToWholeDollar(applyRate(niitBase, NIIT_RATE))
}

/**
 * Main tax liability estimator.
 */
export function estimateTaxLiability(
  taxYear: number,
  filingStatus: FilingStatus,
  income: IncomeSummary,
  state?: string
): TaxLiabilityResult {
  const assumptions: string[] = []

  // ── Gross income ───────────────────────────────────────────────
  const grossIncome = sumAll([
    income.wages,
    income.ordinaryDividends,
    income.interestIncome,
    income.shortTermGains,
    income.longTermGains,
    income.businessIncome,
    income.rentalIncome,
    income.otherIncome,
  ])

  // ── AGI adjustments (simplified) ──────────────────────────────
  const seDeduction =
    income.businessIncome > 0
      ? roundToWholeDollar(applyRate(income.businessIncome * 0.9235, 0.5 * SE_TAX_RATE))
      : 0

  const adjustedGrossIncome = subtract(grossIncome, seDeduction)

  // ── Deductions ────────────────────────────────────────────────
  const standardDeduction = getStandardDeduction(filingStatus)
  const deductionUsed =
    income.deductions > standardDeduction
      ? income.deductions
      : standardDeduction

  if (income.deductions <= standardDeduction) {
    assumptions.push('Using standard deduction')
  } else {
    assumptions.push('Using itemized deductions')
  }

  // ── Taxable ordinary income (excludes LTCG and qualified divs) ─
  const ordinaryIncome = sumAll([
    income.wages,
    subtract(income.ordinaryDividends, income.qualifiedDividends),
    income.interestIncome,
    income.shortTermGains,
    income.businessIncome,
    income.rentalIncome,
    income.otherIncome,
  ])

  const taxableOrdinaryIncome = clampMin(
    subtract(ordinaryIncome, deductionUsed),
    0
  )

  // ── Ordinary tax ──────────────────────────────────────────────
  const ordinaryTax = applyBrackets(
    taxableOrdinaryIncome,
    getOrdinaryBrackets(filingStatus)
  )

  // ── LTCG + Qualified Dividends tax ────────────────────────────
  // These are taxed at preferential rates based on total taxable income
  const preferentialIncome = add(
    income.qualifiedDividends,
    clampMin(income.longTermGains, 0)
  )

  // The LTCG brackets apply based on total taxable income (ordinary + preferential)
  const totalTaxableForLtcg = add(taxableOrdinaryIncome, preferentialIncome)
  const ltcgBrackets = getLtcgBrackets(filingStatus)

  // Tax on preferential income: tax on total - tax on ordinary portion
  // This "stacking" method properly places preferential income on top
  let qualifiedDividendTax = 0
  let longTermCapitalGainsTax = 0

  if (preferentialIncome > 0) {
    // Simplified: compute preferential rate on the stacked income
    const taxOnTotal = applyBrackets(totalTaxableForLtcg, ltcgBrackets)
    const taxOnOrdinaryPortion = applyBrackets(taxableOrdinaryIncome, ltcgBrackets)
    const preferentialTax = subtract(taxOnTotal, taxOnOrdinaryPortion)

    if (preferentialIncome > 0) {
      const qdShare =
        income.qualifiedDividends / preferentialIncome
      qualifiedDividendTax = roundToWholeDollar(applyRate(preferentialTax, qdShare))
      longTermCapitalGainsTax = subtract(
        roundToWholeDollar(preferentialTax),
        qualifiedDividendTax
      )
    }
  }

  assumptions.push(
    `Tax year ${taxYear} brackets applied`
  )

  // ── NIIT ──────────────────────────────────────────────────────
  const investmentIncome = sumAll([
    income.ordinaryDividends,
    income.interestIncome,
    income.shortTermGains,
    income.longTermGains,
    income.rentalIncome,
  ])
  const netInvestmentIncomeTax = computeNiit(
    adjustedGrossIncome,
    investmentIncome,
    filingStatus
  )

  // ── Self-employment tax ───────────────────────────────────────
  const selfEmploymentTax = computeSelfEmploymentTax(income.businessIncome)

  // ── Total federal ─────────────────────────────────────────────
  const totalFederalTax = sumAll([
    ordinaryTax,
    qualifiedDividendTax,
    longTermCapitalGainsTax,
    netInvestmentIncomeTax,
    selfEmploymentTax,
  ])

  // ── State tax (simplified flat rate) ──────────────────────────
  let stateTax = 0
  if (state) {
    const stateRate = getStateTaxRate(state)
    stateTax = roundToWholeDollar(
      applyRate(clampMin(subtract(adjustedGrossIncome, deductionUsed), 0), stateRate)
    )
    assumptions.push(
      `State tax computed using simplified ${state} flat rate (${(stateRate * 100).toFixed(1)}%)`
    )
  }

  // ── Credits ───────────────────────────────────────────────────
  const foreignTaxCredit = income.foreignTaxCredit

  // ── Totals ────────────────────────────────────────────────────
  const totalTax = clampMin(
    subtract(add(totalFederalTax, stateTax), foreignTaxCredit),
    0
  )

  const totalWithholding = income.totalWithholding
  const estimatedPayments = income.estimatedPayments
  const balanceDue = subtract(
    totalTax,
    add(totalWithholding, estimatedPayments)
  )

  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0
  const marginalRate = getMarginalRate(taxableOrdinaryIncome, filingStatus)

  return {
    taxYear,
    filingStatus,
    grossIncome: roundToWholeDollar(grossIncome),
    adjustedGrossIncome: roundToWholeDollar(adjustedGrossIncome),
    taxableOrdinaryIncome: roundToWholeDollar(taxableOrdinaryIncome),
    ordinaryTax,
    qualifiedDividendTax,
    longTermCapitalGainsTax,
    netInvestmentIncomeTax,
    selfEmploymentTax,
    totalFederalTax,
    stateTax,
    totalTax,
    totalWithholding: roundToWholeDollar(totalWithholding),
    estimatedPayments: roundToWholeDollar(estimatedPayments),
    balanceDue: roundToWholeDollar(balanceDue),
    effectiveRate: Math.round(effectiveRate * 10000) / 10000,
    marginalRate,
    assumptions,
  }
}
