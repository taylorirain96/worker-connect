import { NextRequest, NextResponse } from 'next/server'
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { PortfolioProject } from '@/types/reputation'

const PORTFOLIO_COL = 'portfolioProjects'

export async function GET(request: NextRequest) {
  try {
    const workerId = request.nextUrl.searchParams.get('workerId')
    if (!workerId) {
      return NextResponse.json({ error: 'workerId query param is required' }, { status: 400 })
    }
    if (!db) return NextResponse.json([])

    const q = query(collection(db, PORTFOLIO_COL), where('workerId', '==', workerId))
    const snap = await getDocs(q)
    const projects = snap.docs.map((d) => ({ ...d.data(), id: d.id } as PortfolioProject))
    return NextResponse.json(projects)
  } catch (err) {
    console.error('[portfolio GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

    const body = (await request.json()) as Omit<PortfolioProject, 'id'>
    const ref = await addDoc(collection(db, PORTFOLIO_COL), {
      ...body,
      completedAt: body.completedAt ?? new Date().toISOString(),
    })

    return NextResponse.json({ id: ref.id, ...body }, { status: 201 })
  } catch (err) {
    console.error('[portfolio POST]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
