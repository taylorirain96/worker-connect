/**
 * Contact-information detection for the messaging system.
 *
 * Used to warn users before they share contact details or off-platform
 * meeting phrases before any payment transaction has occurred on a job.
 */

// ─── Patterns ─────────────────────────────────────────────────────────────────

/** NZ landline / mobile: 02x, 03, 04, 06, 07, 09 with optional country code */
const NZ_PHONE = /(?:\+64|0064)?[\s.-]?(?:2[0-9]|[3-9])\d[\s.-]?\d{3,4}[\s.-]?\d{3,4}/

/** AU mobile/landline: 04xx or +61 variants */
const AU_PHONE = /(?:\+61|0061)?[\s.-]?0?[45]\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/

/** General international pattern: +XX(X) followed by 7–12 digits */
const INTL_PHONE = /\+\d{1,3}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{3,5}[\s.-]?\d{3,5}/

/** Standard email address */
const EMAIL = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/

/** Common off-platform / circumvention phrases */
const PHRASES = /\b(call me|text me|my number is|my email is|whatsapp|cash job|outside the app|off(?:[ -]?the)?[ -]?app|direct(?:ly)?[ -]?pay|pay[ -]?direct)\b/i

const PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'nz_phone', regex: NZ_PHONE },
  { name: 'au_phone', regex: AU_PHONE },
  { name: 'intl_phone', regex: INTL_PHONE },
  { name: 'email', regex: EMAIL },
  { name: 'phrase', regex: PHRASES },
]

// ─── Public API ───────────────────────────────────────────────────────────────

export interface ContactInfoMatch {
  /** The name of the pattern that matched */
  pattern: string
  /** The matched substring */
  match: string
}

/**
 * Scan `text` for contact-information or circumvention signals.
 * Returns the first match found, or `null` if nothing matched.
 */
export function detectContactInfo(text: string): ContactInfoMatch | null {
  for (const { name, regex } of PATTERNS) {
    const m = text.match(regex)
    if (m) {
      return { pattern: name, match: m[0] }
    }
  }
  return null
}
