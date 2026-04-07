import { NextRequest, NextResponse } from 'next/server'
import { getPortfolio, addPortfolioItem } from '@/lib/services/reputationService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('workerId')
  if (!workerId) {
    return NextResponse.json({ error: 'workerId query param is required' }, { status: 400 })
  }
  try {
    const items = await getPortfolio(workerId)
    return NextResponse.json(items)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const id = await addPortfolioItem(body)
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to add portfolio item' }, { status: 500 })
  }
}
