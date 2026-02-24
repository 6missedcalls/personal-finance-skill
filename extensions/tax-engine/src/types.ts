// ─── Filing & General ────────────────────────────────────────────────

export type FilingStatus =
  | 'single'
  | 'married_filing_jointly'
  | 'married_filing_separately'
  | 'head_of_household'

export type GainType = 'short_term' | 'long_term'

export type LotSelectionMethod = 'fifo' | 'lifo' | 'specific_id'

// ─── Form 1099-B ─────────────────────────────────────────────────────

export interface Form1099B {
  readonly payerName: string
  readonly payerTin: string
  readonly recipientName: string
  readonly recipientTin: string
  readonly accountNumber: string
  readonly taxYear: number
  readonly transactions: ReadonlyArray<Form1099BTransaction>
}

export interface Form1099BTransaction {
  readonly description: string                    // box 1a
  readonly dateAcquired: string | null            // box 1b (ISO date, null if "various")
  readonly dateSold: string                       // box 1c (ISO date)
  readonly proceeds: number                       // box 1d
  readonly costBasis: number                      // box 1e
  readonly accruedMarketDiscount: number           // box 1f
  readonly washSaleLossDisallowed: number          // box 1g
  readonly gainType: GainType                     // box 2 (short/long)
  readonly basisReportedToIrs: boolean            // box 3
  readonly federalTaxWithheld: number             // box 4
  readonly noncoveredSecurity: boolean            // box 5
  readonly reportedGrossOrNet: 'gross' | 'net'    // box 6
  readonly lossNotAllowed: number                 // box 7
  readonly section1256ProfitLoss: number           // box 8
  readonly section1256UnrealizedPl: number         // box 9
  readonly section1256BasisOfPositions: number     // box 10
}

// ─── Form 1099-DIV ───────────────────────────────────────────────────

export interface Form1099DIV {
  readonly payerName: string
  readonly payerTin: string
  readonly recipientName: string
  readonly recipientTin: string
  readonly accountNumber: string
  readonly taxYear: number
  readonly totalOrdinaryDividends: number          // box 1a
  readonly qualifiedDividends: number              // box 1b
  readonly totalCapitalGainDistributions: number   // box 2a
  readonly unrecapSec1250Gain: number              // box 2b
  readonly section1202Gain: number                 // box 2c
  readonly collectibles28RateGain: number          // box 2d
  readonly nondividendDistributions: number        // box 3
  readonly federalTaxWithheld: number              // box 4
  readonly section199aDividends: number            // box 5
  readonly foreignTaxPaid: number                  // box 7
  readonly foreignCountry: string                  // box 8
  readonly cashLiquidationDistributions: number    // box 9
  readonly noncashLiquidationDistributions: number // box 10
  readonly exemptInterestDividends: number         // box 11
  readonly privateActivityBondInterest: number     // box 12
}

// ─── Form 1099-INT ───────────────────────────────────────────────────

export interface Form1099INT {
  readonly payerName: string
  readonly payerTin: string
  readonly recipientName: string
  readonly recipientTin: string
  readonly accountNumber: string
  readonly taxYear: number
  readonly interestIncome: number                  // box 1
  readonly earlyWithdrawalPenalty: number           // box 2
  readonly usSavingsBondInterest: number           // box 3
  readonly federalTaxWithheld: number              // box 4
  readonly investmentExpenses: number              // box 5
  readonly foreignTaxPaid: number                  // box 6
  readonly foreignCountry: string                  // box 7
  readonly taxExemptInterest: number               // box 8
  readonly privateActivityBondInterest: number     // box 9
  readonly marketDiscount: number                  // box 10
  readonly bondPremium: number                     // box 11
  readonly bondPremiumTreasury: number             // box 12
  readonly bondPremiumTaxExempt: number            // box 13
}

// ─── Form W-2 ────────────────────────────────────────────────────────

