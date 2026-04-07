import { NextRequest, NextResponse } from 'next/server'
import { getReputationScore } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params
    const score = await getReputationScore(userId)
    if (!score) {
      return NextResponse.json({ error: 'Score not found' }, { status: 404 })
    }
    return NextResponse.json(score)
  } catch (err) {
    console.error('[reputation/[userId]]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
