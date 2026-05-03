import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/worker-verifications
 * Returns all workerVerification submissions joined with basic user info.
 */
export async function GET() {
  try {
    const snap = await adminDb
      .collection('workerVerifications')
      .orderBy('submittedAt', 'desc')
      .limit(200)
      .get()

    const verifications = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      snap.docs.map(async (docSnap: any) => {
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
          documentType: (data.documentType as string | undefined),
          frontImageUrl: (data.frontImageUrl as string | undefined),
          backImageUrl: (data.backImageUrl as string | undefined),
          rejectionReason: (data.rejectionReason as string | undefined),
          submittedAt,
          reviewedAt,
          reviewedBy: (data.reviewedBy as string | undefined),
          workerName,
          workerEmail,
        }
      })
    )

    return NextResponse.json({ verifications })
  } catch (error) {
    console.error('GET /api/worker-verifications error:', error)
    return NextResponse.json({ verifications: [] })
  }
}
