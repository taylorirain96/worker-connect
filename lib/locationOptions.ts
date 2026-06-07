import type { Country } from '@/types'
import { NZ_REGIONS } from '@/lib/seo/regions'

export const REGISTRATION_COUNTRY_OPTIONS: Array<{ value: Country; label: string }> = [
  { value: 'NZ', label: 'New Zealand' },
  { value: 'AU', label: 'Australia' },
]

const uniqueNZRegions = Array.from(new Set(NZ_REGIONS.map((region) => region.region)))

export const LOCATION_OPTIONS: Record<Country, Array<{ value: string; label: string }>> = {
  NZ: uniqueNZRegions.map((region) => ({ value: region, label: region })),
  AU: [
    { value: 'NSW', label: 'New South Wales (NSW)' },
    { value: 'VIC', label: 'Victoria (VIC)' },
    { value: 'QLD', label: 'Queensland (QLD)' },
    { value: 'WA', label: 'Western Australia (WA)' },
    { value: 'SA', label: 'South Australia (SA)' },
    { value: 'TAS', label: 'Tasmania (TAS)' },
    { value: 'ACT', label: 'Australian Capital Territory (ACT)' },
    { value: 'NT', label: 'Northern Territory (NT)' },
  ],
}

export function getLocationOptions(country: Country) {
  return LOCATION_OPTIONS[country]
}

export function getRegionLabel(country: Country) {
  return country === 'AU' ? 'State / Territory' : 'Region'
}

export function getCityLabel(country: Country) {
  return country === 'AU' ? 'City / Suburb' : 'Town / Suburb'
}

export function getMobilePlaceholder(country: Country) {
  return country === 'AU' ? '+61 412 345 678' : '+64 21 123 4567'
}

export function isValidRegion(country: Country, region: string) {
  return LOCATION_OPTIONS[country].some((option) => option.value === region)
}

export function buildLocationLabel(city: string, region: string) {
  return `${city.trim()}, ${region.trim()}`
}

function getMobileRule(country: Country) {
  return country === 'AU'
    ? {
        code: '61',
        prefix: '+61',
        localPrefix: '0',
        pattern: /^4\d{8}$/,
        formatter: (nationalNumber: string) =>
          `+61 ${nationalNumber.slice(0, 3)} ${nationalNumber.slice(3, 6)} ${nationalNumber.slice(6)}`,
      }
    : {
        code: '64',
        prefix: '+64',
        localPrefix: '0',
        pattern: /^2\d{7,9}$/,
        formatter: (nationalNumber: string) => {
          const remainder = nationalNumber.slice(2)
          if (remainder.length <= 6) {
            return `+64 ${nationalNumber.slice(0, 2)} ${remainder.slice(0, 3)} ${remainder.slice(3)}`.trim()
          }

          return `+64 ${nationalNumber.slice(0, 2)} ${remainder.slice(0, 3)} ${remainder.slice(3, 6)} ${remainder.slice(6)}`.trim()
        },
      }
}

export function normalizeLocalizedMobile(value: string, country: Country) {
  const trimmed = value.trim()
  if (!trimmed) return null

  const rule = getMobileRule(country)
  let digits = trimmed.replace(/\D/g, '')

  if (digits.startsWith(rule.code)) {
    digits = digits.slice(rule.code.length)
  } else if (digits.startsWith(rule.localPrefix)) {
    digits = digits.slice(1)
  }

  if (!rule.pattern.test(digits)) {
    return null
  }

  return `${rule.prefix}${digits}`
}

export function formatLocalizedMobile(value: string, country: Country) {
  const normalized = normalizeLocalizedMobile(value, country)
  if (!normalized) return value.trim()

  const rule = getMobileRule(country)
  return rule.formatter(normalized.slice(rule.prefix.length))
}
