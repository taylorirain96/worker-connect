import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/analytics
 * Query params: startDate, endDate, metric (revenue|payments|disputes|workers|employers|system), granularity (day|week|month)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric') ?? 'revenue'
    const startDate = searchParams.get('startDate') ?? new Date(Date.now() - 7 * 86400000).toISOString()
    const endDate = searchParams.get('endDate') ?? new Date().toISOString()
    const granularity = searchParams.get('granularity') ?? 'day'

    const start = new Date(startDate)
    const end = new Date(endDate)
    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / 86400000)

    // In production: aggregate from Firestore using admin SDK

    if (metric === 'revenue') {
      const dailyRevenue = Array.from({ length: Math.min(daysDiff, 90) }, (_, i) => {
        const d = new Date(start)
        d.setDate(d.getDate() + i)
        const revenue = Math.round(5000 + Math.sin(i * 0.5) * 2000 + Math.random() * 1000)
        return {
          date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          revenue,
          transactions: Math.round(revenue / 185),
          commission: Math.round(revenue * 0.1),
        }
      })

      const totalRevenue = dailyRevenue.reduce((s, d) => s + d.revenue, 0)
      const prevRevenue = Math.round(totalRevenue * 0.91)

      return NextResponse.json({
        metric: 'revenue',
        granularity,
        startDate,
        endDate,
        data: {
          totalRevenue,
          platformCommission: Math.round(totalRevenue * 0.1),
          workerEarnings: Math.round(totalRevenue * 0.78),
          employerSpent: totalRevenue,
          averageTransactionValue: 185,
          transactionCount: dailyRevenue.reduce((s, d) => s + d.transactions, 0),
          successRate: 97.8,
          previousPeriodRevenue: prevRevenue,
          revenueGrowth: parseFloat((((totalRevenue - prevRevenue) / prevRevenue) * 100).toFixed(1)),
          daily: dailyRevenue,
        },
      })
    }

    if (metric === 'payments') {
      return NextResponse.json({
        metric: 'payments',
        granularity,
        startDate,
        endDate,
        data: {
          total: 14823,
          succeeded: 14511,
          failed: 312,
          pending: 87,
          byMethod: [
            { method: 'card', count: 10240, amount: 1892440, percentage: 69.1 },
            { method: 'bank_transfer', count: 3480, amount: 642800, percentage: 23.5 },
            { method: 'apple_pay', count: 840, amount: 155400, percentage: 5.7 },
            { method: 'google_pay', count: 263, amount: 48655, percentage: 1.7 },
          ],
          averageValue: 185,
        },
      })
    }

    if (metric === 'disputes') {
      return NextResponse.json({
        metric: 'disputes',
        granularity,
        startDate,
        endDate,
        data: {
          total: 47,
          open: 12,
          resolved: 35,
          averageResolutionTime: 28.4,
          resolutionSuccessRate: 91.5,
          topReasons: [
            { reason: 'Quality Issues', count: 18, percentage: 38.3 },
            { reason: 'Non-delivery', count: 11, percentage: 23.4 },
            { reason: 'Overcharge', count: 8, percentage: 17.0 },
            { reason: 'Misrepresentation', count: 6, percentage: 12.8 },
            { reason: 'Other', count: 4, percentage: 8.5 },
          ],
        },
      })
    }

    if (metric === 'system') {
      return NextResponse.json({
        metric: 'system',
        data: {
          apiResponseTime: { avg: 142, p95: 380, p99: 620 },
          errorRate: 0.23,
          uptime: 99.94,
          activeUsers: 1243,
          concurrentSessions: 387,
        },
      })
    }

    return NextResponse.json({
      metric,
      granularity,
      startDate,
      endDate,
      data: {},
    })
  } catch (error) {
    console.error('GET /api/admin/analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
