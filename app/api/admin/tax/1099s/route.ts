import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/tax/1099s
 * Admin endpoint: list all 1099 forms with optional year/status filter.
 * Query params: year, status (generated|sent|archived)
 */
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const yearParam = searchParams.get('year')
    const status = searchParams.get('status') as 'generated' | 'sent' | 'archived' | null

    const year = yearParam ? parseInt(yearParam, 10) : undefined
    if (year !== undefined && isNaN(year)) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const { getAllForms1099 } = await import('@/lib/services/form1099Service')
    const forms = await getAllForms1099({
      year,
      status: status ?? undefined,
    })

    const totalAmount = forms.reduce((s, f) => s + f.boxNC2, 0)

    return NextResponse.json({
      forms,
      total: forms.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
    })
  } catch (err) {
    console.error('GET /api/admin/tax/1099s error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
