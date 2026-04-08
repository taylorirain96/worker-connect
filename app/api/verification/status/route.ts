import { NextRequest, NextResponse } from 'next/server'
import { getWorkerVerification } from '@/lib/services/verificationService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = request.headers.get('x-user-id') || searchParams.get('workerId')
    if (!workerId) {
      return NextResponse.json({ error: 'Missing workerId' }, { status: 400 })
    }
    const verification = await getWorkerVerification(workerId)
    return NextResponse.json({
      verification,
      verificationScore: verification?.verificationScore ?? 0,
    })
  } catch (error) {
    console.error('Verification status error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
