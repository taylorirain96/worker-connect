'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { BookOpen, ArrowLeft } from 'lucide-react'

// ─── Checklist item component ─────────────────────────────────────────────────

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
      <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800" aria-hidden="true" />
      <span>{children}</span>
    </li>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-2 first:mt-0">
      {children}
    </h3>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MasterPlaybookPage() {
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">QuickTrade Master Playbook</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Single source of truth for growth strategy, SEO, and operations · Last updated: April 2026
                </p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="flex items-center gap-2 flex-shrink-0">
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          </div>

          <div className="space-y-6">

            {/* Phase 1 */}
            <Card>
              <CardHeader>
                <CardTitle>Phase 1 — New Zealand Only (Weeks 1–4)</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionHeading>Objective</SectionHeading>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Launch QuickTrade exclusively in New Zealand to validate the marketplace model before expanding internationally.
                </p>
                <SectionHeading>Checklist</SectionHeading>
                <ul className="space-y-2">
                  <CheckItem>Configure all landing copy, metadata, and CTAs to reference NZ locations</CheckItem>
                  <CheckItem>Set <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">hreflang</code> or canonical signals for NZ-only launch</CheckItem>
                  <CheckItem>Onboard first 10 workers in Blenheim/Marlborough (see Blenheim-first plan below)</CheckItem>
                  <CheckItem>Set up services taxonomy (see below)</CheckItem>
                  <CheckItem>Build SEO foundation (see below)</CheckItem>
                  <CheckItem>Publish /press page</CheckItem>
                  <CheckItem>Publish first /reports/ link-magnet page</CheckItem>
                  <CheckItem>Launch /partners page with badge programme</CheckItem>
                  <CheckItem>Connect UTM tracking and basic analytics dashboard</CheckItem>
                </ul>
              </CardContent>
            </Card>

            {/* Services Taxonomy */}
            <Card>
              <CardHeader>
                <CardTitle>Services Taxonomy — Premium 2-Level Approach</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionHeading>Philosophy</SectionHeading>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Use clear top-level groups that map to real search intent, with specific subcategories that target long-tail keywords.
                </p>
                <SectionHeading>Top-Level Groups &amp; Subcategories</SectionHeading>
                <div className="grid sm:grid-cols-2 gap-4 mt-3">
                  {SERVICE_CATEGORIES.map(({ emoji, name, subcategories }) => (
                    <div key={name} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                      <p className="font-medium text-gray-900 dark:text-white text-sm mb-1.5">
                        {emoji} {name}
                      </p>
                      <ul className="space-y-0.5">
                        {subcategories.map((sub) => (
                          <li key={sub} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                            <span className="mt-1 h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                            {sub}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SEO Foundation */}
            <Card>
              <CardHeader>
                <CardTitle>SEO Foundation Build</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionHeading>Checklist</SectionHeading>
                <ul className="space-y-2">
                  <CheckItem>Create <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/services</code> hub page with links to all 17 service category pages</CheckItem>
                  <CheckItem>Create 17 service pages at <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/services/&lt;slug&gt;</code></CheckItem>
                  <CheckItem>Create 170 service+location pages at <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">/services/&lt;service&gt;/nz/&lt;region&gt;/&lt;city&gt;</code></CheckItem>
                  <CheckItem>Add unique <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">&lt;title&gt;</code> and <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">&lt;meta name=&quot;description&quot;&gt;</code> to every page</CheckItem>
                  <CheckItem>Add <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">&lt;link rel=&quot;canonical&quot;&gt;</code> to every page</CheckItem>
                  <CheckItem>Implement <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">app/sitemap.ts</code> covering all 188 pages (1 hub + 17 service + 170 location)</CheckItem>
                  <CheckItem>Implement <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">app/robots.ts</code> (or <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">public/robots.txt</code>) allowing all crawlers and referencing sitemap</CheckItem>
                  <CheckItem>Add JSON-LD structured data: Service pages use <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">Service</code> schema; location pages use <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">LocalBusiness</code>/<code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">Service</code> with <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">areaServed</code></CheckItem>
                  <CheckItem>Verify internal linking mesh (service pages → all locations; location pages → nearby locations)</CheckItem>
                  <CheckItem>Submit sitemap to Google Search Console</CheckItem>
                </ul>

                <SectionHeading>URL Structure (LOCKED)</SectionHeading>
                <div className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 mt-2">
                  <p>/services/</p>
                  <p>/services/&lt;slug&gt;</p>
                  <p>/services/&lt;slug&gt;/nz/&lt;region&gt;/&lt;city&gt;</p>
                </div>
                <div className="mt-3 space-y-1">
                  {[
                    ['/services/', 'hub page listing all 17 categories'],
                    ['/services/plumbing-gas', 'service category page'],
                    ['/services/plumbing-gas/nz/marlborough/blenheim', 'service + location page'],
                    ['/services/electrical/nz/nelson/nelson-city', 'service + location page'],
                  ].map(([url, desc]) => (
                    <p key={url} className="text-xs text-gray-600 dark:text-gray-400">
                      <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-gray-800 dark:text-gray-200">{url}</code>
                      {' '}— {desc}
                    </p>
                  ))}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                  <strong>Total pages: 188</strong> — 1 hub + 17 service category + 170 service+location (17 × 10 NZ cities)
                </p>
              </CardContent>
            </Card>

            {/* Blenheim-First Launch */}
            <Card>
              <CardHeader>
                <CardTitle>Blenheim-First Launch Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <SectionHeading>Rationale</SectionHeading>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Blenheim/Marlborough is a strong launchpad: mid-sized regional city, tight-knit community, and underserved by existing platforms. Use it as a proof-of-concept before scaling to larger NZ cities.
                </p>
                <SectionHeading>Checklist</SectionHeading>
                <ul className="space-y-2">
                  <CheckItem>Source first 10 verified workers across top 5 services (plumbing, electrical, cleaning, handyman, heat pumps)</CheckItem>
                  <CheckItem>Create worker profiles with photos and verified credentials</CheckItem>
                  <CheckItem>Run a local Facebook/Instagram campaign targeting Blenheim homeowners</CheckItem>
                  <CheckItem>List on local community noticeboards and Facebook groups</CheckItem>
                  <CheckItem>Partner with 1–2 local suppliers (e.g. plumbing supplies) for referral network</CheckItem>
                  <CheckItem>Collect first 10 real job completions and reviews</CheckItem>
                  <CheckItem>Document learnings and iterate on worker onboarding flow</CheckItem>
                </ul>
              </CardContent>
            </Card>

            {/* Growth & Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Growth &amp; Distribution Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <CheckItem>Google Business Profile for QuickTrade NZ</CheckItem>
                  <CheckItem>Social proof loop: completed job → worker shares → employer leaves review → shown on landing page</CheckItem>
                  <CheckItem>Referral programme (worker earns $X per referred worker who completes first job)</CheckItem>
                  <CheckItem>Press outreach to NZ tech/business blogs (Idealog, Stuff Business, NBR)</CheckItem>
                  <CheckItem>Link-magnet report: &quot;Cost of home services in New Zealand 2026&quot; (shareable PDF)</CheckItem>
                  <CheckItem>Partner badge programme for verified QuickTrade workers (web + print)</CheckItem>
                  <CheckItem>UTM tracking on all outbound links</CheckItem>
                  <CheckItem>Weekly admin analytics review (conversion, CAC, activation rate)</CheckItem>
                </ul>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ─── Service categories data ──────────────────────────────────────────────────

const SERVICE_CATEGORIES = [
  {
    emoji: '🔧',
    name: 'Plumbing & Gas',
    subcategories: [
      'Leaking taps & pipes',
      'Hot water cylinder replacement',
      'Drain unblocking',
      'Gas fitting & certification',
      'Bathroom & kitchen plumbing',
    ],
  },
  {
    emoji: '⚡',
    name: 'Electrical',
    subcategories: [
      'General wiring & rewiring',
      'Switchboard upgrades',
      'EV charger installation',
      'LED lighting upgrades',
      'Safety inspections & certificates',
    ],
  },
  {
    emoji: '❄️',
    name: 'Heat Pumps & Air Conditioning',
    subcategories: [
      'Heat pump supply & installation',
      'Air conditioning installation (aircon)',
      'Heat pump servicing & maintenance',
      'Multi-head heat pump systems',
    ],
  },
  {
    emoji: '🔨',
    name: 'Handyman',
    subcategories: [
      'Flat-pack assembly',
      'Picture hanging & shelving',
      'Door & window repairs',
      'Tile repairs',
      'Minor carpentry',
    ],
  },
  {
    emoji: '🧹',
    name: 'Cleaning',
    subcategories: [
      'Regular house cleaning',
      'End-of-tenancy / bond cleaning',
      'Commercial office cleaning',
      'Carpet steam cleaning',
      'Window cleaning',
    ],
  },
  {
    emoji: '🚚',
    name: 'Moving & Removalists',
    subcategories: [
      'Local home moves',
      'Furniture-only moves',
      'Office relocations',
      'Packing & unpacking service',
    ],
  },
  {
    emoji: '🌿',
    name: 'Landscaping & Gardening',
    subcategories: [
      'Lawn mowing & maintenance',
      'Garden design & planting',
      'Tree trimming & removal',
      'Irrigation installation',
      'Hedge trimming',
    ],
  },
  {
    emoji: '🖌️',
    name: 'Painting',
    subcategories: [
      'Interior painting',
      'Exterior painting',
      'Wallpaper removal & prep',
      'Colour consultations',
    ],
  },
  {
    emoji: '🏠',
    name: 'Roofing',
    subcategories: [
      'Roof repairs & re-roofing',
      'Spouting & gutter replacement',
      'Roof inspections',
      'Iron roofing',
    ],
  },
  {
    emoji: '🪵',
    name: 'Flooring',
    subcategories: [
      'Timber floor installation & sanding',
      'Carpet installation',
      'Vinyl & LVP installation',
      'Tile & stone floors',
    ],
  },
  {
    emoji: '🔐',
    name: 'Locksmith',
    subcategories: [
      'Lockout service',
      'Lock replacement & rekeying',
      'Deadbolt installation',
      'Safe installation',
    ],
  },
  {
    emoji: '🐜',
    name: 'Pest Control',
    subcategories: [
      'Residential pest inspections',
      'Wasp & bee nest removal',
      'Rodent control',
      'Pre-purchase pest reports',
    ],
  },
  {
    emoji: '🗑️',
    name: 'Rubbish Removal',
    subcategories: [
      'General rubbish removal',
      'Green waste removal',
      'Hard rubbish / bulky items',
      'Construction debris removal',
    ],
  },
  {
    emoji: '⚙️',
    name: 'Appliance Repair',
    subcategories: [
      'Washing machine repair',
      'Dishwasher repair',
      'Oven & cooktop repair',
      'Refrigerator repair',
    ],
  },
  {
    emoji: '🚗',
    name: 'Car Detailing',
    subcategories: [
      'Full car detail (interior + exterior)',
      'Paint correction & ceramic coating',
      'Engine bay cleaning',
      'Fleet vehicle detailing',
    ],
  },
  {
    emoji: '🏗️',
    name: 'Plasterer',
    subcategories: [
      'Interior wall plastering',
      'Stopping & finishing',
      'Texture coat application',
      'Patch & repair plastering',
    ],
  },
  {
    emoji: '🏛️',
    name: 'Builder',
    subcategories: [
      'Home renovations & extensions',
      'Deck construction',
      'New builds (small projects)',
      'Garage & carport builds',
    ],
  },
]
