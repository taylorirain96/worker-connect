import { NextResponse, NextRequest } from 'next/server'
import { getPeakPeriods } from '@/lib/services/intelligenceService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId') || 'demo'
    const data = await getPeakPeriods(workerId)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Peak periods error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
