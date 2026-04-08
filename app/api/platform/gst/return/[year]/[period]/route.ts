import { NextResponse } from 'next/server'
import { gstService } from '@/lib/services/gstService'

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { year: string; period: string } }
) {
  try {
    const year = parseInt(params.year)
    const period = parseInt(params.period) // 1=Jan/Feb, 2=Mar/Apr, etc.

    if (isNaN(year) || isNaN(period) || period < 1 || period > 6) {
      return NextResponse.json({ error: 'Invalid year or period (1-6 for bimonthly)' }, { status: 400 })
    }

    const startMonth = (period - 1) * 2 + 1
    const endMonth = startMonth + 1
    const startDate = `${year}-${String(startMonth).padStart(2, '0')}-01`
    const lastDay = new Date(year, endMonth, 0).getDate()
    const endDate = `${year}-${String(endMonth).padStart(2, '0')}-${lastDay}`

    const gstReturn = await gstService.generateGSTReturn(year, startDate, endDate)
    return NextResponse.json(gstReturn)
  } catch (error: unknown) {
    console.error('Error generating GST return:', error)
    if (error instanceof Error && error.message?.includes('not registered')) {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }
    return NextResponse.json({ error: 'Failed to generate GST return' }, { status: 500 })
  }
}
