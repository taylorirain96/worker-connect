import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAgreement } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { proposalId, jobId, workerId, employerId, agreedTerms, workerName, employerName } = body
    if (!proposalId || !jobId || !workerId || !employerId || !agreedTerms) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const agreementId = await createAgreement(
      proposalId,
      jobId,
      workerId,
      employerId,
      agreedTerms,
      workerName,
      employerName
    )
    return NextResponse.json({ id: agreementId, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/agreements/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
