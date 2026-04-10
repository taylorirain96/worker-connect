import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  updateSkillAspiration,
  deleteSkillAspiration,
} from '@/lib/services/skillAspirationService'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ aspirationId: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    await updateSkillAspiration(params.aspirationId, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/skills/aspirations/[aspirationId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ aspirationId: string }> }
) {
  const params = await context.params
  try {
    await deleteSkillAspiration(params.aspirationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/skills/aspirations/[aspirationId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
