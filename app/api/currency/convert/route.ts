import { NextResponse } from 'next/server'
import { convertCurrency } from '@/lib/services/currencyConversionService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const amountStr = searchParams.get('amount')

  if (!from || !to || !amountStr) {
    return NextResponse.json(
      { error: 'Missing required params: from, to, amount' },
      { status: 400 }
    )
  }

  const amount = parseFloat(amountStr)
  if (isNaN(amount) || amount < 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  const result = await convertCurrency(amount, from, to)
  return NextResponse.json(result)
}
