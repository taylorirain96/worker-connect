import type { TaxCalculationInput, TaxCalculationResult, TaxBracket } from '@/types/global'
import { getTaxRules } from './countryConfigService'

function calculateProgressiveTax(income: number, brackets: TaxBracket[]): number {
  let tax = 0
  for (const bracket of brackets) {
    if (income <= bracket.minIncome) break
    const taxableInThisBracket = bracket.maxIncome
      ? Math.min(income, bracket.maxIncome) - bracket.minIncome
      : income - bracket.minIncome
    tax += taxableInThisBracket * bracket.rate
  }
  return Math.max(0, tax)
}

export function calculateTaxes(input: TaxCalculationInput): TaxCalculationResult {
  const { countryCode, grossIncome, classification, state, taxYear: _taxYear } = input
  const rules = getTaxRules(countryCode)

  if (!rules) {
    const estimated = grossIncome * 0.25
    return {
      countryCode,
      grossIncome,
      federalTax: estimated,
      totalTax: estimated,
      effectiveRate: 0.25,
      netIncome: grossIncome - estimated,
      breakdown: [{ label: 'Estimated Tax (25%)', amount: estimated }],
    }
  }

  const breakdown: Array<{ label: string; amount: number }> = []
  let federalTax = 0
  let stateTax = 0
  let selfEmploymentTax = 0
  let gst = 0

  const taxableIncome =
    countryCode === 'US' && rules.standardDeduction
      ? Math.max(0, grossIncome - rules.standardDeduction)
      : grossIncome

  federalTax = calculateProgressiveTax(taxableIncome, rules.federalTaxBrackets)
  breakdown.push({ label: 'Federal Income Tax', amount: federalTax })

  if (countryCode === 'US') {
    if (classification === 'self_employed' || classification === 'contractor') {
      selfEmploymentTax = grossIncome * (rules.selfEmploymentTaxRate ?? 0.153)
      breakdown.push({ label: 'Self-Employment Tax', amount: selfEmploymentTax })
    }
    if (state && rules.stateTaxBrackets) {
      const stateRule = rules.stateTaxBrackets.find(s => s.state === state)
      if (stateRule) {
        stateTax = calculateProgressiveTax(taxableIncome, stateRule.brackets)
        breakdown.push({ label: `${state} State Tax`, amount: stateTax })
      }
    }
  }

  if (countryCode === 'GB') {
    // UK NI Class 1 rates for 2024/25: primary threshold £12,570, upper threshold £50,270
    // Rate: 12% on earnings between thresholds, 2% above upper threshold
    const niThreshold = 12570
    const niUpperThreshold = 50270
    if (grossIncome > niThreshold) {
      const niContribution =
        Math.min(grossIncome, niUpperThreshold) > niThreshold
          ? (Math.min(grossIncome, niUpperThreshold) - niThreshold) * 0.12
          : 0
      const niAboveUpper =
        grossIncome > niUpperThreshold ? (grossIncome - niUpperThreshold) * 0.02 : 0
      const ni = niContribution + niAboveUpper
      stateTax = ni
      breakdown.push({ label: 'National Insurance', amount: ni })
    }
  }

  if ((countryCode === 'NZ' || countryCode === 'AU') && rules.gstRate) {
    if (classification === 'self_employed' || classification === 'contractor') {
      gst = grossIncome * rules.gstRate
      breakdown.push({ label: countryCode === 'NZ' ? 'GST (15%)' : 'GST (10%)', amount: gst })
    }
  }

  const totalTax = federalTax + stateTax + selfEmploymentTax + gst
  const effectiveRate = grossIncome > 0 ? totalTax / grossIncome : 0
  const netIncome = grossIncome - totalTax

  return {
    countryCode,
    grossIncome,
    federalTax,
    stateTax: stateTax > 0 ? stateTax : undefined,
    selfEmploymentTax: selfEmploymentTax > 0 ? selfEmploymentTax : undefined,
    gst: gst > 0 ? gst : undefined,
    totalTax,
    effectiveRate,
    netIncome,
    breakdown,
  }
}
