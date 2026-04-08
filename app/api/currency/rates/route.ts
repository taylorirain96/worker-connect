import { NextResponse } from 'next/server'
import { getExchangeRates } from '@/lib/services/currencyConversionService'

export const dynamic = 'force-dynamic'

export async function GET() {
  const rates = await getExchangeRates()
  return NextResponse.json({
    base: 'USD',
    rates,
    timestamp: new Date().toISOString(),
  })
}
