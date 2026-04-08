import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { deleteSearchAlert } from '@/lib/searchService'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    if (!id) return NextResponse.json({ error: 'Alert ID is required' }, { status: 400 })

    await deleteSearchAlert(userId, id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/search/alerts/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
