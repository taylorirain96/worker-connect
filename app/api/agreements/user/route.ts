import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserAgreements } from '@/lib/services/agreementService'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }
    const agreements = await getUserAgreements(userId)
    return NextResponse.json({ agreements })
  } catch (error) {
    console.error('GET /api/agreements/user error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
