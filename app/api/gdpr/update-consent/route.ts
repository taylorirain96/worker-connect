import { NextResponse } from 'next/server'
import { updateUserConsents } from '@/lib/services/gdprService'
import type { UserConsent } from '@/types/global'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json() as Partial<UserConsent>
  await updateUserConsents(userId, body)
  return NextResponse.json({ success: true })
}
