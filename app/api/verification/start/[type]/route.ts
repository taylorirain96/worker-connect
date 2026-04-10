import { NextRequest, NextResponse } from 'next/server'
import { startVerification } from '@/lib/services/verificationService'
import type { VerificationType } from '@/types/reputation'

export const dynamic = 'force-dynamic'

const VALID_TYPES: VerificationType[] = ['government_id', 'background_check', 'insurance', 'certification', 'bbb_rating']

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type: string }> },
) {
  const params = await context.params
  try {
    const type = params.type as VerificationType
    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 })
    }
    const workerId = request.headers.get('x-user-id')
    if (!workerId) {
      return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 400 })
    }
    const verificationItem = await startVerification(workerId, type)
    return NextResponse.json({ verificationItem, message: 'Verification started' })
  } catch (error) {
    console.error('Start verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
