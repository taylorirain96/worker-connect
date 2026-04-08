import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, setDoc } from 'firebase/firestore'
import { getSupportedCurrencies } from '@/lib/services/currencyConversionService'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as { currency?: string }
  const { currency } = body

  if (!currency) {
    return NextResponse.json({ error: 'Missing required field: currency' }, { status: 400 })
  }

  const supported = getSupportedCurrencies()
  if (!supported.includes(currency.toUpperCase())) {
    return NextResponse.json({ error: 'Unsupported currency' }, { status: 400 })
  }

  if (db) {
    await setDoc(
      doc(db, 'userCurrencyPreferences', userId),
      { userId, currency: currency.toUpperCase(), updatedAt: new Date().toISOString() },
      { merge: true }
    )
  }

  return NextResponse.json({ success: true, currency: currency.toUpperCase() })
}
