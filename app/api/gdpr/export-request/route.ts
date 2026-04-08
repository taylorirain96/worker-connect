import { NextResponse } from 'next/server'
import { createExportRequest } from '@/lib/services/gdprService'

export async function POST(request: Request) {
  const userId = request.headers.get('x-user-id')
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await createExportRequest(userId)
  return NextResponse.json({ request: result }, { status: 201 })
}
