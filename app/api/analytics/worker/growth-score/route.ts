import { NextResponse, NextRequest } from 'next/server'
import { getGrowthScore } from '@/lib/services/analyticsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getGrowthScore(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Growth score error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