export interface FormW2 {
  readonly employerName: string
  readonly employerEin: string
  readonly employeeName: string
  readonly employeeSsn: string
  readonly taxYear: number
  readonly wagesTipsOtherComp: number              // box 1
  readonly federalTaxWithheld: number              // box 2
  readonly socialSecurityWages: number             // box 3
  readonly socialSecurityTaxWithheld: number       // box 4
  readonly medicareWagesAndTips: number            // box 5
  readonly medicareTaxWithheld: number             // box 6
  readonly socialSecurityTips: number              // box 7
  readonly allocatedTips: number                   // box 8
  readonly dependentCareBenefits: number           // box 10
  readonly nonqualifiedPlans: number               // box 11
  readonly box12Codes: ReadonlyArray<W2Box12Entry> // box 12
  readonly statutoryEmployee: boolean              // box 13
  readonly retirementPlan: boolean                 // box 13
  readonly thirdPartySickPay: boolean              // box 13
  readonly other: string                           // box 14
  readonly stateWages: number                      // box 16
  readonly stateIncomeTax: number                  // box 17
  readonly localWages: number                      // box 18
  readonly localIncomeTax: number                  // box 19
  readonly localityName: string                    // box 20
}

export interface W2Box12Entry {
  readonly code: string
  readonly amount: number
}

// ─── Schedule K-1 ────────────────────────────────────────────────────

export interface FormK1 {
  readonly partnershipName: string
  readonly partnershipEin: string
  readonly partnerName: string
  readonly partnerTin: string
  readonly taxYear: number
  readonly partnerType: 'general' | 'limited' | 'llc_member'
  readonly profitSharingPercent: number
  readonly lossSharingPercent: number
  readonly capitalSharingPercent: number
  readonly beginningCapitalAccount: number
  readonly endingCapitalAccount: number
  readonly ordinaryBusinessIncomeLoss: number
  readonly netRentalRealEstateIncomeLoss: number
  readonly otherNetRentalIncomeLoss: number
  readonly guaranteedPayments: number
  readonly interestIncome: number
  readonly ordinaryDividends: number
  readonly qualifiedDividends: number
  readonly netShortTermCapitalGainLoss: number
  readonly netLongTermCapitalGainLoss: number
  readonly section1231GainLoss: number
  readonly otherIncome: number
  readonly section179Deduction: number
  readonly otherDeductions: number
  readonly selfEmploymentEarnings: number
}

// ─── Tax Lots & Positions ────────────────────────────────────────────

export interface TaxLot {
  readonly id: string
  readonly symbol: string
  readonly dateAcquired: string           // ISO date
  readonly quantity: number
  readonly costBasisPerShare: number
  readonly totalCostBasis: number
  readonly adjustedBasis: number          // after wash sale adjustments
  readonly washSaleAdjustment: number
  readonly accountId: string
}

export interface Position {
  readonly symbol: string
  readonly totalQuantity: number
  readonly lots: ReadonlyArray<TaxLot>
  readonly currentPrice: number
  readonly accountId: string
}

// ─── Wash Sale Types ─────────────────────────────────────────────────

export interface WashSaleViolation {
  readonly soldLotId: string
  readonly replacementLotId: string
  readonly symbol: string
  readonly saleDate: string
  readonly replacementDate: string
  readonly disallowedLoss: number
  readonly basisAdjustment: number
}

export interface WashSaleCheckResult {
  readonly violations: ReadonlyArray<WashSaleViolation>
  readonly totalDisallowedLoss: number
  readonly compliant: boolean
}

// ─── Tax Liability Types ─────────────────────────────────────────────

export interface TaxBracket {
  readonly min: number
  readonly max: number | null
  readonly rate: number
}

export interface IncomeSummary {
  readonly wages: number
  readonly ordinaryDividends: number
  readonly qualifiedDividends: number
  readonly interestIncome: number
  readonly taxExemptInterest: number
  readonly shortTermGains: number
  readonly longTermGains: number
  readonly businessIncome: number
  readonly rentalIncome: number
  readonly otherIncome: number
  readonly totalWithholding: number
  readonly estimatedPayments: number
  readonly deductions: number
  readonly foreignTaxCredit: number
}

export interface TaxLiabilityResult {
  readonly taxYear: number
  readonly filingStatus: FilingStatus
  readonly grossIncome: number
  readonly adjustedGrossIncome: number
  readonly taxableOrdinaryIncome: number
  readonly ordinaryTax: number
  readonly qualifiedDividendTax: number
  readonly longTermCapitalGainsTax: number
  readonly netInvestmentIncomeTax: number
  readonly selfEmploymentTax: number
  readonly totalFederalTax: number
  readonly stateTax: number
  readonly totalTax: number
  readonly totalWithholding: number
  readonly estimatedPayments: number
  readonly balanceDue: number
  readonly effectiveRate: number
  readonly marginalRate: number
  readonly assumptions: ReadonlyArray<string>
}

