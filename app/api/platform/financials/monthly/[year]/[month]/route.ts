import { NextResponse } from 'next/server'
import { platformFinancialService } from '@/lib/services/platformFinancialService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ year: string; month: string }> }
) {
  const params = await context.params
  try {
    const year = parseInt(params.year)
    const month = parseInt(params.month)
    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid year or month' }, { status: 400 })
    }
    const financials = await platformFinancialService.getMonthlyFinancials(year, month)
    return NextResponse.json(financials)
  } catch (error) {
    console.error('Error fetching monthly financials:', error)
    return NextResponse.json({ error: 'Failed to fetch monthly financials' }, { status: 500 })
  }
}
