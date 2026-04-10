import { NextResponse } from 'next/server'
import { platformFinancialService } from '@/lib/services/platformFinancialService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  context: { params: Promise<{ year: string }> }
) {
  const params = await context.params
  try {
    const year = parseInt(params.year)
    if (isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }
    const csv = await platformFinancialService.generateAccountantCSV(year)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="platform-financials-${year}.csv"`,
      },
    })
  } catch (error) {
    console.error('Error exporting accountant CSV:', error)
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 })
  }
}
