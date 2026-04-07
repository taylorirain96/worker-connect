import { NextRequest, NextResponse } from 'next/server'
import { startVerification } from '@/lib/services/verificationService'
import type { VerificationType } from '@/types/reputation'

const VALID_TYPES: VerificationType[] = ['government_id', 'background_check', 'insurance', 'certification', 'bbb_google']

export async function POST(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  const type = params.type as VerificationType
  if (!VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Invalid verification type' }, { status: 400 })
  }
  const workerId = request.headers.get('x-user-id')
  if (!workerId) {
    return NextResponse.json({ error: 'Missing x-user-id header' }, { status: 401 })
  }
  try {
    const record = await startVerification(workerId, type)
    return NextResponse.json(record, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start verification' }, { status: 500 })
  }
}
