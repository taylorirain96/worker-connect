import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { submitSupervisorFeedback } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      supervisorId,
      learningJobId,
      workerId,
      competencyAssessment,
      strengths,
      improvementAreas,
      readyForIndependent,
      certifyingSkill,
      notes,
    } = body
    if (!supervisorId || !learningJobId || !workerId || competencyAssessment === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const id = await submitSupervisorFeedback({
      supervisorId,
      learningJobId,
      workerId,
      competencyAssessment,
      strengths: strengths ?? [],
      improvementAreas: improvementAreas ?? [],
      readyForIndependent: readyForIndependent ?? false,
      certifyingSkill: certifyingSkill ?? false,
      notes,
    })
    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/supervisor/feedback error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
