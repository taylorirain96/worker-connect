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
  const { licenseNumber, licenseType, state, expirationDate } = body

  if (!licenseNumber || !licenseType || !state || !expirationDate) {
    return NextResponse.json(
      { error: 'licenseNumber, licenseType, state, and expirationDate are required' },
      { status: 400 }
    )
  }

  // TODO: integrate with state licensing database for real verification
  const result = {
    licenseNumber,
    licenseType,
    state,
    expirationDate,
    verified: true,
    verifiedAt: new Date().toISOString(),
  }

  await adminDb.collection('businessVerifications').doc(uid).set(
    { license: result, updatedAt: FieldValue.serverTimestamp() },
    { merge: true }
  )

  return NextResponse.json(result, { status: 201 })
}
