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
  const {
    hasGeneralLiability,
    generalLiabilityPolicyNumber,
    generalLiabilityExpiration,
    generalLiabilityCoverage,
    hasWorkersComp,
    workersCompPolicyNumber,
    workersCompExpiration,
  } = body

  if (!hasGeneralLiability && !hasWorkersComp) {
    return NextResponse.json(
      { error: 'At least one insurance type must be provided' },
      { status: 400 }
    )
  }

  try {
    const providerResult = await callVerificationProvider({
      endpoint: process.env.BUSINESS_VERIFICATION_INSURANCE_URL,
      payload: {
        userId: uid,
        hasGeneralLiability,
        generalLiabilityPolicyNumber,
        generalLiabilityExpiration,
        generalLiabilityCoverage,
        hasWorkersComp,
        workersCompPolicyNumber,
        workersCompExpiration,
      },
      defaultProvider: 'Insurance Verification API',
    })

    const result = {
      hasGeneralLiability: Boolean(hasGeneralLiability),
      generalLiabilityPolicyNumber: generalLiabilityPolicyNumber ?? null,
      generalLiabilityExpiration: generalLiabilityExpiration ?? null,
      generalLiabilityCoverage: generalLiabilityCoverage ?? null,
      hasWorkersComp: Boolean(hasWorkersComp),
      workersCompPolicyNumber: workersCompPolicyNumber ?? null,
      workersCompExpiration: workersCompExpiration ?? null,
      verified: providerResult.verified,
      verificationStatus: providerResult.status,
      provider: providerResult.provider,
      referenceId: providerResult.referenceId ?? null,
      verifiedAt: providerResult.verified ? new Date().toISOString() : undefined,
      submittedAt: new Date().toISOString(),
    }

    await adminDb.collection('businessVerifications').doc(uid).set(
      { insurance: result, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Insurance verification provider error:', error)
    return NextResponse.json(
      { error: 'Insurance verification provider unavailable. Please try again later.' },
      { status: 503 }
    )
  }
}
