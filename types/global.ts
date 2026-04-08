// Tax Rules per Country
export interface TaxBracket {
  minIncome: number
  maxIncome: number | null
  rate: number
}

export interface StateTaxBracket {
  state: string
  brackets: TaxBracket[]
}

export interface TaxRules {
  id: string
  countryCode: string
  countryName: string
  taxYear: number
  federalTaxBrackets: TaxBracket[]
  stateTaxBrackets?: StateTaxBracket[]
  gstRate?: number
  vatRates?: Array<{ region: string; rate: number }>
  payeThreshold?: number
  selfEmploymentTaxRate?: number
  standardDeduction?: number
  filingDeadline: string
  currency: string
  forms: string[]
}

// Worker Tax Profile
export type EmploymentClassification = 'contractor' | 'employee' | 'self_employed'

export interface WorkerTaxProfile {
  id: string
  workerId: string
  countryCode: string
  taxId: string
  residencyStatus: string
  classification: EmploymentClassification
  taxYear: number
  currency: string
  acceptedTerms: {
    gdprConsent?: boolean
    ccpaConsent?: boolean
    privacyActConsent?: boolean
    acceptedAt?: string
  }
  createdAt: string
  updatedAt: string
}

// Currency
export interface CurrencyRate {
  id: string
  date: string
  base: string
  rates: Record<string, number>
  timestamp: string
}

export interface CurrencyConversion {
  from: string
  to: string
  amount: number
  convertedAmount: number
  rate: number
  timestamp: string
}

// GDPR
export type GDPRRequestType = 'export' | 'delete'
export type GDPRRequestStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface GDPRDataRequest {
  id: string
  userId: string
  type: GDPRRequestType
  status: GDPRRequestStatus
  createdAt: string
  completedAt?: string
  dataExportUrl?: string
  reason?: string
}

export interface UserConsent {
  userId: string
  gdprConsent?: boolean
  ccpaConsent?: boolean
  coppaConsent?: boolean
  privacyActNZ?: boolean
  privacyActAU?: boolean
  pipedeaConsent?: boolean
  marketingConsent?: boolean
  updatedAt: string
}

// Employment Classification
export interface EmploymentClassificationResult {
  workerId: string
  countryCode: string
  classification: EmploymentClassification
  factors: Array<{ factor: string; value: string; weight: number }>
  taxImplications: string[]
  benefitsEligibility: string[]
  superPensionRequired: boolean
  determinedAt: string
}

// Localization
export interface Language {
  code: string
  name: string
  nativeName: string
  region?: string
  rtl?: boolean
}

export interface Translation {
  language: string
  namespace: string
  translations: Record<string, string>
}

export interface UserLanguagePreference {
  userId: string
  languageCode: string
  updatedAt: string
}

// Compliance
export interface ComplianceRequirement {
  countryCode: string
  countryName: string
  requirements: Array<{
    id: string
    title: string
    description: string
    mandatory: boolean
    category: 'tax' | 'privacy' | 'employment' | 'financial'
    deadline?: string
  }>
  lastUpdated: string
}

export interface ComplianceAuditResult {
  userId: string
  countryCode: string
  passed: boolean
  issues: Array<{ requirementId: string; issue: string; severity: 'low' | 'medium' | 'high' }>
  auditedAt: string
}

// Tax Calculation
export interface TaxCalculationInput {
  countryCode: string
  grossIncome: number
  classification: EmploymentClassification
  state?: string
  taxYear?: number
  filingStatus?: 'single' | 'married_joint' | 'married_separate' | 'head_of_household'
}

export interface TaxCalculationResult {
  countryCode: string
  grossIncome: number
  federalTax: number
  stateTax?: number
  selfEmploymentTax?: number
  gst?: number
  totalTax: number
  effectiveRate: number
  netIncome: number
  breakdown: Array<{ label: string; amount: number }>
}

// Supported countries list
export interface SupportedCountry {
  code: string
  name: string
  flag: string
  currency: string
  supported: boolean
  tier: 'full' | 'partial' | 'coming_soon'
}
