import { NextResponse, NextRequest } from 'next/server'
import { getEarningsTrends } from '@/lib/services/analyticsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'monthly'
    const data = await getEarningsTrends(workerId, period)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Earnings trends error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
