import { NextResponse, NextRequest } from 'next/server'
import { storeFeedback } from '@/lib/services/recommendationService'
import type { RecommendationFeedback } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RecommendationFeedback
    await storeFeedback(body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
