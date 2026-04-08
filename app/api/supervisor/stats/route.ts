import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSupervisorStats } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const supervisorId = searchParams.get('supervisorId')
    if (!supervisorId) {
      return NextResponse.json({ error: 'supervisorId is required' }, { status: 400 })
    }
    const stats = await getSupervisorStats(supervisorId)
    return NextResponse.json({ stats })
  } catch (error) {
    console.error('GET /api/supervisor/stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
