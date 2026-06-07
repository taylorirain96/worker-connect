import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { CurrencyConversion } from '@/types/global'

// Static fallback rates relative to NZD (last updated 2024-01).
// These are used when Firestore cache is unavailable or stale.
const STATIC_RATES: Record<string, number> = {
  NZD: 1,
  AUD: 0.94,
  USD: 0.61,
  GBP: 0.48,
  EUR: 0.56,
  CAD: 0.83,
  JPY: 91.72,
  CNY: 4.44,
  INR: 50.99,
  SGD: 0.82,
  HKD: 4.80,
  CHF: 0.55,
  SEK: 6.39,
  NOK: 6.48,
  DKK: 4.23,
  MXN: 10.52,
  BRL: 3.05,
  ZAR: 11.43,
  KRW: 812.88,
  THB: 21.53,
  PHP: 34.66,
  MYR: 2.90,
  IDR: 9622.70,
  PLN: 2.47,
  CZK: 14.09,
  HUF: 220.25,
  RON: 2.80,
  UAH: 22.90,
  TRY: 18.69,
  AED: 2.25,
  SAR: 2.30,
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000

export async function getExchangeRates(): Promise<Record<string, number>> {
  if (!db) return STATIC_RATES

  const today = new Date().toISOString().split('T')[0]
  const cacheRef = doc(db, 'currencyRates', today)

  try {
    const cached = await getDoc(cacheRef)
    if (cached.exists()) {
      const data = cached.data()
      const age = Date.now() - new Date(data.timestamp as string).getTime()
      if (age < CACHE_TTL_MS) {
        return data.rates as Record<string, number>
      }
    }
    await setDoc(cacheRef, {
      date: today,
      base: 'NZD',
      rates: STATIC_RATES,
      timestamp: new Date().toISOString(),
    })
  } catch {
    // fall through to static rates
  }

  return STATIC_RATES
}

export async function convertCurrency(
  amount: number,
  from: string,
  to: string
): Promise<CurrencyConversion> {
  const rates = await getExchangeRates()
  const fromRate = rates[from.toUpperCase()] ?? 1
  const toRate = rates[to.toUpperCase()] ?? 1
  const rate = toRate / fromRate
  const convertedAmount = amount * rate

  return {
    from: from.toUpperCase(),
    to: to.toUpperCase(),
    amount,
    convertedAmount,
    rate,
    timestamp: new Date().toISOString(),
  }
}

export function getSupportedCurrencies(): string[] {
  return Object.keys(STATIC_RATES)
}
