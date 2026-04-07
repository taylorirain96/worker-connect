export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { startVerification } from '@/lib/services/verificationService'
import type { VerificationType } from '@/types/reputation'

const VALID_TYPES: VerificationType[] = [
  'governmentId',
  'backgroundCheck',
  'insurance',
  'certifications',
  'bbbRating',
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, type } = body as { userId?: string; type?: string }

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    if (!type || !VALID_TYPES.includes(type as VerificationType)) {
      return NextResponse.json(
        { error: `type must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    await startVerification(userId, type as VerificationType)

    return NextResponse.json(
      { message: `Verification started for ${type}`, userId, type },
      { status: 200 }
    )
  } catch (error) {
    console.error('Start verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
