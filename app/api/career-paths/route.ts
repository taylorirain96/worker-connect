import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCareerPaths } from '@/lib/services/careerService'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest) {
  try {
    const paths = await getCareerPaths()
    return NextResponse.json({ paths })
  } catch (error) {
    console.error('GET /api/career-paths error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
