import { NextResponse } from 'next/server'
import { createDeleteRequest } from '@/lib/services/gdprService'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({})) as { reason?: string }
  const result = await createDeleteRequest(userId, body.reason)
  return NextResponse.json({ request: result }, { status: 201 })
}
