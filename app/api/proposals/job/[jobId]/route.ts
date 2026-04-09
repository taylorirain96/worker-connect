import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getProposalsForJob } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const proposals = await getProposalsForJob(params.jobId)
    return NextResponse.json({ proposals })
  } catch (error) {
    console.error('GET /api/proposals/job/[jobId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
