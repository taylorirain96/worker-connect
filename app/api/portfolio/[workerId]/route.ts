import { NextRequest, NextResponse } from 'next/server'
import { getPortfolio } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { workerId: string } }
) {
  try {
    const items = await getPortfolio(params.workerId)
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}
