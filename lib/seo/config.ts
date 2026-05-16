const DEFAULT_SITE_URL = 'https://quicktrade.co.nz'

function normalizeUrl(url?: string | null) {
  if (!url) return DEFAULT_SITE_URL
  return url.replace(/\/$/, '')
}

export const SITE_URL = normalizeUrl(process.env.NEXT_PUBLIC_APP_URL)
export const SITE_NAME = 'QuickTrade'
export const SITE_TWITTER = '@QuickTradeNZ'
export const SITE_EMAIL = 'support@quicktrade.co.nz'
export const SITE_DESCRIPTION = "New Zealand's trusted marketplace for local tradespeople. Hire verified plumbers, electricians, builders, cleaners and more — fast, safe, and affordable."

export const AU_SITE_DESCRIPTION = "Australia's trusted marketplace for local tradies. Hire verified plumbers, electricians, builders, cleaners and more across Sydney, Melbourne, Brisbane and beyond — fast, safe, and affordable."

export const AU_CANONICAL_BASE = `${SITE_URL}/au`

export function absoluteUrl(path = '/') {
  return path.startsWith('http')
    ? path
    : `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`
}
