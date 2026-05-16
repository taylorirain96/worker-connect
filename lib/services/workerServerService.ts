import { adminDb } from '@/lib/firebase-admin'
import type { UserProfile } from '@/types'

/**
 * Server-side worker fetch used for rendering structured data (ItemList JSON-LD)
 * on the public `/workers` listing page.
 *
 * Uses the Firebase Admin SDK so it can run during SSR. Mirrors the ranking
 * logic in `/api/workers` (rating 60% + completionRate 40%) so the SSR JSON-LD
 * matches what users see once the client hydrates.
 *
 * Returns an empty array if Admin credentials are not configured or the query
 * fails, so the page always renders.
 */
export async function getWorkersServer(maxResults = 20): Promise<UserProfile[]> {
  try {
    const snapshot = await adminDb
      .collection('users')
      .where('role', '==', 'worker')
      .orderBy('rating', 'desc')
      .limit(maxResults)
      .get()

    const workers = snapshot.docs.map(
      (d) => ({ uid: d.id, ...d.data() } as UserProfile),
    )

    workers.sort((a, b) => {
      const scoreA = ((a.rating ?? 0) / 5) * 0.6 + (a.completionRate ?? 0) * 0.4
      const scoreB = ((b.rating ?? 0) / 5) * 0.6 + (b.completionRate ?? 0) * 0.4
      return scoreB - scoreA
    })

    return workers
  } catch (error) {
    console.error('getWorkersServer error:', error)
    return []
  }
}
