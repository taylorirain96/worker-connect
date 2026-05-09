import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import { callVerificationProvider } from '@/lib/business-verification/providerClient'

export async function POST(request: NextRequest) {
  const uid = request.headers.get('x-user-id')
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { provider } = body

  try {
    const providerResult = await callVerificationProvider({
      endpoint: process.env.BUSINESS_VERIFICATION_BACKGROUND_URL,
      payload: {
        userId: uid,
        provider: provider ?? 'Checkr',
      },
      defaultProvider: provider ?? 'Checkr',
    })

    const result = {
      status: providerResult.status,
      provider: providerResult.provider ?? provider ?? 'Checkr',
      referenceId: providerResult.referenceId ?? null,
      initiatedAt: new Date().toISOString(),
      completedAt: providerResult.verified ? new Date().toISOString() : undefined,
      message:
        providerResult.status === 'clear'
          ? 'Background check complete.'
          : 'Background check initiated. You will be notified when the check is complete.',
    }

    await adminDb.collection('businessVerifications').doc(uid).set(
      {
        backgroundCheck: result,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    )

    return NextResponse.json(result, { status: 202 })
  } catch (error) {
    console.error('Background check provider error:', error)
    return NextResponse.json(
      { error: 'Background check provider unavailable. Please try again later.' },
      { status: 503 }
    )
  }
}
