import { NextRequest, NextResponse } from 'next/server'
import { getMoverSettings, updateMoverSettings } from '@/lib/services/moverService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settings = await getMoverSettings(params.id)
    return NextResponse.json(settings ?? { workerId: params.id })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mover settings' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { targetRelocationCity, relocationReadiness } = body
    await updateMoverSettings(params.id, { targetRelocationCity, relocationReadiness })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update mover settings' }, { status: 500 })
  }
}
