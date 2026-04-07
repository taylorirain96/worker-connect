import { NextRequest, NextResponse } from 'next/server'
import { getVerificationStatus } from '@/lib/services/verificationService'

export async function GET(request: NextRequest) {
  try {
    const workerId = request.nextUrl.searchParams.get('workerId')
    if (!workerId) {
      return NextResponse.json({ error: 'workerId query param is required' }, { status: 400 })
    }

    const profile = await getVerificationStatus(workerId)
    return NextResponse.json(profile)
  } catch (err) {
    console.error('[verification/status]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
