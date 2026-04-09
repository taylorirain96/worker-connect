import { NextResponse, NextRequest } from 'next/server'
import { getSkillsDemand } from '@/lib/services/analyticsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getSkillsDemand(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Skills demand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
