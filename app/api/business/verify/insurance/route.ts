import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

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

  // TODO: integrate with insurance verification provider
  const result = {
    hasGeneralLiability: Boolean(hasGeneralLiability),
    generalLiabilityPolicyNumber: generalLiabilityPolicyNumber ?? null,
    generalLiabilityExpiration: generalLiabilityExpiration ?? null,
    generalLiabilityCoverage: generalLiabilityCoverage ?? null,
    hasWorkersComp: Boolean(hasWorkersComp),
    workersCompPolicyNumber: workersCompPolicyNumber ?? null,
    workersCompExpiration: workersCompExpiration ?? null,
    verified: true,
    verifiedAt: new Date().toISOString(),
  }

  await adminDb.collection('businessVerifications').doc(uid).set(
    { insurance: result, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )

  return NextResponse.json(result, { status: 201 })
}
