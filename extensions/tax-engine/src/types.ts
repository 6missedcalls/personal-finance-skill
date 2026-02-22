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
