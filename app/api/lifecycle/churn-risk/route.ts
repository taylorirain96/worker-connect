import { NextResponse, NextRequest } from 'next/server'
import { getChurnRisk } from '@/lib/services/churnRiskService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const workerId = request.headers.get('x-user-id')
  if (!workerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const data = await getChurnRisk(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Churn risk error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
