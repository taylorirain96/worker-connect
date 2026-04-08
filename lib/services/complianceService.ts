import type { ComplianceRequirement, ComplianceAuditResult } from '@/types/global'
import { getUserConsents } from './gdprService'

const COUNTRY_REQUIREMENTS: Record<string, ComplianceRequirement> = {
  US: {
    countryCode: 'US',
    countryName: 'United States',
    requirements: [
      {
        id: 'us-ccpa',
        title: 'CCPA Compliance',
        description: 'California Consumer Privacy Act consent required for California residents',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'us-1099',
        title: '1099-NEC Filing',
        description: 'Contractors earning $600+ must receive a 1099-NEC form',
        mandatory: true,
        category: 'tax',
        deadline: 'January 31',
      },
      {
        id: 'us-w9',
        title: 'W-9 Form',
        description: 'Taxpayer identification number certification',
        mandatory: true,
        category: 'tax',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  EU: {
    countryCode: 'EU',
    countryName: 'European Union',
    requirements: [
      {
        id: 'eu-gdpr',
        title: 'GDPR Consent',
        description: 'General Data Protection Regulation consent and data processing rights',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'eu-dpa',
        title: 'Data Processing Agreement',
        description: 'Data processing agreement required for all EU users',
        mandatory: true,
        category: 'privacy',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  NZ: {
    countryCode: 'NZ',
    countryName: 'New Zealand',
    requirements: [
      {
        id: 'nz-privacy-act',
        title: 'Privacy Act 2020',
        description: 'New Zealand Privacy Act 2020 consent and compliance',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'nz-ird',
        title: 'IRD Registration',
        description: 'Inland Revenue Department registration required for tax purposes',
        mandatory: true,
        category: 'tax',
      },
      {
        id: 'nz-gst',
        title: 'GST Registration',
        description: 'Register for GST if annual turnover exceeds $60,000',
        mandatory: false,
        category: 'tax',
        deadline: 'Within 21 days of threshold breach',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  AU: {
    countryCode: 'AU',
    countryName: 'Australia',
    requirements: [
      {
        id: 'au-privacy-act',
        title: 'Privacy Act 1988',
        description: 'Australian Privacy Act 1988 compliance and consent',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'au-tfn',
        title: 'Tax File Number (TFN)',
        description: 'TFN required for tax purposes',
        mandatory: true,
        category: 'tax',
      },
      {
        id: 'au-abn',
        title: 'ABN Registration',
        description: 'Australian Business Number required for contractors',
        mandatory: false,
        category: 'employment',
      },
      {
        id: 'au-super',
        title: 'Superannuation',
        description: 'Employer must pay super contributions (11.5%) for eligible employees',
        mandatory: true,
        category: 'financial',
        deadline: 'Quarterly',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  GB: {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    requirements: [
      {
        id: 'gb-ukgdpr',
        title: 'UK GDPR',
        description: 'UK General Data Protection Regulation compliance',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'gb-ir35',
        title: 'IR35 Assessment',
        description: 'IR35 off-payroll working rules assessment required for contractors',
        mandatory: true,
        category: 'employment',
      },
      {
        id: 'gb-ni',
        title: 'National Insurance',
        description: 'National Insurance contributions required',
        mandatory: true,
        category: 'financial',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  CA: {
    countryCode: 'CA',
    countryName: 'Canada',
    requirements: [
      {
        id: 'ca-pipeda',
        title: 'PIPEDA Compliance',
        description: 'Personal Information Protection and Electronic Documents Act',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'ca-sin',
        title: 'SIN Registration',
        description: 'Social Insurance Number required for tax purposes',
        mandatory: true,
        category: 'tax',
      },
      {
        id: 'ca-gst-hst',
        title: 'GST/HST Registration',
        description: 'Register if annual revenue exceeds $30,000',
        mandatory: false,
        category: 'tax',
      },
    ],
    lastUpdated: '2024-01-01',
  },
  DE: {
    countryCode: 'DE',
    countryName: 'Germany',
    requirements: [
      {
        id: 'de-gdpr',
        title: 'GDPR / DSGVO',
        description: 'EU GDPR as implemented in German DSGVO',
        mandatory: true,
        category: 'privacy',
      },
      {
        id: 'de-steuer',
        title: 'Steuernummer',
        description: 'Tax identification number required',
        mandatory: true,
        category: 'tax',
      },
    ],
    lastUpdated: '2024-01-01',
  },
}

// All current EU member states (27 members as of 2024)
const EU_COUNTRIES = [
  'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI',
  'FR', 'GR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT',
  'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK',
]

export function getCountryRequirements(countryCode: string): ComplianceRequirement {
  const upper = countryCode.toUpperCase()

  if (COUNTRY_REQUIREMENTS[upper]) return COUNTRY_REQUIREMENTS[upper]
  if (EU_COUNTRIES.includes(upper)) {
    return {
      ...COUNTRY_REQUIREMENTS['EU'],
      countryCode: upper,
      countryName: upper,
    }
  }

  return {
    countryCode: upper,
    countryName: upper,
    requirements: [
      {
        id: `${upper.toLowerCase()}-general`,
        title: 'General Compliance',
        description: 'Comply with local tax and privacy regulations',
        mandatory: true,
        category: 'tax',
      },
    ],
    lastUpdated: new Date().toISOString().split('T')[0],
  }
}

export async function auditUserCompliance(
  userId: string,
  countryCode: string
): Promise<ComplianceAuditResult> {
  const requirements = getCountryRequirements(countryCode)
  const consents = await getUserConsents(userId)
  const issues: ComplianceAuditResult['issues'] = []

  for (const req of requirements.requirements) {
    if (!req.mandatory) continue

    if (req.category === 'privacy') {
      const hasConsent =
        (req.id.includes('gdpr') && consents?.gdprConsent) ||
        (req.id.includes('ccpa') && consents?.ccpaConsent) ||
        (req.id.includes('pipeda') && consents?.pipedeaConsent) ||
        (req.id.includes('nz-privacy') && consents?.privacyActNZ) ||
        (req.id.includes('au-privacy') && consents?.privacyActAU)

      if (!hasConsent) {
        issues.push({
          requirementId: req.id,
          issue: `Missing consent for: ${req.title}`,
          severity: 'high',
        })
      }
    }
  }

  return {
    userId,
    countryCode,
    passed: issues.length === 0,
    issues,
    auditedAt: new Date().toISOString(),
  }
}

export async function generateComplianceReport(
  userId: string
): Promise<{ passed: boolean; countries: ComplianceAuditResult[] }> {
  const countryCodes = ['US', 'NZ', 'AU', 'GB', 'CA']
  const results = await Promise.all(
    countryCodes.map(code => auditUserCompliance(userId, code))
  )

  return {
    passed: results.every(r => r.passed),
    countries: results,
  }
}
