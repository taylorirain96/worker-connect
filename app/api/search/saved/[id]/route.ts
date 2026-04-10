import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { deleteSavedSearch } from '@/lib/searchService'

export const dynamic = 'force-dynamic'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  try {
    const userId = request.headers.get('x-user-id')
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await deleteSavedSearch(userId, params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/search/saved/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
