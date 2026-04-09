import { NextResponse, NextRequest } from 'next/server'
import { getChurnRisk } from '@/lib/services/churnRiskService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getChurnRisk(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Churn risk error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
