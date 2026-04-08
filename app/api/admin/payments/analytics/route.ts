import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payments/analytics
 * Returns revenue analytics for the admin dashboard.
 * Includes bundle-pricing breakdown and Mover Mode metrics.
 */
export async function GET() {
  try {
    // In production: aggregate from Firestore using admin SDK
    // const adminDb = (await import('@/lib/firebase-admin')).adminDb
    // const paymentsSnap = await adminDb.collection('payments').get()
    // ... aggregate totals, monthly breakdown, etc.

    const now = Date.now()
    const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - (5 - i))
      const label = d.toLocaleString('default', { month: 'short', year: '2-digit' })
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const revenue = Math.round(120000 + Math.random() * 80000)
      const payouts = Math.round(revenue * 0.82)
      return { month, label, revenue, payouts }
    })

    const analytics = {
      totalRevenue: 2850000,
      totalPayouts: 2337000,
      pendingPayouts: 48500,
      successfulPayments: 14823,
      failedPayments: 312,
      disputeCount: 47,
      averagePaymentValue: 192,
      revenueByMonth,
      topCategories: [
        { category: 'Electrical', revenue: 620000, count: 3200 },
        { category: 'Plumbing', revenue: 510000, count: 2650 },
        { category: 'HVAC', revenue: 430000, count: 2100 },
        { category: 'Carpentry', revenue: 380000, count: 1970 },
        { category: 'Roofing', revenue: 290000, count: 1500 },
      ],
      // Bundle / Price-Anchoring breakdown
      bundleBreakdown: {
        single: { count: 8240, revenue: 824000 },
        '3pack': { count: 3150, revenue: 897750 },
        '10pack': { count: 1280, revenue: 1152000 },
      },
      // Mover Mode metrics
      moverMode: {
        activeMoverWorkers: 342,
        moverJobsPosted: 1870,
        moverJobsAccepted: 1243,
        moverAcceptanceRate: 66.5,
        avgMoverPremiumFee: 18.5,
        topRelocationCities: [
          { city: 'Austin, TX', workerCount: 78, jobCount: 412 },
          { city: 'Miami, FL', workerCount: 65, jobCount: 348 },
          { city: 'Denver, CO', workerCount: 54, jobCount: 291 },
          { city: 'Phoenix, AZ', workerCount: 49, jobCount: 267 },
          { city: 'Nashville, TN', workerCount: 38, jobCount: 198 },
        ],
      },
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('GET /api/admin/payments/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
