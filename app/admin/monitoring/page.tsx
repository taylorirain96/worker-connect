'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import MetricCard from '@/components/analytics/MetricCard'
import AnalyticsLineChart from '@/components/analytics/AnalyticsLineChart'
import AnalyticsBarChart from '@/components/analytics/AnalyticsBarChart'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'
import {
  Activity, Server, Database, AlertTriangle, CheckCircle,
  ArrowLeft, RefreshCw, Zap, Clock, Globe, Mail,
} from 'lucide-react'

interface SystemHealth {
  status: string
  timestamp: string
  api: {
    responseTime: { avg: number; p95: number; p99: number }
    errorRate: number
    requestsPerMinute: number
    uptime: number
  }
  database: {
    queryTime: { avg: number; p95: number; p99: number }
    connectionPool: { active: number; idle: number; max: number }
    firestoreReads: number
    firestoreWrites: number
  }
  stripe: { status: string; webhookDeliveryRate: number; lastWebhookAt: string }
  email: { deliveryRate: number; bounceRate: number; lastSentAt: string }
  infrastructure: {
    deployment: string
    deploymentStatus: string
    storageUsedGB: number
    storageMaxGB: number
    activeUsers: number
    concurrentSessions: number
  }
  errors: {
    last24h: { hour: string; count: number }[]
    recent: { timestamp: string; endpoint: string; message: string; code: number }[]
    totalLast24h: number
    totalLast7d: number
    totalLast30d: number
  }
  performance: {
    pageLoads: { page: string; avgMs: number }[]
    cacheHitRate: number
    avgSessionDuration: number
  }
}

