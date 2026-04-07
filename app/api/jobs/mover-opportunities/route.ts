export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') ?? '1')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50)

    if (!city) {
      return NextResponse.json({ error: 'city query param is required' }, { status: 400 })
    }

    // In production: query Firestore for long-term contracts in the target city,
    // prioritising workers with high completion rates and relocation readiness.
    return NextResponse.json({
      jobs: [],
      city,
      page,
      limit,
      total: 0,
      message: 'Mover opportunities endpoint – connect to Firestore for live data',
    })
  } catch (error) {
    console.error('Get mover opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
