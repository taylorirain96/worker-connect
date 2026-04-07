import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MoverOpportunity } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/mover-opportunities
 *
 * Returns jobs that are available in a worker's target relocation city.
 * Workers in Mover Mode earn premium rates (moverBonusPercentage) for
 * long-term contracts in their target city.
 *
 * Query params:
 *   - workerId   (required) Worker whose targetRelocationCity is used.
 *   - targetCity (optional) Override / supply city directly.
 *   - limit      (optional, default 20)
 *   - page       (optional, default 1)
 *
 * In production the route queries Firestore for:
 *   1. The worker's targetRelocationCity (workers/{workerId})
 *   2. Jobs where targetCities array contains that city (moverOpportunities collection)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const workerId = searchParams.get('workerId')
    const targetCityParam = searchParams.get('targetCity')
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100)
    const page = Math.max(parseInt(searchParams.get('page') ?? '1', 10), 1)

    if (!workerId && !targetCityParam) {
      return NextResponse.json(
        { error: 'workerId or targetCity is required' },
        { status: 400 }
      )
    }

    // -----------------------------------------------------------------------
    // Production path:
    //   const adminDb = (await import('@/lib/firebase-admin')).adminDb
    //   const workerSnap = await adminDb.collection('workers').doc(workerId).get()
    //   const targetCity = targetCityParam ?? workerSnap.data()?.targetRelocationCity
    //   if (!targetCity) return NextResponse.json({ opportunities: [], total: 0 })
    //   const snap = await adminDb
    //     .collection('moverOpportunities')
    //     .where('targetCities', 'array-contains', targetCity)
    //     .where('status', '==', 'open')
    //     .orderBy('createdAt', 'desc')
    //     .limit(limit)
    //     .get()
    //   const opportunities = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    //   return NextResponse.json({ opportunities, total: opportunities.length, targetCity })
    // -----------------------------------------------------------------------

    // Mock response (Firestore not configured in this environment)
    const targetCity = targetCityParam ?? 'Austin, TX'

    const CITIES = ['Austin, TX', 'Denver, CO', 'Nashville, TN', 'Phoenix, AZ', 'Charlotte, NC']
    const TITLES = [
      'Senior Electrician – Long-term Contract',
      'Master Plumber – Commercial Project',
      'HVAC Technician – Residential',
      'General Contractor – Multi-family Build',
      'Roofing Specialist – Full Development',
    ]

    const mockOpportunities: MoverOpportunity[] = Array.from({ length: Math.min(limit, 5) }, (_, i) => {
      const baseAmount = 2000 + i * 500
      const bonusPct = 5 + (i % 4) * 5   // 5, 10, 15, 20, 5...
      const bonusAmount = Math.round(baseAmount * (bonusPct / 100))
      return {
        jobId: `mover-job-${page}-${i + 1}`,
        title: TITLES[i % TITLES.length],
        city: targetCity,
        targetCities: [targetCity, CITIES[(i + 1) % CITIES.length]],
        moverBonusPercentage: bonusPct,
        baseAmount,
        bonusAmount,
        totalAmount: baseAmount + bonusAmount,
        employerId: `employer-${i + 1}`,
        createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      }
    })

    return NextResponse.json({
      opportunities: mockOpportunities,
      total: mockOpportunities.length,
      targetCity,
      page,
      limit,
    })
  } catch (error) {
    console.error('GET /api/jobs/mover-opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
