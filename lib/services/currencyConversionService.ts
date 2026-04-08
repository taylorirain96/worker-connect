import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { CurrencyConversion } from '@/types/global'

const STATIC_RATES: Record<string, number> = {
  USD: 1,
  NZD: 1.63,
  AUD: 1.53,
  GBP: 0.79,
  EUR: 0.92,
  CAD: 1.36,
  JPY: 149.50,
  CNY: 7.24,
  INR: 83.12,
  SGD: 1.34,
  HKD: 7.82,
  CHF: 0.90,
  SEK: 10.42,
  NOK: 10.56,
  DKK: 6.89,
  MXN: 17.15,
  BRL: 4.97,
  ZAR: 18.63,
  KRW: 1325.0,
  THB: 35.10,
  PHP: 56.50,
  MYR: 4.72,
  IDR: 15685.0,
  PLN: 4.03,
  CZK: 22.96,
  HUF: 359.0,
  RON: 4.57,
  UAH: 37.33,
  TRY: 30.47,
  AED: 3.67,
  SAR: 3.75,
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
      base: 'USD',
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
