export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getTrustBadges } from '@/lib/services/reputationService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const trust = await getTrustBadges(userId)

    if (!trust) {
      return NextResponse.json(
        { error: 'Trust badge data not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(trust)
  } catch (error) {
    console.error('Get trust badges error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
