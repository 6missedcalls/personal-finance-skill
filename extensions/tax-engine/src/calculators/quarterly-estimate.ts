/**
 * Quarterly estimated tax payment calculator.
 * Determines payment schedule, safe harbor, and underpayment risk.
 */

import type {
  FilingStatus,
  IncomeSummary,
  QuarterlyEstimateResult,
  QuarterPayment,
} from '../types.js'
import { add, applyRate, clampMin, roundToWholeDollar, subtract } from './decimal.js'
import { estimateTaxLiability } from './tax-liability.js'

interface QuarterlyPaymentMade {
  readonly quarter: 1 | 2 | 3 | 4
  readonly amount: number
  readonly datePaid: string
}

/**
 * Get quarterly due dates for a tax year.
 * Standard individual estimated tax schedule.
 */
function getQuarterDueDates(taxYear: number): ReadonlyArray<{ quarter: 1 | 2 | 3 | 4; dueDate: string }> {
  return [
    { quarter: 1, dueDate: `${taxYear}-04-15` },
    { quarter: 2, dueDate: `${taxYear}-06-15` },
    { quarter: 3, dueDate: `${taxYear}-09-15` },
    { quarter: 4, dueDate: `${taxYear + 1}-01-15` },
  ]
}

/**
 * Determine quarter status based on current date and payments made.
 */
function getQuarterStatus(
  dueDate: string,
  amountPaid: number,
  amountDue: number,
  currentDate: string
): QuarterPayment['status'] {
  if (amountPaid >= amountDue) return 'paid'
  const due = new Date(dueDate)
  const now = new Date(currentDate)
  if (now > due) return 'overdue'
  return 'upcoming'
}

/**
 * Calculate quarterly estimated payments.
 */
export function calculateQuarterlyEstimates(
  taxYear: number,
  filingStatus: FilingStatus,
  projectedIncome: IncomeSummary,
  priorYearTax: number,
  paymentsMade: ReadonlyArray<QuarterlyPaymentMade>,
  currentDate: string,
  state?: string
): QuarterlyEstimateResult {
  // Project current year tax liability
  const liability = estimateTaxLiability(taxYear, filingStatus, projectedIncome, state)
  const projectedTax = liability.totalTax

  // Net tax after withholding
  const netTaxAfterWithholding = clampMin(
    subtract(projectedTax, projectedIncome.totalWithholding),
    0
  )

  // Safe harbor: pay 100% of prior year tax or 90% of current year
  // (110% of prior year if AGI > $150k/$75k MFS)
  const agiThreshold =
    filingStatus === 'married_filing_separately' ? 75000 : 150000
  const priorYearMultiplier =
    liability.adjustedGrossIncome > agiThreshold ? 1.1 : 1.0
  const priorYearSafeHarbor = roundToWholeDollar(
    applyRate(priorYearTax, priorYearMultiplier)
  )
  const currentYearSafeHarbor = roundToWholeDollar(
    applyRate(projectedTax, 0.9)
  )

  // Required annual estimated payment = lesser of the two safe harbors
  // minus withholding already covering some of it
  const requiredAnnualPayment = clampMin(
    subtract(
      Math.min(priorYearSafeHarbor, currentYearSafeHarbor),
      projectedIncome.totalWithholding
    ),
    0
  )

  // Per-quarter amount
  const perQuarter = roundToWholeDollar(requiredAnnualPayment / 4)

  // Build quarter details
  const dueDates = getQuarterDueDates(taxYear)
  const paymentMap = new Map<number, number>()
  for (const p of paymentsMade) {
    paymentMap.set(p.quarter, add(paymentMap.get(p.quarter) ?? 0, p.amount))
  }

  const quarters: QuarterPayment[] = dueDates.map(({ quarter, dueDate }) => {
    const amountPaid = paymentMap.get(quarter) ?? 0
    return {
      quarter,
      dueDate,
      amountDue: perQuarter,
      amountPaid: roundToWholeDollar(amountPaid),
      status: getQuarterStatus(dueDate, amountPaid, perQuarter, currentDate),
    }
  })

  const totalPaid = quarters.reduce((sum, q) => add(sum, q.amountPaid), 0)
  const totalRemaining = clampMin(
    subtract(requiredAnnualPayment, totalPaid),
    0
  )

  // Check safe harbor
  const totalPaymentsAndWithholding = add(
    totalPaid,
    projectedIncome.totalWithholding
  )
  const safeHarborMet =
    totalPaymentsAndWithholding >= priorYearSafeHarbor ||
    totalPaymentsAndWithholding >= currentYearSafeHarbor

  // Underpayment risk assessment
  const overdueQuarters = quarters.filter((q) => q.status === 'overdue')
  const underpaymentRisk: 'low' | 'medium' | 'high' =
    overdueQuarters.length === 0
      ? 'low'
      : overdueQuarters.length <= 1
        ? 'medium'
        : 'high'

  // Next due date
  const upcomingQuarters = quarters.filter(
    (q) => q.status === 'upcoming' || q.status === 'overdue'
  )
  const nextDueDate =
    upcomingQuarters.length > 0
      ? upcomingQuarters[0].dueDate
      : quarters[quarters.length - 1].dueDate

  // Suggested next payment
  const unpaidQuartersCount = quarters.filter(
    (q) => q.status !== 'paid'
  ).length
  const suggestedNextPayment =
    unpaidQuartersCount > 0
      ? roundToWholeDollar(totalRemaining / unpaidQuartersCount)
      : 0

  return {
    taxYear,
    quarters,
    totalEstimatedTax: roundToWholeDollar(requiredAnnualPayment),
    totalPaid: roundToWholeDollar(totalPaid),
    totalRemaining: roundToWholeDollar(totalRemaining),
    safeHarborMet,
    underpaymentRisk,
    nextDueDate,
    suggestedNextPayment,
  }
}
