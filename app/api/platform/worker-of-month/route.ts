import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const snap = await adminDb.collection('users')
      .where('role', '==', 'worker')
      .where('completedJobs', '>=', 5)
      .orderBy('completedJobs', 'desc')
      .orderBy('rating', 'desc')
      .limit(1)
      .get()

    if (snap.empty) {
      return NextResponse.json(
        { worker: null },
        { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
      )
    }

    const doc = snap.docs[0]
    const d = doc.data()

    const worker = {
      uid: doc.id,
      displayName: d.displayName,
      photoURL: d.photoURL,
      location: d.location,
      rating: d.rating,
      completedJobs: d.completedJobs,
      skills: d.skills,
      completionRate: d.completionRate,
    }

    return NextResponse.json(
      { worker },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=300' } }
    )
  } catch {
    return NextResponse.json({ worker: null })
  }
}
