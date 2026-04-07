import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { PaymentAnalyticsSummary } from '@/types/payment'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/payments/analytics
 * Returns payment analytics for the admin dashboard.
 * Requires admin role — validate x-user-role header in production.
 */
export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get('x-user-role')
    if (role && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') ?? '6m' // 1m | 3m | 6m | 1y

    const monthCount = period === '1m' ? 1 : period === '3m' ? 3 : period === '1y' ? 12 : 6

    // In production: aggregate from Firestore / Stripe
    // For now return realistic mock analytics

    const now = new Date()
    const revenueByMonth = Array.from({ length: monthCount }, (_, i) => {
      const d = new Date(now)
      d.setMonth(d.getMonth() - (monthCount - 1 - i))
      const revenue = 8000 + Math.floor(Math.random() * 4000)
      const payouts = Math.floor(revenue * 0.82)
      return {
        month: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleString('en-US', { month: 'short', year: '2-digit' }),
        revenue,
        payouts,
        refunds: Math.floor(revenue * 0.02),
        disputes: Math.floor(Math.random() * 3),
      }
    })

    const analytics: PaymentAnalyticsSummary = {
      totalRevenue: revenueByMonth.reduce((s, m) => s + m.revenue, 0),
      totalPayouts: revenueByMonth.reduce((s, m) => s + m.payouts, 0),
      pendingPayouts: 3420,
      successfulPayments: 284,
      failedPayments: 12,
      refundedPayments: 8,
      disputeCount: 5,
      averagePaymentValue: 387,
      revenueGrowthPct: 14.3,
      currency: 'usd',
      revenueByMonth,
      paymentMethodBreakdown: [
        { method: 'card', count: 210, total: 81450 },
        { method: 'bank_transfer', count: 62, total: 28640 },
        { method: 'wallet', count: 12, total: 3240 },
      ],
      topWorkers: [
        { workerId: 'w1', workerName: 'Alex Johnson', total: 12400, count: 32 },
        { workerId: 'w2', workerName: 'Maria Garcia', total: 10800, count: 28 },
        { workerId: 'w3', workerName: 'James Lee', total: 9600, count: 25 },
      ],
    }

    return NextResponse.json({ analytics, period })
  } catch (error) {
    console.error('GET /api/admin/payments/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
