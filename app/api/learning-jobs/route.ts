import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getLearningJobs } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const skill = searchParams.get('skill') ?? undefined
    const jobs = await getLearningJobs(skill)
    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('GET /api/learning-jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
