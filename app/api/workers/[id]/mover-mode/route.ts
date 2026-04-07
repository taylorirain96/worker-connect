import { NextRequest, NextResponse } from 'next/server'
import { getMoverSettings, updateMoverSettings } from '@/lib/services/moverService'
import type { MoverSettings } from '@/types/reputation'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settings = await getMoverSettings(params.id)
    return NextResponse.json(settings)
  } catch (err) {
    console.error('[workers/[id]/mover-mode GET]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as Partial<Omit<MoverSettings, 'workerId'>>
    const updated = await updateMoverSettings(params.id, body)
    return NextResponse.json(updated)
  } catch (err) {
    console.error('[workers/[id]/mover-mode PUT]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