// ─── TLH Types ───────────────────────────────────────────────────────

export interface TlhCandidate {
  readonly symbol: string
  readonly lotId: string
  readonly currentPrice: number
  readonly costBasis: number
  readonly unrealizedLoss: number
  readonly quantity: number
  readonly holdingPeriod: GainType
  readonly washSaleRisk: boolean
  readonly estimatedTaxSavings: number
  readonly rationale: string
}

// ─── Lot Selection Types ─────────────────────────────────────────────

export interface LotSelectionResult {
  readonly method: LotSelectionMethod
  readonly selectedLots: ReadonlyArray<SelectedLot>
  readonly totalProceeds: number
  readonly totalBasis: number
  readonly totalGainLoss: number
  readonly shortTermGainLoss: number
  readonly longTermGainLoss: number
  readonly estimatedTaxImpact: number
}

export interface SelectedLot {
  readonly lotId: string
  readonly dateAcquired: string
  readonly quantitySold: number
  readonly costBasisPerShare: number
  readonly totalBasis: number
  readonly proceeds: number
  readonly gainLoss: number
  readonly gainType: GainType
}

// ─── Quarterly Estimate Types ────────────────────────────────────────

export interface QuarterlyEstimateResult {
  readonly taxYear: number
  readonly quarters: ReadonlyArray<QuarterPayment>
  readonly totalEstimatedTax: number
  readonly totalPaid: number
  readonly totalRemaining: number
  readonly safeHarborMet: boolean
  readonly underpaymentRisk: 'low' | 'medium' | 'high'
  readonly nextDueDate: string
  readonly suggestedNextPayment: number
}

export interface QuarterPayment {
  readonly quarter: 1 | 2 | 3 | 4
  readonly dueDate: string
  readonly amountDue: number
  readonly amountPaid: number
  readonly status: 'paid' | 'due' | 'overdue' | 'upcoming'
}

// ─── Tool Input/Output Types ─────────────────────────────────────────

export interface ParseFormInput {
  readonly userId: string
  readonly taxYear: number
  readonly rawData: Record<string, unknown>
}

export interface ParseFormOutput<T> {
  readonly parsed: T
  readonly warnings: ReadonlyArray<string>
  readonly missingFields: ReadonlyArray<string>
}

export interface EstimateLiabilityInput {
  readonly userId: string
  readonly taxYear: number
  readonly filingStatus: FilingStatus
  readonly state?: string
  readonly income: IncomeSummary
}

export interface FindTlhInput {
  readonly userId: string
  readonly positions: ReadonlyArray<Position>
  readonly minLoss?: number
  readonly marginalRate?: number
  readonly avoidWashSaleDays?: number
  readonly recentSales?: ReadonlyArray<{
    readonly symbol: string
    readonly saleDate: string
  }>
}

export interface CheckWashSalesInput {
  readonly userId: string
  readonly sales: ReadonlyArray<{
    readonly lotId: string
    readonly symbol: string
    readonly saleDate: string
    readonly loss: number
  }>
  readonly purchases: ReadonlyArray<{
    readonly lotId: string
    readonly symbol: string
    readonly purchaseDate: string
    readonly quantity: number
    readonly costBasis: number
  }>
}

export interface LotSelectionInput {
  readonly userId: string
  readonly symbol: string
  readonly quantityToSell: number
  readonly currentPrice: number
  readonly lots: ReadonlyArray<TaxLot>
  readonly methods?: ReadonlyArray<LotSelectionMethod>
  readonly marginalRate?: number
  readonly longTermRate?: number
}

export interface QuarterlyEstimateInput {
  readonly userId: string
  readonly taxYear: number
  readonly filingStatus: FilingStatus
  readonly projectedIncome: IncomeSummary
  readonly priorYearTax: number
  readonly quarterlyPaymentsMade: ReadonlyArray<{
    readonly quarter: 1 | 2 | 3 | 4
    readonly amount: number
    readonly datePaid: string
  }>
}

