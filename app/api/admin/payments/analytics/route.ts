import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payments/analytics
 * Returns revenue analytics for the admin dashboard.
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
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('GET /api/admin/payments/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
