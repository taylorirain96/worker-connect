import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const targetCity = searchParams.get('targetCity') ?? ''
    const opportunities = await getMoverOpportunities(targetCity)
    return NextResponse.json({ opportunities, count: opportunities.length, targetCity })
  } catch (error) {
    console.error('Mover opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
