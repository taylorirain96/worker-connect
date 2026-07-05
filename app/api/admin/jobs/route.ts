import type { QueryDocumentSnapshot } from 'firebase-admin/firestore'
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl
    const limitParam = parseInt(searchParams.get('limit') ?? '20')
    const status = searchParams.get('status')

    let query = adminDb.collection('jobs').orderBy('createdAt', 'desc').limit(limitParam)
    if (status) {
      query = adminDb.collection('jobs').where('status', '==', status).orderBy('createdAt', 'desc').limit(limitParam)
    }

    const snap = await query.get()
    const jobs = snap.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      title: doc.data().title ?? '',
      category: doc.data().category ?? '',
      status: doc.data().status ?? '',
      budget: doc.data().budget ?? 0,
      createdAt: doc.data().createdAt ?? '',
      flagged: doc.data().flagged ?? false,
    }))

    return NextResponse.json({ jobs, total: jobs.length })
  } catch (error) {
    console.error('Get admin jobs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
