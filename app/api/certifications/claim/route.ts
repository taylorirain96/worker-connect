import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { claimCertification } from '@/lib/services/careerService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, workerName, skill, level, issuedBy, learningJobId, supervisorId } = body
    if (!workerId || !skill || !level || !issuedBy) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const id = await claimCertification({
      workerId,
      workerName,
      skill,
      level,
      issuedBy,
      issuedAt: new Date().toISOString(),
      learningJobId,
      supervisorId,
      verified: false,
    })
    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/certifications/claim error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
