export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getMoverSettings, setMoverSettings } from '@/lib/services/moverService'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const settings = await getMoverSettings(params.id)
    if (!settings) {
      return NextResponse.json(
        { error: 'Mover settings not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Get mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      targetRelocationCity,
      relocationReadiness,
      availableForRelocation,
      preferredJobTypes,
    } = body

    if (!targetRelocationCity) {
      return NextResponse.json(
        { error: 'targetRelocationCity is required' },
        { status: 400 }
      )
    }

    const settings = await setMoverSettings(params.id, {
      targetRelocationCity,
      relocationReadiness: relocationReadiness ?? 0,
      availableForRelocation: availableForRelocation ?? false,
      preferredJobTypes: preferredJobTypes ?? [],
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Set mover settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
