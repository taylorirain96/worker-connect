import { NextRequest, NextResponse } from 'next/server'
import { getMoverOpportunities } from '@/lib/services/moverService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city') ?? ''
  const category = searchParams.get('category') ?? undefined
  if (!city) {
    return NextResponse.json({ error: 'city query param is required' }, { status: 400 })
  }
  try {
    const opportunities = await getMoverOpportunities(city, category)
    return NextResponse.json(opportunities)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mover opportunities' }, { status: 500 })
  }
}
