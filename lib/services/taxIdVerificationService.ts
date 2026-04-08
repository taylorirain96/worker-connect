interface VerificationResult {
  valid: boolean
  format: string
  message: string
}

const TAX_ID_PATTERNS: Record<string, { pattern: RegExp; format: string; name: string }> = {
  US: {
    pattern: /^\d{3}-\d{2}-\d{4}$/,
    format: 'XXX-XX-XXXX',
    name: 'SSN (Social Security Number)',
  },
  AU: {
    pattern: /^\d{11}$/,
    format: '12345678901 (11 digits)',
    name: 'ABN (Australian Business Number)',
  },
  AU_TFN: {
    pattern: /^\d{8,9}$/,
    format: 'XXXXXXXX or XXXXXXXXX (8-9 digits)',
    name: 'TFN (Tax File Number)',
  },
  NZ: {
    pattern: /^\d{8,9}$/,
    format: 'XXXXXXXX or XXXXXXXXX (8-9 digits)',
    name: 'IRD Number',
  },
  GB: {
    pattern: /^[A-Z]{2}\s?\d{6}\s?[A-D]$/i,
    format: 'XX-999999-X',
    name: 'NI Number (National Insurance)',
  },
  CA: {
    pattern: /^\d{9}$/,
    format: 'XXXXXXXXX (9 digits)',
    name: 'SIN (Social Insurance Number)',
  },
  DE: {
    pattern: /^\d{11}$/,
    format: 'XXXXXXXXXXX (11 digits)',
    name: 'Steueridentifikationsnummer',
  },
  FR: {
    pattern: /^\d{13}$/,
    format: 'XXXXXXXXXXXXX (13 digits)',
    name: 'Numéro fiscal',
  },
  EU_VAT: {
    pattern: /^[A-Z]{2}\d{8,12}$/,
    format: 'CC followed by 8-12 digits',
    name: 'EU VAT Number',
  },
  SG: {
    pattern: /^[STFG]\d{7}[A-Z]$/,
    format: 'XNNNNNNNX',
    name: 'NRIC/FIN',
  },
  IN: {
    pattern: /^[A-Z]{5}\d{4}[A-Z]$/,
    format: 'AAAAA9999A',
    name: 'PAN (Permanent Account Number)',
  },
  JP: {
    pattern: /^\d{12}$/,
    format: 'XXXXXXXXXXXX (12 digits)',
    name: 'My Number (個人番号)',
  },
}

export function verifyTaxId(
  countryCode: string,
  taxId: string
): VerificationResult {
  const cleanId = taxId.trim()
  const rule = TAX_ID_PATTERNS[countryCode.toUpperCase()]

  if (!rule) {
    return {
      valid: cleanId.length >= 5,
      format: 'Country-specific format',
      message: cleanId.length >= 5
        ? 'Tax ID format accepted (unverified for this country)'
        : 'Tax ID appears too short',
    }
  }

  const valid = rule.pattern.test(cleanId)
  return {
    valid,
    format: rule.format,
    message: valid
      ? `Valid ${rule.name}`
      : `Invalid format. Expected ${rule.name}: ${rule.format}`,
  }
}
