import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

export const dynamic = 'force-dynamic'

/**
 * POST /api/verification/submit
 * Body: { uid, frontUrl, backUrl?, selfieUrl }
 * Creates/updates verifications/{uid} with status 'pending'.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { uid, frontUrl, backUrl, selfieUrl } = body as {
      uid?: string
      frontUrl?: string
      backUrl?: string
      selfieUrl?: string
    }

    if (!uid || !frontUrl || !selfieUrl) {
      return NextResponse.json(
        { error: 'uid, frontUrl and selfieUrl are required' },
        { status: 400 }
      )
    }

    const doc: Record<string, unknown> = {
      uid,
      status: 'pending',
      frontUrl,
      selfieUrl,
      submittedAt: FieldValue.serverTimestamp(),
    }
    if (backUrl) doc.backUrl = backUrl

    await adminDb.collection('verifications').doc(uid).set(doc, { merge: true })

    // Mark user doc as pending so the dashboard can reflect it
    await adminDb
      .collection('users')
      .doc(uid)
      .update({ verificationStatus: 'pending' })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('POST /api/verification/submit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
