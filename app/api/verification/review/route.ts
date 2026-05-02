import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import {
  sendVerificationApprovedEmail,
  sendVerificationRejectedEmail,
} from '@/lib/email/transactional'

export const dynamic = 'force-dynamic'

/**
 * POST /api/verification/review
 * Admin-only route.
 * Body: { adminUid, uid, action: 'approve' | 'reject', rejectionReason? }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { adminUid, uid, action, rejectionReason } = body as {
      adminUid?: string
      uid?: string
      action?: 'approve' | 'reject'
      rejectionReason?: string
    }

    if (!adminUid || !uid || !action) {
      return NextResponse.json(
        { error: 'adminUid, uid and action are required' },
        { status: 400 }
      )
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'action must be approve or reject' }, { status: 400 })
    }

    // Verify the caller is an admin
    const adminSnap = await adminDb.collection('users').doc(adminUid).get()
    const adminData = adminSnap.exists ? adminSnap.data() : null
    if (!adminData || adminData.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const status = action === 'approve' ? 'approved' : 'rejected'
    const verificationUpdate: Record<string, unknown> = {
      status,
      reviewedAt: FieldValue.serverTimestamp(),
    }
    if (action === 'reject' && rejectionReason) {
      verificationUpdate.rejectionReason = rejectionReason
    }

    await adminDb
      .collection('verifications')
      .doc(uid)
      .update(verificationUpdate)

    // Update user doc
    const userUpdate: Record<string, unknown> = {
      verificationStatus: status,
    }
    if (action === 'approve') {
      userUpdate.verified = true
    }
    if (action === 'reject') {
      userUpdate.verified = false
      userUpdate.verificationRejectionReason = rejectionReason ?? null
    }
    await adminDb.collection('users').doc(uid).update(userUpdate)

    // Send email notification (non-blocking)
    ;(async () => {
      try {
        const userSnap = await adminDb.collection('users').doc(uid).get()
        const userData = userSnap.exists ? userSnap.data() : null
        const workerEmail = userData?.email as string | undefined
        const workerName = (userData?.displayName ?? userData?.name ?? 'there') as string

        if (workerEmail) {
          if (action === 'approve') {
            await sendVerificationApprovedEmail({ workerEmail, workerName })
          } else {
            await sendVerificationRejectedEmail({
              workerEmail,
              workerName,
              rejectionReason: rejectionReason ?? 'Your submission did not meet our requirements.',
            })
          }
        }
      } catch (emailErr) {
        console.error('Verification email error:', emailErr)
      }
    })()

    return NextResponse.json({ success: true, status })
  } catch (error) {
    console.error('POST /api/verification/review error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
