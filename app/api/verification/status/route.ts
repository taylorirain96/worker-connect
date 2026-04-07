export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getVerificationProfile } from '@/lib/services/verificationService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'userId query param is required' }, { status: 400 })
    }

    const profile = await getVerificationProfile(userId)

    if (!profile) {
      return NextResponse.json({
        userId,
        verificationLevel: 0,
        governmentId: { status: 'unverified', verified: false },
        backgroundCheck: { status: 'unverified', verified: false },
        insurance: { status: 'unverified', verified: false },
        certifications: [],
        bbbRating: { status: 'unverified', verified: false },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
