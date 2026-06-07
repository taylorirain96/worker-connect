import { adminDb } from '@/lib/firebase-admin'
import type { Country } from '@/types'

const SUPPORTED_JOB_COUNTRIES: Country[] = ['NZ', 'AU']

export function normalizeJobCountry(value: unknown): Country | null {
  if (typeof value !== 'string') return null
  const upper = value.toUpperCase()
  return SUPPORTED_JOB_COUNTRIES.includes(upper as Country) ? (upper as Country) : null
}

export function getCurrencyForJobCountry(country: Country | null | undefined): 'nzd' | 'aud' {
  return country === 'AU' ? 'aud' : 'nzd'
}

export function getCurrencyLabelForJobCountry(country: Country | null | undefined): 'NZ$' | 'A$' {
  return country === 'AU' ? 'A$' : 'NZ$'
}

export async function getJobCountryById(jobId: string): Promise<Country | null> {
  if (!jobId || !adminDb) return null
  const jobSnap = await adminDb.collection('jobs').doc(jobId).get()
  if (!jobSnap.exists) return null
  return normalizeJobCountry(jobSnap.data()?.country)
}

export function getCountryFromPackageData(data: Record<string, unknown> | undefined): Country | null {
  if (!data) return null
  return normalizeJobCountry(data.country ?? data.countryCode)
}
