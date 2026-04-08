import { NextResponse } from 'next/server'
import { getRequestStatus } from '@/lib/services/gdprService'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const requestId = searchParams.get('requestId')

  if (!requestId) {
    return NextResponse.json({ error: 'Missing required param: requestId' }, { status: 400 })
  }

  const status = await getRequestStatus(requestId)
  if (!status) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 })
  }

  return NextResponse.json({ request: status })
}
