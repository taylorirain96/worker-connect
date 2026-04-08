import { NextResponse } from 'next/server'
import { getMoverStats } from '@/lib/services/moverService'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stats = await getMoverStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Mover stats error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
