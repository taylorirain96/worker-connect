import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProposalsForJob } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ jobId: string }> }
) {
  const params = await context.params
  try {
    const proposals = await getProposalsForJob(params.jobId)
    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('GET /api/proposals/job/[jobId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