// ── Form 1040 ──────────────────────────────────────────────────────

export interface Form1040 {
  readonly filingStatus: FilingStatus
  readonly taxYear: number
  readonly firstName: string
  readonly lastName: string
  readonly ssn: string
  readonly wages: number
  readonly taxExemptInterest: number
  readonly taxableInterest: number
  readonly qualifiedDividends: number
  readonly ordinaryDividends: number
  readonly iraDistributions: number
  readonly taxableIraDistributions: number
  readonly pensions: number
  readonly taxablePensions: number
  readonly socialSecurity: number
  readonly taxableSocialSecurity: number
  readonly capitalGainOrLoss: number
  readonly otherIncome: number
  readonly totalIncome: number
  readonly adjustmentsToIncome: number
  readonly adjustedGrossIncome: number
  readonly standardOrItemizedDeduction: number
  readonly qualifiedBusinessDeduction: number
  readonly totalDeductions: number
  readonly taxableIncome: number
  readonly totalTax: number
  readonly totalPayments: number
  readonly amountOwed: number
  readonly overpaid: number
}

// ── Schedule A ─────────────────────────────────────────────────────

export interface ScheduleA {
  readonly taxYear: number
  readonly medicalAndDentalExpenses: number
  readonly medicalThreshold: number
  readonly deductibleMedical: number
  readonly stateAndLocalTaxes: number
  readonly saltDeductionCapped: number
  readonly homeInterest: number
  readonly charitableCashContributions: number
  readonly charitableNonCash: number
  readonly charitableCarryover: number
  readonly totalCharitable: number
  readonly casualtyAndTheftLosses: number
  readonly otherItemizedDeductions: number
  readonly totalItemizedDeductions: number
}

// ── Schedule B ─────────────────────────────────────────────────────

export interface ScheduleB {
  readonly taxYear: number
  readonly interestPayors: ReadonlyArray<{ readonly name: string; readonly amount: number }>
  readonly totalInterest: number
  readonly dividendPayors: ReadonlyArray<{ readonly name: string; readonly amount: number }>
  readonly totalOrdinaryDividends: number
  readonly hasForeignAccountOrTrust: boolean
  readonly foreignCountries: ReadonlyArray<string>
}

// ── Schedule C ─────────────────────────────────────────────────────

export interface ScheduleC {
  readonly taxYear: number
  readonly businessName: string
  readonly principalBusinessCode: string
  readonly businessEin: string
  readonly accountingMethod: "cash" | "accrual" | "other"
  readonly grossReceipts: number
  readonly returnsAndAllowances: number
  readonly costOfGoodsSold: number
  readonly grossProfit: number
  readonly otherIncome: number
  readonly grossIncome: number
  readonly expenses: ScheduleCExpenses
  readonly totalExpenses: number
  readonly netProfitOrLoss: number
}

export interface ScheduleCExpenses {
  readonly advertising: number
  readonly carAndTruckExpenses: number
  readonly commissions: number
  readonly contractLabor: number
  readonly depletion: number
  readonly depreciation: number
  readonly employeeBenefits: number
  readonly insurance: number
  readonly interestMortgage: number
  readonly interestOther: number
  readonly legalAndProfessional: number
  readonly officeExpense: number
  readonly pensionAndProfitSharing: number
  readonly rentVehicles: number
  readonly rentOther: number
  readonly repairs: number
  readonly supplies: number
  readonly taxesAndLicenses: number
  readonly travel: number
  readonly meals: number
  readonly utilities: number
  readonly wages: number
  readonly otherExpenses: number
}

// ── Schedule D ─────────────────────────────────────────────────────

export interface ScheduleD {
  readonly taxYear: number
  readonly shortTermFromForm8949: number
  readonly shortTermFromScheduleK1: number
  readonly shortTermCapitalLossCarryover: number
  readonly netShortTermGainLoss: number
  readonly longTermFromForm8949: number
  readonly longTermFromScheduleK1: number
  readonly longTermCapitalGainDistributions: number
  readonly longTermCapitalLossCarryover: number
  readonly netLongTermGainLoss: number
  readonly netGainLoss: number
  readonly qualifiesForExceptionToForm4952: boolean
  readonly taxComputationMethod: "regular" | "schedule_d_worksheet" | "qualified_dividends_worksheet"
}

