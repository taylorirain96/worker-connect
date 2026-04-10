'use client'
import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Globe,
  Layers,
  MapPin,
  Award,
  CheckCircle2,
  Clock,
} from 'lucide-react'

const gscSteps: { title: string; description: string; status: 'pending' | 'done'; actionLabel: string | null; actionUrl: string | null }[] = [
  {
    title: 'Verify domain ownership',
    description: 'Add a DNS TXT record or HTML meta tag to verify quicktrade.co.nz in GSC.',
    status: 'pending',
    actionLabel: 'Open GSC',
    actionUrl: 'https://search.google.com/search-console',
  },
  {
    title: 'Submit sitemap',
    description: 'Submit your sitemap to GSC so Google can discover all 188 pages.',
    status: 'pending',
    actionLabel: 'Open Sitemap',
    actionUrl: '/sitemap.xml',
  },
  {
    title: 'Request indexing for key pages',
    description: 'Use the URL Inspection tool in GSC to request indexing for your homepage, /services, and top location pages.',
    status: 'pending',
    actionLabel: 'Open GSC',
    actionUrl: 'https://search.google.com/search-console',
  },
  {
    title: 'Monitor Core Web Vitals',
    description: 'Check the Core Web Vitals report in GSC after your first crawl.',
    status: 'pending',
    actionLabel: 'Open GSC',
    actionUrl: 'https://search.google.com/search-console',
  },
  {
    title: 'Set preferred domain',
    description: 'Confirm whether www or non-www is your canonical domain in GSC settings.',
    status: 'pending',
    actionLabel: 'Open GSC',
    actionUrl: 'https://search.google.com/search-console',
  },
]

const ga4Steps: { title: string; description: string; status: 'pending' | 'done'; actionLabel: string | null; actionUrl: string | null }[] = [
  {
    title: 'Create GA4 property',
    description: 'Create a GA4 property for quicktrade.co.nz in Google Analytics.',
    status: 'pending',
    actionLabel: 'Open GA4',
    actionUrl: 'https://analytics.google.com',
  },
  {
    title: 'Add GA4 Measurement ID to env',
    description: 'Add NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX to your .env.local and Vercel environment variables.',
    status: 'pending',
    actionLabel: null,
    actionUrl: null,
  },
  {
    title: 'Install GA4 script',
    description: 'Add the GA4 <Script> tag to app/layout.tsx using the NEXT_PUBLIC_GA_MEASUREMENT_ID env var.',
    status: 'pending',
    actionLabel: null,
    actionUrl: null,
  },
  {
    title: 'Verify data is flowing',
    description: "Open the GA4 Realtime report and visit your site — you should see yourself as an active user.",
    status: 'pending',
    actionLabel: 'Open GA4',
    actionUrl: 'https://analytics.google.com',
  },
  {
    title: 'Set up conversion events',
    description: 'Mark key events (sign_up, job_posted, job_hired) as conversions in GA4.',
    status: 'pending',
    actionLabel: 'Open GA4',
    actionUrl: 'https://analytics.google.com',
  },
]

const inventoryRows = [
  { route: '/', count: 1, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Homepage' },
  { route: '/services', count: 1, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Services hub' },
  { route: '/services/[service]', count: 17, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'One per trade' },
  { route: '/services/[service]/nz/[region]/[city]', count: 170, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Location pages' },
  { route: '/press', count: 1, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Authority page' },
  { route: '/partners', count: 1, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Authority page' },
  { route: '/reports/nz-home-services-price-index', count: 1, statusLabel: '✅ Live', statusStyle: 'text-green-700 dark:text-green-400', dot: 'bg-green-500', notes: 'Authority page' },
  { route: '/pricing', count: 1, statusLabel: '🔄 In Progress', statusStyle: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500', notes: 'Being built' },
  { route: '/help', count: 1, statusLabel: '❌ Missing', statusStyle: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', notes: 'Needed for footer' },
  { route: '/contact', count: 1, statusLabel: '❌ Missing', statusStyle: 'text-red-700 dark:text-red-400', dot: 'bg-red-500', notes: 'Needed for footer' },
]

export default function AdminSEOPage() {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  if (loading || profile?.role !== 'admin') {
    return null
  }

  const stats = [
    { label: 'Total SEO Pages', value: '188', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Services Hub Pages', value: '17', icon: Layers, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Location Pages', value: '170', icon: MapPin, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Authority Pages', value: '3', icon: Award, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Dashboard</h1>
              <p className="text-gray-500 mt-1">Monitor indexing, search performance, and on-page health.</p>
            </div>
            <Link href="/admin">
              <Button variant="outline">← Admin</Button>
            </Link>
          </div>

          {/* Section 1 — Quick stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Section 2 — Google Search Console */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Google Search Console</CardTitle>
                  <Badge variant="warning">Setup Required</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  {gscSteps.map((step) => (
                    <div key={step.title} className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{step.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                      {step.actionLabel && step.actionUrl && (
                        <a
                          href={step.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                        >
                          {step.actionLabel}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 3 — Google Analytics */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Google Analytics (GA4)</CardTitle>
                  <Badge variant="warning">Setup Required</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div>
                  {ga4Steps.map((step) => (
                    <div key={step.title} className="flex items-start gap-4 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="flex-shrink-0 mt-0.5">
                        {step.status === 'done' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{step.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{step.description}</p>
                      </div>
                      {step.actionLabel && step.actionUrl && (
                        <a
                          href={step.actionUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 text-xs px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
                        >
                          {step.actionLabel}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 4 — SEO Page Inventory */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>SEO Page Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Route Pattern</th>
                        <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Count</th>
                        <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-2 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inventoryRows.map((row) => (
                        <tr key={row.route} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                          <td className="py-2.5 pr-4 font-mono text-xs text-gray-800 dark:text-gray-200">{row.route}</td>
                          <td className="py-2.5 pr-4 text-gray-700 dark:text-gray-300">{row.count}</td>
                          <td className="py-2.5 pr-4">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.statusStyle}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${row.dot}`} />
                              {row.statusLabel}
                            </span>
                          </td>
                          <td className="py-2.5 text-xs text-gray-500">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 5 — Robots & Sitemap */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Robots &amp; Sitemap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white w-28 flex-shrink-0">robots.txt</span>
                    <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      ✅ Configured
                    </span>
                    <span className="text-gray-400">—</span>
                    <a
                      href="https://quicktrade.co.nz/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      quicktrade.co.nz/robots.txt
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-medium text-gray-900 dark:text-white w-28 flex-shrink-0">sitemap.xml</span>
                    <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      ✅ Configured
                    </span>
                    <span className="text-gray-400">—</span>
                    <a
                      href="https://quicktrade.co.nz/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      quicktrade.co.nz/sitemap.xml
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Section 6 — Next steps */}
          <div className="rounded-xl border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20 p-6">
            <h2 className="text-base font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-indigo-800 dark:text-indigo-300">
              <li>Complete the Google Search Console setup above</li>
              <li>Add GA4 to <code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">app/layout.tsx</code></li>
              <li>Build <code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">/help</code> and <code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">/contact</code> pages to fix broken footer links</li>
              <li>Add Open Graph meta tags to all non-SEO pages (<code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">/dashboard</code>, <code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">/jobs</code>, <code className="font-mono text-xs bg-indigo-100 dark:bg-indigo-800/50 px-1 py-0.5 rounded">/workers</code>, etc.)</li>
            </ol>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  )
}
