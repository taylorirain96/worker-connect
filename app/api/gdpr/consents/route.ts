import { NextResponse } from 'next/server'
import { getUserConsents, updateUserConsents } from '@/lib/services/gdprService'
import type { UserConsent } from '@/types/global'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const consents = await getUserConsents(userId)
  return NextResponse.json({ consents })
}

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Partial<UserConsent>
  await updateUserConsents(userId, body)
  return NextResponse.json({ success: true })
}
