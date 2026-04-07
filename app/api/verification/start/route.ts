import { NextRequest, NextResponse } from 'next/server'
import { startVerification } from '@/lib/services/verificationService'
import type { VerificationType } from '@/types/reputation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workerId, type } = body as { workerId: string; type: VerificationType }

    if (!workerId || !type) {
      return NextResponse.json({ error: 'workerId and type are required' }, { status: 400 })
    }

    const record = await startVerification(workerId, type)
    return NextResponse.json(record)
  } catch (err) {
    console.error('[verification/start]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
