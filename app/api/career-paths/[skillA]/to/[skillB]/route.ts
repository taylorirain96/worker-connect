import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCareerPath } from '@/lib/services/careerService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { skillA: string; skillB: string } }
) {
  try {
    const path = await getCareerPath(
      decodeURIComponent(params.skillA),
      decodeURIComponent(params.skillB)
    )
    if (!path) {
      return NextResponse.json({ error: 'Career path not found' }, { status: 404 })
    }
    return NextResponse.json({ path })
  } catch (error) {
    console.error('GET /api/career-paths/[skillA]/to/[skillB] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
