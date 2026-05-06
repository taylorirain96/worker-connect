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
  const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') ?? '20', 10)))
  const cursor = url.searchParams.get('cursor') ?? null

  try {
    let query = adminDb
      .collection('jobs')
      .where('status', '==', 'open')
      .orderBy('createdAt', 'desc')
      .limit(pageSize + 1)

    if (cursor) {
      const cursorSnap = await adminDb.collection('jobs').doc(cursor).get()
      if (cursorSnap.exists) query = query.startAfter(cursorSnap)
    }

    const snapshot = await query.get()
    const hasMore = snapshot.docs.length > pageSize
    const docs = hasMore ? snapshot.docs.slice(0, pageSize) : snapshot.docs

    const jobs = docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        title: data.title,
        description: data.description,
        category: data.category,
        location: data.location,
        budget: data.budget,
        budgetType: data.budgetType,
        urgency: data.urgency,
        createdAt: data.createdAt,
        country: data.country ?? 'NZ',
      }
    })

    const nextCursor = hasMore ? docs[docs.length - 1].id : null
    return NextResponse.json({ jobs, pageSize, nextCursor, hasMore })
  } catch (err) {
    console.error('partner/jobs GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
