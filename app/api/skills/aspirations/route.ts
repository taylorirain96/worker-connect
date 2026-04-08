import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createSkillAspiration } from '@/lib/services/skillAspirationService'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, targetSkill, currentLevel, targetLevel, motivation, trainingPath } = body
    if (!workerId || !targetSkill || !currentLevel || !targetLevel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const id = await createSkillAspiration(workerId, {
      workerId,
      targetSkill,
      currentLevel,
      targetLevel,
      motivation: motivation ?? '',
      trainingPath: trainingPath ?? [],
      progress: 0,
      resourcesUsed: [],
      status: 'active',
    })
    return NextResponse.json({ id, success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/skills/aspirations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
