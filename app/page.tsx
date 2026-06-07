import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TrustSignalBar from '@/components/luxury/TrustSignalBar'
import GlowButton from '@/components/luxury/GlowButton'
import PremiumBadge from '@/components/luxury/PremiumBadge'
import PremiumCategoryCard from '@/components/luxury/PremiumCategoryCard'
import HowItWorksTabs from '@/components/home/HowItWorksTabs'
import FoundersDealBanner from '@/components/home/FoundersDealBanner'
import SocialProofTicker from '@/components/home/SocialProofTicker'
import WorkerOfMonth from '@/components/home/WorkerOfMonth'
import HeroPathTiles from '@/components/home/HeroPathTiles'
import { getAllPosts } from '@/lib/blog/posts'
import { JOB_CATEGORIES, CATEGORY_ICONS, CATEGORY_GRADIENTS, type CategoryId } from '@/lib/utils'
import { SITE_URL } from '@/lib/seo/config'
import {
  MapPin,
  Star,
  ArrowRight,
  Crown,
  Hammer,
  Briefcase,
  Wrench,
  Building2,
  Users,
  CheckCircle,
} from 'lucide-react'

const STATS = [
  { label: 'Active Workers', value: '12,000+', icon: Users },
  { label: 'Jobs Completed', value: '45,000+', icon: CheckCircle },
  { label: 'Avg Rating', value: '4.8★', icon: Star },
  { label: 'Regions Covered', value: 'NZ Wide', icon: MapPin },
]

const PREMIUM_CATEGORIES: CategoryId[] = ['plumbing', 'electrical', 'hvac']

const FEATURED_WORKERS = [
  { name: 'James Tahu', skill: 'Master Plumber', rating: 4.9, jobs: 87, location: 'Blenheim, Marlborough', initials: 'JT', isPremium: true },
  { name: 'Sarah Wilson', skill: 'Licensed Electrician', rating: 4.8, jobs: 124, location: 'Nelson, Tasman', initials: 'SW', isPremium: true },
  { name: 'Mark Te Hau', skill: 'Builder & Carpenter', rating: 5.0, jobs: 56, location: 'Wellington, Wellington', initials: 'MT', isPremium: false },
  { name: 'Emily Fraser', skill: 'Landscape Gardener', rating: 4.7, jobs: 203, location: 'Christchurch, Canterbury', initials: 'EF', isPremium: false },
]

export default function HomePage() {
  const latestPosts = getAllPosts().slice(0, 6)

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Script
        id="jsonld-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'QuickTrade',
            url: SITE_URL,
            logo: `${SITE_URL}/icons/icon-192.png`,
            description: "New Zealand's trusted marketplace for local tradespeople. Hire verified plumbers, electricians, builders, cleaners and more — fast, safe, and affordable.",
            contactPoint: {
              '@type': 'ContactPoint',
              contactType: 'customer support',
              email: 'support@quicktrade.co.nz',
              availableLanguage: 'English',
            },
            areaServed: [
              { '@type': 'Country', name: 'New Zealand' },
              { '@type': 'Country', name: 'Australia' },
            ],
            sameAs: [
              'https://www.facebook.com/QuickTradeNZ',
              'https://www.instagram.com/quicktrade.nz',
              'https://twitter.com/QuickTradeNZ',
            ],
          }),
        }}
      />
      <Script
        id="jsonld-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
            ],
          }),
        }}
      />
      <Navbar />
      <TrustSignalBar />
      <SocialProofTicker />
      <FoundersDealBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}>
        {/* Radial glow backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          {/* Interactive accordion path-tiles + A/B heading — client island */}
          <HeroPathTiles />
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-slate-800/80" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-sm text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Worker of the Month */}
      <section className="py-12 bg-gray-950 border-b border-slate-800/60">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white">This Month&apos;s Top Worker</h2>
            <p className="text-slate-400 text-sm mt-1">Recognised for outstanding service across New Zealand</p>
          </div>
          <WorkerOfMonth />
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            Browse by Category
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Find the right skilled professional for any trade work
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {JOB_CATEGORIES.map((category) => (
            <PremiumCategoryCard
              key={category.id}
              id={category.id}
              label={category.label}
              description={category.description}
              icon={CATEGORY_ICONS[category.id as CategoryId]}
              gradient={CATEGORY_GRADIENTS[category.id as CategoryId]}
              isPremium={PREMIUM_CATEGORIES.includes(category.id as CategoryId)}
            />
          ))}
        </div>
      </section>

      {/* Latest Guides & Tips */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Latest Guides &amp; Tips</h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Expert advice on hiring tradespeople, understanding costs, and getting the best value.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {latestPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group block bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 transition-all duration-200"
            >
              <span className="inline-block bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-medium px-3 py-1 rounded-full mb-3">
                {post.category}
              </span>
              <h3 className="text-white font-bold mb-2 group-hover:text-indigo-300 transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
                {post.description}
              </p>
              <span className="text-indigo-400 text-sm font-medium group-hover:text-indigo-300 transition-colors">
                Read guide →
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View all guides <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-400">Pick your path and get started in minutes</p>
          </div>
          <HowItWorksTabs />
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Top Rated Workers</h2>
            <p className="text-slate-400">Verified professionals ready to help</p>
          </div>
          <Link href="/workers" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_WORKERS.map((worker) => (
            <div
              key={worker.name}
              className={worker.isPremium
                ? 'glass-card rounded-xl border border-indigo-500/30 shadow-indigo-glow hover:shadow-indigo-glow-lg p-5 transition-all'
                : 'glass-card rounded-xl p-5 transition-all hover:border-indigo-500/20'}
            >
              <div className="text-center mb-4">
                <div
                  className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center text-lg font-bold mb-2 ${worker.isPremium ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 shadow-indigo-glow' : 'bg-gradient-to-br from-slate-600 to-slate-700'}`}
                >
                  <span className="text-white text-base font-black">{worker.initials}</span>
                </div>
                {worker.isPremium && (
                  <div className="flex justify-center mb-1">
                    <PremiumBadge variant="top-pro" />
                  </div>
                )}
                <h3 className="font-semibold text-white">{worker.name}</h3>
                <p className="text-sm text-indigo-400/80">{worker.skill}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-indigo-400 text-indigo-400" />
                  <span className="font-medium text-white">{worker.rating}</span>
                </div>
                <span>{worker.jobs} jobs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                <MapPin className="h-3 w-3" />
                {worker.location}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 100%)' }}>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(99,102,241,0.3) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Crown className="h-4 w-4 text-indigo-400" />
            <span className="text-indigo-400">New Zealand&apos;s Trade & Employment Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join thousands of tradies, homeowners, workers and employers already using QuickTrade
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <GlowButton href="/jobs?path=tradie" variant="indigo">
              <Hammer className="h-4 w-4" /> Find Jobs Near Me
            </GlowButton>
            <GlowButton href="/jobs/create?path=client" variant="violet">
              <Wrench className="h-4 w-4" /> Post a Job
            </GlowButton>
            <GlowButton href="/jobs?path=jobseeker" variant="indigo">
              <Briefcase className="h-4 w-4" /> Browse Roles
            </GlowButton>
            <GlowButton href="/jobs/create?path=employer" variant="violet">
              <Building2 className="h-4 w-4" /> Post a Role
            </GlowButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
