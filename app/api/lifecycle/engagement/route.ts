import { NextResponse, NextRequest } from 'next/server'
import { getEngagementScore } from '@/lib/services/churnRiskService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const workerId = request.headers.get('x-user-id')
  if (!workerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await getEngagementScore(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Engagement score error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
