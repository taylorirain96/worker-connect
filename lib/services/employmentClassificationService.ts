import type {
  EmploymentClassification,
  EmploymentClassificationResult,
} from '@/types/global'

const CLASSIFICATION_WEIGHTS: Record<string, number> = {
  control: 0.3,
  equipment: 0.15,
  exclusivity: 0.2,
  integration: 0.2,
  financial_risk: 0.15,
}

function determineClassification(
  countryCode: string,
  factors: Record<string, string>
): EmploymentClassification {
  const workerControlled = ['control', 'equipment', 'financial_risk'].filter(
    f => factors[f] === 'worker'
  ).length

  if (countryCode === 'AU') {
    const hasABN = factors.abn === 'yes'
    if (hasABN && workerControlled >= 2) return 'contractor'
    if (!hasABN && factors.control === 'company') return 'employee'
  }

  if (countryCode === 'GB') {
    const ir35Pass = factors.substitution === 'yes' && factors.control === 'worker'
    if (ir35Pass) return 'contractor'
    if (factors.control === 'company' && factors.exclusivity === 'company') return 'employee'
  }

  if (countryCode === 'US') {
    const behaviorControl = factors.control === 'company' ? 1 : 0
    const financialControl = factors.financial_risk === 'company' ? 1 : 0
    const relationship = factors.benefits === 'yes' ? 1 : 0
    if (behaviorControl + financialControl + relationship >= 2) return 'employee'
  }

  if (workerControlled >= 3) return 'self_employed'
  if (workerControlled >= 2) return 'contractor'
  return 'employee'
}

export function getTaxImplicationsForClassification(
  countryCode: string,
  classification: EmploymentClassification
): string[] {
  const implications: Record<string, Record<EmploymentClassification, string[]>> = {
    US: {
      contractor: ['File 1099-NEC', 'Pay self-employment tax (15.3%)', 'Quarterly estimated taxes'],
      employee: ['W-2 withholding', 'Employer pays half of FICA'],
      self_employed: ['Schedule C', 'Self-employment tax (15.3%)', 'Quarterly estimated taxes'],
    },
    AU: {
      contractor: ['Lodge BAS quarterly', 'Charge GST if turnover > $75k', 'No super obligation'],
      employee: ['PAYG withholding', 'Employer pays super (11.5%)'],
      self_employed: ['Lodge BAS', 'Pay super voluntarily', 'Charge GST if applicable'],
    },
    NZ: {
      contractor: ['Pay own tax', 'Register for GST if turnover > $60k', 'No KiwiSaver obligation'],
      employee: ['PAYE deducted', 'Employer KiwiSaver contribution (3%)'],
      self_employed: ['File IR3', 'GST registration if applicable'],
    },
    GB: {
      contractor: ['IR35 assessment required', 'VAT registration if turnover > £85k'],
      employee: ['PAYE', 'National Insurance Class 1'],
      self_employed: ['Self Assessment', 'National Insurance Class 2 & 4'],
    },
  }

  return (
    implications[countryCode]?.[classification] ?? [
      'Consult local tax authority for specific obligations',
    ]
  )
}

export function isSuperPensionRequired(
  countryCode: string,
  classification: EmploymentClassification
): boolean {
  if (countryCode === 'AU') return classification === 'employee'
  if (countryCode === 'NZ') return classification === 'employee'
  if (countryCode === 'GB') return classification === 'employee'
  return false
}

export async function classifyWorker(
  workerId: string,
  countryCode: string,
  factors: Record<string, string>
): Promise<EmploymentClassificationResult> {
  const classification = determineClassification(countryCode, factors)

  const factorList = Object.entries(factors).map(([factor, value]) => ({
    factor,
    value,
    weight: CLASSIFICATION_WEIGHTS[factor] ?? 0.1,
  }))

  return {
    workerId,
    countryCode,
    classification,
    factors: factorList,
    taxImplications: getTaxImplicationsForClassification(countryCode, classification),
    benefitsEligibility:
      classification === 'employee'
        ? ['Health insurance', 'Retirement plan', 'Paid leave', 'Workers compensation']
        : ['None - self-funded'],
    superPensionRequired: isSuperPensionRequired(countryCode, classification),
    determinedAt: new Date().toISOString(),
  }
}
