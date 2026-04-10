'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { Globe, MapPin, FileText, TrendingUp, CheckCircle, ExternalLink, Link2 } from 'lucide-react'

const SERVICES = [
  { slug: 'plumbing', name: 'Plumbing' },
  { slug: 'electrical', name: 'Electrical' },
  { slug: 'heat-pumps-air-conditioning', name: 'Heat Pumps & Air Conditioning' },
  { slug: 'handyman', name: 'Handyman' },
  { slug: 'cleaning', name: 'Cleaning' },
  { slug: 'moving-removalists', name: 'Moving & Removalists' },
  { slug: 'landscaping-gardening', name: 'Landscaping & Gardening' },
  { slug: 'painting', name: 'Painting' },
  { slug: 'roofing', name: 'Roofing' },
  { slug: 'flooring', name: 'Flooring' },
  { slug: 'locksmith', name: 'Locksmith' },
  { slug: 'pest-control', name: 'Pest Control' },
  { slug: 'rubbish-removal', name: 'Rubbish Removal' },
  { slug: 'appliance-repair', name: 'Appliance Repair' },
  { slug: 'car-detailing', name: 'Car Detailing' },
  { slug: 'plasterer', name: 'Plastering' },
  { slug: 'builder', name: 'Building' },
]

const LOCATIONS = [
  { cityName: 'Blenheim', regionName: 'Marlborough', regionSlug: 'marlborough', citySlug: 'blenheim' },
  { cityName: 'Nelson', regionName: 'Nelson', regionSlug: 'nelson', citySlug: 'nelson' },
  { cityName: 'Wellington', regionName: 'Wellington', regionSlug: 'wellington', citySlug: 'wellington' },
  { cityName: 'Christchurch', regionName: 'Canterbury', regionSlug: 'canterbury', citySlug: 'christchurch' },
  { cityName: 'Auckland', regionName: 'Auckland', regionSlug: 'auckland', citySlug: 'auckland' },
  { cityName: 'Hamilton', regionName: 'Waikato', regionSlug: 'waikato', citySlug: 'hamilton' },
  { cityName: 'Tauranga', regionName: 'Bay of Plenty', regionSlug: 'bay-of-plenty', citySlug: 'tauranga' },
  { cityName: 'Dunedin', regionName: 'Otago', regionSlug: 'otago', citySlug: 'dunedin' },
  { cityName: 'Queenstown', regionName: 'Otago', regionSlug: 'otago', citySlug: 'queenstown' },
  { cityName: 'Palmerston North', regionName: 'Manawatū-Whanganui', regionSlug: 'manawatu-whanganui', citySlug: 'palmerston-north' },
]

const NEARBY_MESH: Record<string, string[]> = {
  'marlborough/blenheim': ['nelson/nelson'],
  'nelson/nelson': ['marlborough/blenheim'],
  'wellington/wellington': ['manawatu-whanganui/palmerston-north'],
  'manawatu-whanganui/palmerston-north': ['wellington/wellington'],
  'canterbury/christchurch': ['otago/dunedin'],
  'otago/dunedin': ['canterbury/christchurch', 'otago/queenstown'],
  'otago/queenstown': ['otago/dunedin'],
  'waikato/hamilton': ['auckland/auckland', 'bay-of-plenty/tauranga'],
  'auckland/auckland': ['waikato/hamilton'],
  'bay-of-plenty/tauranga': ['waikato/hamilton'],
}

const AUTHORITY_PAGES = [
  { path: '/press', title: 'Press', description: 'Company overview, founder story, stats, brand assets, press contact' },
  { path: '/partners', title: 'Partners', description: 'Partner programme, badge embed, mutual referrals, how-it-works steps' },
  { path: '/reports/nz-home-services-price-index', title: 'NZ Price Index Report', description: 'Price table (8 services × 4 regions), methodology, Article JSON-LD (link magnet)' },
]

export default function AdminSEOOperationsPage() {
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
    { label: 'Total Pages', value: '191', sub: '170 location + 17 service + 1 hub + 3 authority', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Services', value: '17', sub: 'Across all categories', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Locations', value: '10', sub: 'NZ cities covered', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Authority Pages', value: '3', sub: '/press, /partners, /reports', icon: FileText, color: 'text-violet-600', bg: 'bg-violet-100 dark:bg-violet-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center flex-shrink-0">
                <Globe className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Operations Dashboard</h1>
                <p className="text-gray-500 mt-0.5 text-sm">Monitor and manage QuickTrade&apos;s full NZ SEO surface</p>
              </div>
            </div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              ← Admin
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, sub, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-start gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Services Coverage */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  Services Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {SERVICES.map((service) => (
                    <div key={service.slug} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{service.name}</p>
                        <p className="text-xs font-mono text-gray-400">/services/{service.slug}</p>
                      </div>
                      <a
                        href={`https://quicktrade.co.nz/services/${service.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700 flex-shrink-0 ml-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Locations Coverage */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-blue-600" />
                  Locations Coverage
                  <span className="text-sm font-normal text-gray-500 ml-1">10 cities × 17 services = 170 pages</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {LOCATIONS.map((loc) => (
                    <div key={loc.citySlug} className="flex items-center justify-between p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{loc.cityName}</p>
                        <p className="text-xs text-gray-400">{loc.regionName} · 17 service pages</p>
                      </div>
                      <a
                        href={`https://quicktrade.co.nz/services/plumbing/nz/${loc.regionSlug}/${loc.citySlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700 flex-shrink-0 ml-2"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Authority Pages */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-violet-600" />
                  Authority Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {AUTHORITY_PAGES.map((page) => (
                    <div key={page.path} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{page.title}</p>
                        <a
                          href={`https://quicktrade.co.nz${page.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-500 hover:text-indigo-700 flex-shrink-0"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <p className="text-xs font-mono text-gray-400 mb-1">{page.path}</p>
                      <p className="text-xs text-gray-500">{page.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sitemap & Robots */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  Sitemap &amp; Robots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Sitemap</p>
                      <p className="text-xs font-mono text-gray-500">https://quicktrade.co.nz/sitemap.xml</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                      <a
                        href="https://quicktrade.co.nz/sitemap.xml"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-500 hover:text-indigo-700"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Robots.txt</p>
                      <p className="text-xs text-gray-500">
                        Disallows: <span className="font-mono">/api/</span>, <span className="font-mono">/admin/</span>, <span className="font-mono">/auth/</span>
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nearby Mesh */}
          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-orange-600" />
                  Internal Linking — Nearby Mesh
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(NEARBY_MESH).map(([from, tos]) => (
                    <div key={from} className="flex items-center gap-2 p-2.5 bg-gray-50 dark:bg-gray-700/50 rounded-lg text-xs">
                      <span className="font-mono text-gray-700 dark:text-gray-300">{from}</span>
                      <span className="text-gray-400">→</span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400">{tos.join(', ')}</span>
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
