import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { applyToLearningJob } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    const { workerId, message } = body
    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }
    const applicationId = await applyToLearningJob(params.id, workerId, message)
    return NextResponse.json({ id: applicationId, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/learning-jobs/[id]/apply error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