// ── Schedule E ─────────────────────────────────────────────────────

export interface ScheduleE {
  readonly taxYear: number
  readonly rentalProperties: ReadonlyArray<ScheduleERental>
  readonly partnershipAndSCorpIncome: ReadonlyArray<ScheduleEPartnership>
  readonly totalRentalIncomeLoss: number
  readonly totalPartnershipIncomeLoss: number
  readonly totalScheduleEIncomeLoss: number
}

export interface ScheduleERental {
  readonly propertyAddress: string
  readonly propertyType: string
  readonly personalUseDays: number
  readonly fairRentalDays: number
  readonly rentsReceived: number
  readonly expenses: {
    readonly advertising: number
    readonly auto: number
    readonly cleaning: number
    readonly commissions: number
    readonly insurance: number
    readonly legal: number
    readonly management: number
    readonly mortgage: number
    readonly otherInterest: number
    readonly repairs: number
    readonly supplies: number
    readonly taxes: number
    readonly utilities: number
    readonly depreciation: number
    readonly other: number
  }
  readonly totalExpenses: number
  readonly netIncomeLoss: number
}

export interface ScheduleEPartnership {
  readonly entityName: string
  readonly entityEin: string
  readonly isPassiveActivity: boolean
  readonly ordinaryIncomeLoss: number
  readonly netRentalIncomeLoss: number
  readonly otherIncomeLoss: number
}

// ── Schedule SE ────────────────────────────────────────────────────

export interface ScheduleSE {
  readonly taxYear: number
  readonly netEarningsFromSelfEmployment: number
  readonly socialSecurityWageBase: number
  readonly socialSecurityTax: number
  readonly medicareTax: number
  readonly additionalMedicareTax: number
  readonly totalSelfEmploymentTax: number
  readonly deductiblePartOfSeTax: number
}

// ── Form 8949 ──────────────────────────────────────────────────────

export interface Form8949 {
  readonly taxYear: number
  readonly shortTermPartI: ReadonlyArray<Form8949Transaction>
  readonly longTermPartII: ReadonlyArray<Form8949Transaction>
  readonly totalShortTermProceeds: number
  readonly totalShortTermBasis: number
  readonly totalShortTermAdjustments: number
  readonly totalShortTermGainLoss: number
  readonly totalLongTermProceeds: number
  readonly totalLongTermBasis: number
  readonly totalLongTermAdjustments: number
  readonly totalLongTermGainLoss: number
}

export interface Form8949Transaction {
  readonly description: string
  readonly dateAcquired: string | null
  readonly dateSold: string
  readonly proceeds: number
  readonly costBasis: number
  readonly adjustmentCode: string
  readonly adjustmentAmount: number
  readonly gainOrLoss: number
}

// ── State Return (generic) ─────────────────────────────────────────

export interface StateReturn {
  readonly taxYear: number
  readonly stateCode: string
  readonly formId: string
  readonly filingStatus: FilingStatus
  readonly federalAGI: number
  readonly stateAdditions: number
  readonly stateSubtractions: number
  readonly stateAGI: number
  readonly stateDeductions: number
  readonly stateTaxableIncome: number
  readonly stateTaxComputed: number
  readonly stateCredits: number
  readonly stateWithholding: number
  readonly stateEstimatedPayments: number
  readonly stateBalanceDue: number
  readonly stateOverpayment: number
}

// ── Form 6251 (AMT) ───────────────────────────────────────────────

export interface Form6251 {
  readonly taxYear: number
  readonly taxableIncomeFromForm1040: number
  readonly stateAndLocalTaxDeduction: number
  readonly taxExemptInterest: number
  readonly incentiveStockOptions: number
  readonly otherAdjustments: number
  readonly alternativeMinimumTaxableIncome: number
  readonly exemptionAmount: number
  readonly amtExemptionPhaseout: number
  readonly reducedExemption: number
  readonly amtTaxableAmount: number
  readonly tentativeMinimumTax: number
  readonly regularTax: number
  readonly alternativeMinimumTax: number
}
