import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSupervisorTracking } from '@/lib/services/learningService'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    await updateSupervisorTracking(params.id, body)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/learning-jobs/[id]/supervise error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
