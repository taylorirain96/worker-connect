import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

async function validateApiKey(key: string): Promise<boolean> {
  if (!key) return false
  const snap = await adminDb.collection('apiKeys').doc(key).get()
  return snap.exists && snap.data()?.active === true
}

export async function GET(req: NextRequest) {
  const apiKey = req.headers.get('x-api-key') ?? ''
  if (!(await validateApiKey(apiKey))) {
    return NextResponse.json({ error: 'Invalid or missing API key' }, { status: 401 })
  }

  const url = new URL(req.url)
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10))
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)))

  try {
    const snapshot = await adminDb
      .collection('users')
      .where('role', '==', 'worker')
      .where('verified', '==', true)
      .get()

    const allWorkers = snapshot.docs.map((d) => {
      const data = d.data()
      return {
        uid: d.id,
        displayName: data.displayName,
        location: data.location,
        skills: data.skills ?? [],
        hourlyRate: data.hourlyRate ?? null,
        rating: data.rating ?? null,
        reviewCount: data.reviewCount ?? 0,
        completedJobs: data.completedJobs ?? 0,
        availability: data.availability ?? 'unavailable',
        country: data.country ?? 'NZ',
      }
    })

    const total = allWorkers.length
    const start = (page - 1) * pageSize
    const workers = allWorkers.slice(start, start + pageSize)

    return NextResponse.json({ workers, total, page, pageSize })
  } catch (err) {
    console.error('partner/workers GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
