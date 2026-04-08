import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyCertifications } from '@/lib/services/careerService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    if (!workerId) {
      return NextResponse.json({ error: 'workerId is required' }, { status: 400 })
    }
    const certifications = await verifyCertifications(workerId)
    return NextResponse.json({ certifications, verified: certifications.length > 0 })
  } catch (error) {
    console.error('GET /api/certifications/verify error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
