import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * POST /api/tax/1099/send
 * Send a 1099 form to the worker via email.
 * Body: { form1099Id: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json() as { form1099Id?: string }
    if (!body.form1099Id) {
      return NextResponse.json({ error: 'form1099Id is required' }, { status: 400 })
    }

    const { send1099ToWorker } = await import('@/lib/services/form1099Service')
    await send1099ToWorker(body.form1099Id)

    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Internal server error'
    const status = msg.includes('not found') ? 404 : 500
    return NextResponse.json({ error: msg }, { status })
  }
}