function StatusDot({ status }: { status: string }) {
  const ok = status === 'healthy' || status === 'operational' || status === 'active'
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full flex-shrink-0 ${ok ? 'bg-emerald-500' : 'bg-red-500'}`}
      aria-label={status}
    />
  )
}

export default function AdminMonitoringPage() {
  const { profile, loading: authLoading } = useAuth()
  const router = useRouter()
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  useEffect(() => {
    if (!authLoading && profile?.role !== 'admin') router.push('/dashboard')
  }, [profile, authLoading, router])

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system')
      if (res.ok) {
        const data = await res.json() as SystemHealth
        setHealth(data)
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading && profile?.role === 'admin') fetchHealth()
  }, [authLoading, profile, fetchHealth])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(fetchHealth, 30000)
    return () => clearInterval(id)
  }, [autoRefresh, fetchHealth])

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center"><LoadingSpinner size="lg" /></main>
        <Footer />
      </div>
    )
  }

  if (!health || profile?.role !== 'admin') return null

  const errorTrendData = health.errors.last24h.map((e) => ({ hour: e.hour, errors: e.count }))

  const pageLoadData = health.performance.pageLoads.map((p) => ({
    page: p.page.replace('/', ''),
    ms: p.avgMs,
  }))

  const poolPct = Math.round((health.database.connectionPool.active / health.database.connectionPool.max) * 100)
  const storagePct = Math.round((health.infrastructure.storageUsedGB / health.infrastructure.storageMaxGB) * 100)

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link href="/admin/dashboard" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="h-10 w-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Activity className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Health</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Real-time infrastructure monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                Auto-refresh (30s)
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={() => { setRefreshing(true); void fetchHealth() }}
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Overall status banner */}
          <div className={`rounded-xl p-4 flex items-center gap-3 ${
            health.status === 'healthy'
              ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}>
            <StatusDot status={health.status} />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white capitalize">
                System Status: {health.status}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Last checked: {new Date(health.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard
              label="Uptime"
              value={`${health.api.uptime}%`}
              subtitle="Last 30 days"
              icon={<CheckCircle className="h-5 w-5" />}
              iconBg="bg-emerald-100 dark:bg-emerald-900/30"
              iconColor="text-emerald-600"
              trend={0.02}
              trendLabel="vs last month"
            />
            <MetricCard
              label="Avg Response"
              value={`${health.api.responseTime.avg}ms`}
              subtitle={`p99: ${health.api.responseTime.p99}ms`}
              icon={<Zap className="h-5 w-5" />}
              iconBg="bg-blue-100 dark:bg-blue-900/30"
              iconColor="text-blue-600"
              trend={-4.2}
              trendLabel="vs last week"
            />
            <MetricCard
              label="Error Rate"
              value={`${health.api.errorRate}%`}
              subtitle={`${health.errors.totalLast24h} errors (24h)`}
              icon={<AlertTriangle className="h-5 w-5" />}
              iconBg="bg-red-100 dark:bg-red-900/30"
              iconColor="text-red-600"
              trend={-8.1}
              trendLabel="vs last week"
            />
            <MetricCard
              label="Active Users"
              value={health.infrastructure.activeUsers.toLocaleString()}
              subtitle={`${health.infrastructure.concurrentSessions} concurrent`}
              icon={<Globe className="h-5 w-5" />}
              iconBg="bg-violet-100 dark:bg-violet-900/30"
              iconColor="text-violet-600"
              trend={12.4}
              trendLabel="vs yesterday"
            />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Errors (Last 24h)</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsBarChart
                  data={errorTrendData}
                  xKey="hour"
                  series={[{ key: 'errors', label: 'Errors', color: '#ef4444' }]}
                  height={200}
                  formatValue={(v) => `${v} errors`}
                />
              </CardContent>
            </Card>

            <Card padding="none">
              <CardHeader className="p-5 pb-2">
                <CardTitle>Page Load Times</CardTitle>
              </CardHeader>
              <CardContent className="px-3 pb-4">
                <AnalyticsBarChart
                  data={pageLoadData}
                  xKey="page"
                  series={[{ key: 'ms', label: 'Avg ms', color: '#6366f1' }]}
                  height={200}
                  formatValue={(v) => `${v}ms`}
                />
              </CardContent>
            </Card>
          </div>

          {/* Service status grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* API */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <StatusDot status="healthy" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">API Server</p>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>p95 response</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.api.responseTime.p95}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Req/min</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.api.requestsPerMinute.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Error rate</span>
                  <span className="font-medium text-red-500">{health.api.errorRate}%</span>
                </div>
              </div>
            </Card>

            {/* Database */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <StatusDot status="healthy" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Firestore DB</p>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Avg query</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.database.queryTime.avg}ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Reads (24h)</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.database.firestoreReads.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pool ({poolPct}%)</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {health.database.connectionPool.active}/{health.database.connectionPool.max}
                  </span>
                </div>
              </div>
            </Card>

            {/* Stripe */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <StatusDot status={health.stripe.status} />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Stripe API</p>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Status</span>
                  <Badge variant="success" className="capitalize">{health.stripe.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Webhook rate</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.stripe.webhookDeliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Last webhook</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {Math.round((Date.now() - new Date(health.stripe.lastWebhookAt).getTime()) / 60000)}m ago
                  </span>
                </div>
              </div>
            </Card>

            {/* Email */}
            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="h-3 w-3 text-blue-500 flex-shrink-0" />
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Email Service</p>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Delivery rate</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.email.deliveryRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Bounce rate</span>
                  <span className="font-medium text-red-500">{health.email.bounceRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cache hit</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{health.performance.cacheHitRate}%</span>
                </div>
              </div>
            </Card>
          </div>

          {/* Infrastructure */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-500" />
                  <CardTitle>Infrastructure</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">Storage ({storagePct}%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {health.infrastructure.storageUsedGB}GB / {health.infrastructure.storageMaxGB}GB
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className="h-2 bg-blue-500 rounded-full"
                        style={{ width: `${storagePct}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 dark:text-gray-400">DB Connection Pool ({poolPct}%)</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {health.database.connectionPool.active} active
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div
                        className={`h-2 rounded-full ${poolPct > 80 ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${poolPct}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Deployment</p>
                      <p className="font-medium text-gray-900 dark:text-white capitalize">{health.infrastructure.deployment}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Status</p>
                      <Badge variant="success" className="capitalize mt-0.5">{health.infrastructure.deploymentStatus}</Badge>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Avg session</p>
                      <p className="font-medium text-gray-900 dark:text-white">{health.performance.avgSessionDuration}m</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Cache hit rate</p>
                      <p className="font-medium text-gray-900 dark:text-white">{health.performance.cacheHitRate}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent errors */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <CardTitle>Recent Errors</CardTitle>
                  </div>
                  <div className="flex gap-3 text-xs text-gray-500">
                    <span><strong className="text-gray-900 dark:text-white">{health.errors.totalLast24h}</strong> 24h</span>
                    <span><strong className="text-gray-900 dark:text-white">{health.errors.totalLast7d}</strong> 7d</span>
                    <span><strong className="text-gray-900 dark:text-white">{health.errors.totalLast30d}</strong> 30d</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {health.errors.recent.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30">
                      <Clock className="h-3.5 w-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <code className="text-xs bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded">
                            {err.code}
                          </code>
                          <span className="text-xs font-mono text-gray-600 dark:text-gray-400 truncate">{err.endpoint}</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{err.message}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
