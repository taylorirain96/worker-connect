import { NextRequest, NextResponse } from 'next/server'
import { matchJobsForWorker } from '@/lib/services/jobMatchingService'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/match
 * Query params: workerId, limit, offset
 * Returns matched jobs for the given worker, sorted by match score.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const offset = parseInt(searchParams.get('offset') ?? '0', 10)

    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }

    const allJobs = await matchJobsForWorker(workerId, undefined, limit + offset)
    const paginatedJobs = allJobs.slice(offset, offset + limit)

    return NextResponse.json({
      jobs: paginatedJobs,
      total: allJobs.length,
      page: Math.floor(offset / limit) + 1,
      limit,
      offset,
    })
  } catch (error) {
    console.error('Job match error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
