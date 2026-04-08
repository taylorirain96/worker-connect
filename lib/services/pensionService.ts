import type { EmploymentClassification } from '@/types/global'

interface SuperRate {
  employerRate: number
  employeeRate: number
}

const SUPER_RATES: Record<string, Record<number, SuperRate>> = {
  AU: {
    2023: { employerRate: 0.11, employeeRate: 0 },
    2024: { employerRate: 0.115, employeeRate: 0 },
    2025: { employerRate: 0.12, employeeRate: 0 },
  },
  NZ: {
    2023: { employerRate: 0.03, employeeRate: 0.03 },
    2024: { employerRate: 0.03, employeeRate: 0.03 },
    2025: { employerRate: 0.03, employeeRate: 0.03 },
  },
  GB: {
    2023: { employerRate: 0.03, employeeRate: 0.05 },
    2024: { employerRate: 0.03, employeeRate: 0.05 },
    2025: { employerRate: 0.03, employeeRate: 0.05 },
  },
}

export function getSuperRate(countryCode: string, year: number): number {
  const country = SUPER_RATES[countryCode.toUpperCase()]
  if (!country) return 0
  const rate = country[year] ?? country[Math.max(...Object.keys(country).map(Number))]
  return rate?.employerRate ?? 0
}

export function calculateSuperContribution(
  grossIncome: number,
  countryCode: string,
  year: number
): { employerContribution: number; employeeContribution: number; total: number } {
  const country = SUPER_RATES[countryCode.toUpperCase()]
  if (!country) return { employerContribution: 0, employeeContribution: 0, total: 0 }

  const rate = country[year] ?? country[Math.max(...Object.keys(country).map(Number))]
  if (!rate) return { employerContribution: 0, employeeContribution: 0, total: 0 }

  const employerContribution = grossIncome * rate.employerRate
  const employeeContribution = grossIncome * rate.employeeRate
  return {
    employerContribution,
    employeeContribution,
    total: employerContribution + employeeContribution,
  }
}

export function isPensionRequired(
  countryCode: string,
  classification: EmploymentClassification
): boolean {
  if (classification !== 'employee') return false
  return ['AU', 'NZ', 'GB'].includes(countryCode.toUpperCase())
}
