import { NextRequest, NextResponse } from 'next/server'
import { getMoverStats } from '@/lib/services/moverService'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const workerId = searchParams.get('workerId') ?? undefined
  try {
    const stats = await getMoverStats(workerId)
    return NextResponse.json(stats)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch mover stats' }, { status: 500 })
  }
}
