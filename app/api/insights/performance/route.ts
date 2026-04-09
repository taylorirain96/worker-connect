import { NextResponse, NextRequest } from 'next/server'
import { getPerformanceInsights } from '@/lib/services/insightsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getPerformanceInsights(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Performance insights error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
