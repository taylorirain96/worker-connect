import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'  // ✅ CORRECT
import { getSkillAspirations } from '@/lib/services/skillAspirationService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const aspirations = await getSkillAspirations(params.userId)
    return NextResponse.json({ aspirations })
  } catch (error) {
    console.error('GET /api/skills/aspirations/user/[userId] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
