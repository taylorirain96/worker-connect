import { NextResponse, NextRequest } from 'next/server'
import { getEarningsProjection } from '@/lib/services/intelligenceService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const workerId = request.headers.get('x-user-id')
  if (!workerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6', 10)
    const data = await getEarningsProjection(workerId, months)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Earnings projection error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
