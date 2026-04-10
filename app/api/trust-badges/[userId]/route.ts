import { NextRequest, NextResponse } from 'next/server'
import { getReputationScore } from '@/lib/services/reputationService'
import type { ReputationTier } from '@/types/reputation'

export const dynamic = 'force-dynamic'

function getBadges(tier: ReputationTier, shields: number): string[] {
  const badges: string[] = []
  if (tier === 'master') badges.push('Master Worker', 'Top Performer', 'Premium Access')
  else if (tier === 'expert') badges.push('Expert Worker', 'Premium Access')
  else if (tier === 'professional') badges.push('Professional Worker')
  else badges.push('Rookie Worker')
  if (shields >= 4) badges.push('Highly Trusted')
  if (shields === 5) badges.push('Elite Trust')
  return badges
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  const params = await context.params
  try {
    const score = await getReputationScore(params.userId)
    if (!score) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    return NextResponse.json({
      userId: params.userId,
      trustShields: score.trustShields,
      tier: score.tier,
      badges: getBadges(score.tier, score.trustShields),
    })
  } catch (error) {
    console.error('Trust badges error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
