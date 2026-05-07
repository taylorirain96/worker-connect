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
  const { provider } = body

  // TODO: integrate with Checkr or another background check provider
  const result = {
    status: 'pending' as const,
    provider: provider ?? 'Checkr',
    initiatedAt: new Date().toISOString(),
    message:
      'Background check initiated. You will be notified by email when the check is complete (typically 1–3 business days).',
  }

  await adminDb.collection('businessVerifications').doc(uid).set(
    {
      backgroundCheck: {
        status: 'pending',
        provider: result.provider,
      },
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true }
  )

  return NextResponse.json(result, { status: 202 })
}
