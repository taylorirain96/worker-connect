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
  const { licenseNumber, licenseType, state, expirationDate } = body

  if (!licenseNumber || !licenseType || !state || !expirationDate) {
    return NextResponse.json(
      { error: 'licenseNumber, licenseType, state, and expirationDate are required' },
      { status: 400 }
    )
  }

  try {
    const providerResult = await callVerificationProvider({
      endpoint: process.env.BUSINESS_VERIFICATION_LICENSE_URL,
      payload: {
        userId: uid,
        licenseNumber,
        licenseType,
        state,
        expirationDate,
      },
      defaultProvider: 'State Licensing API',
    })

    const result = {
      licenseNumber,
      licenseType,
      state,
      expirationDate,
      verified: providerResult.verified,
      verificationStatus: providerResult.status,
      provider: providerResult.provider,
      referenceId: providerResult.referenceId ?? null,
      verifiedAt: providerResult.verified ? new Date().toISOString() : undefined,
      submittedAt: new Date().toISOString(),
    }

    await adminDb.collection('businessVerifications').doc(uid).set(
      { license: result, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('License verification provider error:', error)
    return NextResponse.json(
      { error: 'License verification provider unavailable. Please try again later.' },
      { status: 503 }
    )
  }
}
