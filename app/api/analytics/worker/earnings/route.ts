import { NextResponse, NextRequest } from 'next/server'
import { getEarningsTrends } from '@/lib/services/analyticsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const workerId = request.headers.get('x-user-id')
  if (!workerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const period = (searchParams.get('period') as 'daily' | 'weekly' | 'monthly') || 'monthly'
    const data = await getEarningsTrends(workerId, period)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Earnings trends error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
