import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import type { PortfolioItem, WorkerPortfolio } from '@/types/reputation'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ workerId: string }> },
) {
  const params = await context.params
  try {
    if (!db) {
      return NextResponse.json({ portfolio: null })
    }
    const ref = doc(db, 'portfolios', params.workerId)
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      return NextResponse.json({ portfolio: null })
    }
    return NextResponse.json({ portfolio: snap.data() as WorkerPortfolio })
  } catch (error) {
    console.error('Get portfolio error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ workerId: string }> },
) {
  const params = await context.params
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })
    }
    const body = await request.json()
    const newItem: PortfolioItem = {
      ...body,
      id: `portfolio_${params.workerId}_${Date.now()}`,
      workerId: params.workerId,
      completedAt: body.completedAt || new Date().toISOString(),
      tags: body.tags || [],
    }
    const portfolioRef = doc(db, 'portfolios', params.workerId)
    const snap = await getDoc(portfolioRef)
    const existing: WorkerPortfolio = snap.exists()
      ? (snap.data() as WorkerPortfolio)
      : { workerId: params.workerId, items: [], totalProjects: 0, avgRating: 0 }
    const items = [...existing.items, newItem]
    const ratings = items
      .filter(i => i.clientTestimonial?.rating)
      .map(i => i.clientTestimonial!.rating)
    const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0
    const updated: WorkerPortfolio = {
      ...existing,
      items,
      totalProjects: items.length,
      avgRating: parseFloat(avgRating.toFixed(2)),
    }
    await setDoc(portfolioRef, updated)
    return NextResponse.json({ item: newItem })
  } catch (error) {
    console.error('Create portfolio item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
