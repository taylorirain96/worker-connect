import { NextRequest, NextResponse } from 'next/server'
import { getReputationScore } from '@/lib/services/reputationService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const params = await context.params
  try {
    const score = await getReputationScore(params.userId)
    if (!score) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }
    return NextResponse.json(score)
  } catch (error) {
    console.error('Get reputation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
