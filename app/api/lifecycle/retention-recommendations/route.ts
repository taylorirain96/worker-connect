import { NextResponse, NextRequest } from 'next/server'
import { getRetentionRecommendations } from '@/lib/services/churnRiskService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getRetentionRecommendations(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Retention recommendations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
