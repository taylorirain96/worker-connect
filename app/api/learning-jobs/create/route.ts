import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createLearningJob } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      workerId,
      supervisorId,
      employerId,
      requiredSkill,
      skillBeingTaught,
      learningArrangement,
      skillGainedUpon,
      certificationEligible,
      title,
      description,
      location,
      rate,
      originalJobId,
    } = body
    if (!employerId || !requiredSkill || !skillBeingTaught || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const id = await createLearningJob({
      workerId: workerId ?? '',
      supervisorId: supervisorId ?? '',
      employerId,
      originalJobId,
      requiredSkill,
      skillBeingTaught,
      learningArrangement: learningArrangement ?? { supervisorId: '', trainingComponent: '', estimatedHours: 0 },
      skillGainedUpon: skillGainedUpon ?? 'completion',
      certificationEligible: certificationEligible ?? false,
      title,
      description: description ?? '',
      location: location ?? '',
      rate: rate ?? 0,
      status: 'active',
    })
    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/learning-jobs/create error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
