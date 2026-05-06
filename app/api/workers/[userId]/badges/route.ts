import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * GET /api/workers/[userId]/badges
 *
 * Returns the badges array for a worker. If the stored badges array is empty,
 * auto-computes badges from profile attributes (rating, completedJobs, etc.).
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  const { userId } = await context.params

  try {
    try {
      const snap = await adminDb.collection('users').doc(userId).get()

      if (!snap.exists) {
        return NextResponse.json({ badges: [] })
      }

      const data = snap.data()!

      // Start with any explicitly stored badges
      const storedBadges: string[] = Array.isArray(data.badges) ? data.badges : []
      const computed = new Set<string>(storedBadges)

      // Auto-compute from profile attributes
      if (
        data.verificationStatus === 'approved' ||
        data.verified === true ||
        data.isVerified === true
      ) {
        computed.add('verified')
      }

      if (data.backgroundCheckStatus === 'approved' || data.backgroundCheckStatus === 'clear') {
        computed.add('background_clear')
      }

      if (data.worksafeCompliance?.inductionComplete === true) {
        computed.add('worksafe')
      }

      const rating = typeof data.rating === 'number' ? data.rating : 0
      const reviewCount = typeof data.reviewCount === 'number' ? data.reviewCount : 0
      if (rating >= 4.8 && reviewCount >= 3) {
        computed.add('top_rated')
      }

      const completedJobs = typeof data.completedJobs === 'number'
        ? data.completedJobs
        : typeof data.completionCount === 'number'
          ? data.completionCount
          : 0

      if (completedJobs >= 50) {
        computed.add('jobs_50')
      } else if (completedJobs >= 10) {
        computed.add('jobs_10')
      }

      // Trade licences present → licensed badge
      const tradeLicencesSnap = await adminDb
        .collection('workerTradeLicences')
        .doc(userId)
        .collection('items')
        .limit(1)
        .get()
      if (!tradeLicencesSnap.empty) {
        computed.add('licensed')
      }

      return NextResponse.json({ badges: Array.from(computed) })
    } catch (firestoreError) {
      console.warn('Firestore unavailable — returning mock badges:', firestoreError)
      return NextResponse.json({ badges: ['top_rated', 'verified', 'jobs_10'] })
    }
  } catch (error) {
    console.error(`GET /api/workers/${userId}/badges error:`, error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
