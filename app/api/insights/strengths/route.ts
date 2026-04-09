import { NextResponse, NextRequest } from 'next/server'
import { getStrengths } from '@/lib/services/insightsService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getStrengths(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Strengths error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
