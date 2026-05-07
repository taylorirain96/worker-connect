import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/dashboard/admin/verifications
 * Returns all verification submissions joined with basic user info.
 */
export async function GET() {
  try {
    const snap = await adminDb
      .collection('verifications')
      .orderBy('submittedAt', 'desc')
      .limit(200)
      .get()

    const verifications = await Promise.all(
      snap.docs.map(async (docSnap) => {
        const data = docSnap.data()
        const uid = docSnap.id

        // Attempt to join user display name and email
        let workerName: string | undefined
        let workerEmail: string | undefined
        try {
          const userSnap = await adminDb.collection('users').doc(uid).get()
          if (userSnap.exists) {
            const u = userSnap.data()!
            workerName = (u.displayName ?? u.name ?? undefined) as string | undefined
            workerEmail = (u.email ?? undefined) as string | undefined
          }
        } catch {
          // User doc unavailable — continue without it
        }

        const submittedAt =
          data.submittedAt && typeof data.submittedAt.toDate === 'function'
            ? data.submittedAt.toDate().toISOString()
            : (data.submittedAt as string | undefined)

        const reviewedAt =
          data.reviewedAt && typeof data.reviewedAt.toDate === 'function'
            ? data.reviewedAt.toDate().toISOString()
            : (data.reviewedAt as string | undefined)

        return {
          uid,
          status: data.status as 'pending' | 'approved' | 'rejected',
          frontUrl: (data.frontUrl as string | undefined),
          backUrl: (data.backUrl as string | undefined),
          selfieUrl: (data.selfieUrl as string | undefined),
          rejectionReason: (data.rejectionReason as string | undefined),
          submittedAt,
          reviewedAt,
          workerName,
          workerEmail,
        }
      })
    )

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('GET /api/dashboard/admin/verifications error:', error)
    // Return empty list so the UI degrades gracefully when Firestore is not configured
    return NextResponse.json({ verifications: [] })
  }
}
