import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { MoverOpportunity } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * GET /api/jobs/mover-opportunities
 *
 * Returns job opportunities matched to a worker's target relocation city.
 * Workers set `targetRelocationCity` on their profile; this endpoint filters
 * available long-term contracts to that city and attaches the mover bonus.
 *
 * Query params:
 *   workerId     (required) – the authenticated worker's ID
 *   city         (optional) – override the worker's stored target city
 *   minBonus     (optional) – minimum mover bonus percentage (default 5)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const workerId = searchParams.get('workerId')
    const cityOverride = searchParams.get('city')
    const minBonus = parseInt(searchParams.get('minBonus') ?? '5', 10)

    if (!workerId) {
      return NextResponse.json(
        { error: 'workerId query param is required' },
        { status: 400 }
      )
    }

    // ── In production: ────────────────────────────────────────────────────
    // 1. Fetch worker profile from Firestore to get targetRelocationCity
    //    const workerDoc = await adminDb.collection('workers').doc(workerId).get()
    //    const targetCity = cityOverride ?? workerDoc.data()?.targetRelocationCity
    // 2. Query moverOpportunities collection filtered by targetCities array-contains
    //    const snap = await adminDb.collection('moverOpportunities')
    //      .where('targetCities', 'array-contains', targetCity)
    //      .where('moverBonusPercentage', '>=', minBonus)
    //      .orderBy('moverBonusPercentage', 'desc')
    //      .limit(20)
    //      .get()
    // ─────────────────────────────────────────────────────────────────────

    const targetCity = cityOverride ?? 'Austin, TX' // mock fallback

    const mockOpportunities: MoverOpportunity[] = [
      {
        jobId: 'job_mover_001',
        title: 'Senior Electrician – Long-Term Contract',
        city: 'Austin',
        state: 'TX',
        targetCities: ['Austin, TX', 'Austin'],
        moverBonusPercentage: 15,
        baseRateCents: 7500,   // $75/hr
        effectiveRateCents: 8625, // $75 × 1.15
        employerName: 'Austin Power Systems LLC',
        contractDurationWeeks: 24,
        createdAt: new Date().toISOString(),
      },
      {
        jobId: 'job_mover_002',
        title: 'Master Plumber – Commercial Project',
        city: 'Austin',
        state: 'TX',
        targetCities: ['Austin, TX', 'Austin'],
        moverBonusPercentage: 12,
        baseRateCents: 8000,
        effectiveRateCents: 8960,
        employerName: 'Capitol Plumbing Co.',
        contractDurationWeeks: 16,
        createdAt: new Date().toISOString(),
      },
      {
        jobId: 'job_mover_003',
        title: 'HVAC Technician – New Development',
        city: 'Austin',
        state: 'TX',
        targetCities: ['Austin, TX', 'Austin'],
        moverBonusPercentage: 10,
        baseRateCents: 6500,
        effectiveRateCents: 7150,
        employerName: 'Lone Star HVAC Services',
        contractDurationWeeks: 20,
        createdAt: new Date().toISOString(),
      },
    ]

    // Filter by city and minimum bonus
    const normalizedTarget = targetCity.toLowerCase()
    const opportunities = mockOpportunities.filter(
      (o) =>
        o.moverBonusPercentage >= minBonus &&
        o.targetCities.some((c) => c.toLowerCase().includes(normalizedTarget.split(',')[0].trim()))
    )

    return NextResponse.json({
      workerId,
      targetCity,
      count: opportunities.length,
      opportunities,
    })
  } catch (error) {
    console.error('GET /api/jobs/mover-opportunities error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
