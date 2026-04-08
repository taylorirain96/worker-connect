import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/system
 * Returns system health metrics.
 */
export async function GET() {
  try {
    // In production: aggregate from monitoring services, Firebase SDK, Stripe API, etc.

    const now = Date.now()
    // Use deterministic variation rather than Math.random() (not for security use)
    const last24hErrors = Array.from({ length: 24 }, (_, i) => ({
      hour: `${23 - i}h ago`,
      count: Math.floor(Math.abs(Math.sin(i * 2.71 + 1.41)) * 8),
    }))

    const recentErrors = [
      { timestamp: new Date(now - 15 * 60000).toISOString(), endpoint: '/api/payments/create-intent', message: 'Stripe timeout', code: 500 },
      { timestamp: new Date(now - 42 * 60000).toISOString(), endpoint: '/api/jobs/match', message: 'Firestore quota exceeded', code: 429 },
      { timestamp: new Date(now - 2 * 3600000).toISOString(), endpoint: '/api/notifications/subscribe', message: 'FCM token invalid', code: 400 },
    ]

    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      api: {
        responseTime: { avg: 142, p95: 380, p99: 620 },
        errorRate: 0.23,
        requestsPerMinute: 1840,
        uptime: 99.94,
      },
      database: {
        queryTime: { avg: 24, p95: 68, p99: 120 },
        connectionPool: { active: 14, idle: 6, max: 25 },
        firestoreReads: 182400,
        firestoreWrites: 18920,
      },
      stripe: {
        status: 'operational',
        webhookDeliveryRate: 99.7,
        lastWebhookAt: new Date(now - 8 * 60000).toISOString(),
      },
      email: {
        deliveryRate: 98.4,
        bounceRate: 0.8,
        lastSentAt: new Date(now - 12 * 60000).toISOString(),
      },
      infrastructure: {
        deployment: 'vercel',
        deploymentStatus: 'active',
        storageUsedGB: 12.4,
        storageMaxGB: 100,
        activeUsers: 1243,
        concurrentSessions: 387,
      },
      errors: {
        last24h: last24hErrors,
        recent: recentErrors,
        totalLast24h: last24hErrors.reduce((s, e) => s + e.count, 0),
        totalLast7d: 243,
        totalLast30d: 1082,
      },
      performance: {
        pageLoads: [
          { page: '/dashboard', avgMs: 320 },
          { page: '/jobs', avgMs: 480 },
          { page: '/search', avgMs: 560 },
          { page: '/messages', avgMs: 240 },
        ],
        cacheHitRate: 72.4,
        avgSessionDuration: 8.4,
      },
    }

    return NextResponse.json(health)
  } catch (error) {
    console.error('GET /api/admin/system error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
