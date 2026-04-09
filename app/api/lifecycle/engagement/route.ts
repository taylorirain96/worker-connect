import { NextResponse, NextRequest } from 'next/server'
import { getEngagementScore } from '@/lib/services/churnRiskService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getEngagementScore(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Engagement score error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
