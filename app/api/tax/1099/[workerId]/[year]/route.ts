import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/tax/1099/[workerId]/[year]
 * Returns (and generates if needed) the 1099-NEC for a worker/year.
 * Requires worker profile data to be passed as query params for generation.
 * Query params: name, email, address (required for first-time generation)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { workerId: string; year: string } }
) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const year = parseInt(params.year, 10)
    if (isNaN(year) || year < 2000 || year > 2100) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 })
    }

    const { searchParams } = new URL(req.url)
    const workerName = searchParams.get('name') ?? 'Unknown Worker'
    const workerEmail = searchParams.get('email') ?? ''
    const workerAddress = searchParams.get('address') ?? ''

    const { generate1099 } = await import('@/lib/services/form1099Service')
    const form = await generate1099(
      params.workerId,
      workerName,
      workerEmail,
      workerAddress,
      year
    )

    return NextResponse.json(form)
  } catch (err) {
    console.error('GET /api/tax/1099/[workerId]/[year] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
