import { NextRequest, NextResponse } from 'next/server'
import { getVerificationStatus } from '@/lib/services/verificationService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('userId') ?? request.headers.get('x-user-id')
  if (!workerId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 401 })
  }
  try {
    const records = await getVerificationStatus(workerId)
    return NextResponse.json(records)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch verification status' }, { status: 500 })
  }
}
