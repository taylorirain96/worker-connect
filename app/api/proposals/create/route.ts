import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createProposal } from '@/lib/services/proposalService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { jobId, workerId, employerId, proposedTerms, workerName, employerName } = body
    if (!jobId || !workerId || !employerId || !proposedTerms) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const proposalId = await createProposal(
      jobId,
      workerId,
      employerId,
      proposedTerms,
      workerName,
      employerName
    )
    return NextResponse.json({ id: proposalId, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/proposals/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
