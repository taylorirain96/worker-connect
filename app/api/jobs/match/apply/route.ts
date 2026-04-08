import { NextRequest, NextResponse } from 'next/server'
import { createApplication } from '@/lib/services/applicationService'

export const dynamic = 'force-dynamic'

/**
 * POST /api/jobs/match/apply
 * Body: { workerId, jobId, coverLetter? }
 * Creates a job application record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, jobId, coverLetter } = body as {
      workerId?: string
      jobId?: string
      coverLetter?: string
    }

    if (!workerId || !jobId) {
      return NextResponse.json(
        { error: 'workerId and jobId are required' },
        { status: 400 }
      )
    }

    const applicationId = await createApplication(workerId, jobId, coverLetter)

    return NextResponse.json(
      {
        applicationId,
        workerId,
        jobId,
        status: 'pending',
        appliedAt: new Date().toISOString(),
        message: 'Application submitted successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error'
    const status = message.includes('already applied') ? 409 : 500
    console.error('Apply for job error:', error)
    return NextResponse.json({ error: message }, { status })
  }
}
