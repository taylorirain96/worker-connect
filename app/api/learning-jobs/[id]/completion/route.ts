import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { completeLearningJob, getLearningJob } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const job = await getLearningJob(params.id)
    if (!job) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ job })
  } catch (error) {
    console.error('GET /api/learning-jobs/[id]/completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await completeLearningJob(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/learning-jobs/[id]/completion error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
