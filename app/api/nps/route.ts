import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { rateLimit } from '@/lib/rateLimit'
import type { NPSSurvey } from '@/types'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (rateLimit(request, { max: 5, windowMs: 60_000 })) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json() as {
      jobId?: string
      score?: unknown
      comment?: string
      role?: string
    }
    const { jobId, score, comment, role } = body

    if (!jobId || !role) {
      return NextResponse.json({ error: 'jobId and role are required' }, { status: 400 })
    }

    const scoreNum = Number(score)
    if (!Number.isInteger(scoreNum) || scoreNum < 0 || scoreNum > 10) {
      return NextResponse.json({ error: 'score must be an integer 0–10' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const survey: Omit<NPSSurvey, 'id'> = {
      userId,
      jobId,
      role: role as NPSSurvey['role'],
      score: scoreNum,
      comment,
      triggeredAt: now,
      submittedAt: now,
      createdAt: now,
    }

    await adminDb.collection('npsSurveys').add(survey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('NPS submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const userSnap = await adminDb.collection('users').doc(userId).get()
    const userData = userSnap.data()
    if (userData?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const snap = await adminDb.collection('npsSurveys')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()

    const surveys = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as (NPSSurvey & { id: string })[]

    const total = surveys.length
    const promoters = surveys.filter((s) => s.score >= 9).length
    const passives = surveys.filter((s) => s.score >= 7 && s.score <= 8).length
    const detractors = surveys.filter((s) => s.score <= 6).length
    const avgScore = total > 0 ? surveys.reduce((sum, s) => sum + s.score, 0) / total : 0
    const npsScore = total > 0 ? Math.round(((promoters - detractors) / total) * 100) : 0

    return NextResponse.json({
      avgScore: Math.round(avgScore * 10) / 10,
      promoters,
      passives,
      detractors,
      npsScore,
      total,
      recentResponses: surveys.slice(0, 20),
    })
  } catch (error) {
    console.error('NPS get error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
