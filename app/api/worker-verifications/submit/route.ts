import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * POST /api/worker-verifications/submit
 * Body: { uid, documentType, frontImageUrl, backImageUrl? }
 * Creates/updates workerVerifications/{uid} with status 'pending'.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, documentType, frontImageUrl, backImageUrl } = body as {
      uid?: string
      documentType?: string
      frontImageUrl?: string
      backImageUrl?: string
    }

    if (!uid || !documentType || !frontImageUrl) {
      return NextResponse.json(
        { error: 'uid, documentType and frontImageUrl are required' },
        { status: 400 }
      )
    }

    if (!['nz_drivers_licence', 'nz_passport'].includes(documentType)) {
      return NextResponse.json(
        { error: 'documentType must be nz_drivers_licence or nz_passport' },
        { status: 400 }
      )
    }

    const doc: Record<string, unknown> = {
      uid,
      documentType,
      frontImageUrl,
      status: 'pending',
      submittedAt: FieldValue.serverTimestamp(),
    }
    if (backImageUrl) doc.backImageUrl = backImageUrl

    await adminDb.collection('workerVerifications').doc(uid).set(doc, { merge: true })

    // Mark user doc as pending
    await adminDb
      .collection('users')
      .doc(uid)
      .update({ verificationStatus: 'pending' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/worker-verifications/submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
