import { NextRequest, NextResponse } from 'next/server'
import { matchWorkersForJob } from '@/lib/services/jobMatchingService'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/match/[jobId]/workers
 * Returns top workers ranked by match score for the given job.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params
  try {
    const { jobId } = params
    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)

    if (!jobId) {
      return NextResponse.json({ error: 'jobId is required' }, { status: 400 })
    }

    const workers = await matchWorkersForJob(jobId, limit)

    return NextResponse.json({
      workers,
      total: workers.length,
      jobId,
    })
  } catch (error) {
    console.error('Worker match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
