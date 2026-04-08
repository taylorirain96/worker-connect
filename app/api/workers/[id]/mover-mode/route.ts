import { NextRequest, NextResponse } from 'next/server'
import { getMoverSettings, updateMoverSettings } from '@/lib/services/moverService'

export const dynamic = 'force-dynamic'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const settings = await getMoverSettings(params.id)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const settings = await updateMoverSettings(params.id, body)
    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
