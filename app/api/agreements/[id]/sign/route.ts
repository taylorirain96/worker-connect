import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { signAgreement } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const body = await request.json()
    const { role } = body
    if (!role || (role !== 'worker' && role !== 'employer')) {
      return NextResponse.json({ error: 'Invalid role. Must be worker or employer.' }, { status: 400 })
    }
    await signAgreement(params.id, role)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PUT /api/agreements/[id]/sign error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
