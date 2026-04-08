import { NextResponse } from 'next/server'
import { platformFinancialService } from '@/lib/services/platformFinancialService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { year: string } }
) {
  try {
    const year = parseInt(params.year)
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }
    const summary = await platformFinancialService.getYearlyFinancials(year)
    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching yearly financials:', error)
    return NextResponse.json({ error: 'Failed to fetch yearly financials' }, { status: 500 })
  }
}
