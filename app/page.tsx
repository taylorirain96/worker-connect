import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import TrustSignalBar from '@/components/luxury/TrustSignalBar'
import GlowButton from '@/components/luxury/GlowButton'
import PremiumBadge from '@/components/luxury/PremiumBadge'
import PremiumCategoryCard from '@/components/luxury/PremiumCategoryCard'
import HowItWorksTabs from '@/components/home/HowItWorksTabs'
import FoundersDealBanner from '@/components/home/FoundersDealBanner'
import { JOB_CATEGORIES, CATEGORY_ICONS, CATEGORY_GRADIENTS, type CategoryId } from '@/lib/utils'
import {
  MapPin,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  Crown,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'QuickTrade | Trade Work & Employment in New Zealand',
  description:
    'QuickTrade connects tradies, homeowners, job seekers and employers across Marlborough, Nelson, Blenheim and Wellington. Find a tradie, post a trade job, or browse part-time and full-time employment — all in one place.',
  keywords:
    'trade workers NZ, hire tradesperson Marlborough, find electrician Nelson, plumber Blenheim, builder Wellington, jobs NZ, employment NZ, QuickTrade',
  openGraph: {
    title: 'QuickTrade | Trade Work & Employment in New Zealand',
    description:
      'Whether you\'re a tradie, a homeowner, looking for work, or looking to hire — QuickTrade connects the right people across New Zealand.',
    url: 'https://quicktrade.co.nz',
    siteName: 'QuickTrade',
    type: 'website',
  },
}

const STATS = [
  { label: 'Active Workers', value: '12,000+', icon: Users },
  { label: 'Jobs Completed', value: '45,000+', icon: CheckCircle },
  { label: 'Avg Rating', value: '4.8★', icon: Star },
  { label: 'Regions Covered', value: 'NZ Wide', icon: MapPin },
]

const PATH_TILES = [
  {
    emoji: '🔨',
    title: "I'm a tradie",
    description: 'Find local trade jobs, quote clients, get paid safely',
    cta: 'Find Jobs Near Me',
    href: '/jobs?path=tradie',
    accent: 'border-orange-500/40 hover:border-orange-500/70',
    badge: 'bg-orange-500/10 text-orange-300',
  },
  {
    emoji: '🏠',
    title: 'I need a tradie',
    description: 'Post your job and get quotes from verified local tradies',
    cta: 'Post a Job',
    href: '/jobs/create?path=client',
    accent: 'border-sky-500/40 hover:border-sky-500/70',
    badge: 'bg-sky-500/10 text-sky-300',
  },
  {
    emoji: '👷',
    title: "I'm looking for work",
    description: 'Browse part-time, casual and full-time roles near you',
    cta: 'Browse Jobs',
    href: '/jobs?path=jobseeker',
    accent: 'border-emerald-500/40 hover:border-emerald-500/70',
    badge: 'bg-emerald-500/10 text-emerald-300',
  },
  {
    emoji: '🏢',
    title: 'I want to hire someone',
    description: 'Post a role and find the right person for your team',
    cta: 'Post a Role',
    href: '/jobs/create?path=employer',
    accent: 'border-violet-500/40 hover:border-violet-500/70',
    badge: 'bg-violet-500/10 text-violet-300',
  },
]

const FEATURED_WORKERS = [
  { name: 'James Tahu', skill: 'Master Plumber', rating: 4.9, jobs: 87, location: 'Blenheim, Marlborough', initials: 'JT', isPremium: true },
  { name: 'Sarah Wilson', skill: 'Licensed Electrician', rating: 4.8, jobs: 124, location: 'Nelson, Tasman', initials: 'SW', isPremium: true },
  { name: 'Mark Te Hau', skill: 'Builder & Carpenter', rating: 5.0, jobs: 56, location: 'Wellington, Wellington', initials: 'MT', isPremium: false },
  { name: 'Emily Fraser', skill: 'Landscape Gardener', rating: 4.7, jobs: 203, location: 'Christchurch, Canterbury', initials: 'EF', isPremium: false },
]

const PREMIUM_CATEGORIES: CategoryId[] = ['plumbing', 'electrical', 'hvac']

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <TrustSignalBar />
      <FoundersDealBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 60%, #0a0f1e 100%)' }}>
        {/* Radial glow backdrop */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.18) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              <span className="text-indigo-300">Trusted by 12,000+ tradies and workers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              New Zealand&apos;s Home for{' '}
              <span className="platinum-shimmer">Trade Work & Employment</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto">
              Whether you&apos;re a tradie, a homeowner, looking for work, or looking to hire — QuickTrade connects the right people.
            </p>

            {/* 4 Path Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
              {PATH_TILES.map((tile) => (
                <Link
                  key={tile.title}
                  href={tile.href}
                  className={`glass-card rounded-2xl p-6 border ${tile.accent} text-left transition-all hover:scale-[1.02] group`}
                >
                  <div className={`inline-flex items-center justify-center h-12 w-12 rounded-xl ${tile.badge} text-2xl mb-4`}>
                    {tile.emoji}
                  </div>
                  <h2 className="text-base font-bold text-white mb-2">{tile.title}</h2>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">{tile.description}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    {tile.cta} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
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

      {/* SEO Content Section */}
      <section className="py-20 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              New Zealand&apos;s Trade Platform — Built for the South Island
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Connecting businesses and homeowners in Marlborough, Nelson, Blenheim and Wellington
              with verified, reviewed trade professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Hire in Marlborough & Blenheim</h3>
              <p className="text-gray-400 leading-relaxed">
                Find electricians, plumbers, builders and general labourers across the Marlborough region.
                All workers are verified and reviewed by real employers. Post a job and get applicants the same day.
              </p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Trade Work in Nelson & Tasman</h3>
              <p className="text-gray-400 leading-relaxed">
                Browse trade job listings across Nelson City and Tasman District. From residential renovations
                to commercial construction — QuickTrade matches you with the right opportunities.
              </p>
            </div>
            <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-3">Wellington Tradespeople</h3>
              <p className="text-gray-400 leading-relaxed">
                Wellington&apos;s fastest-growing trade platform. Find work or hire workers across the Wellington
                region. Vetted professionals, transparent pricing, and escrow payment protection.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Electricians', href: '/workers?category=Electrical' },
              { label: 'Plumbers', href: '/workers?category=Plumbing' },
              { label: 'Builders', href: '/workers?category=Carpentry+%26+Joinery' },
              { label: 'Painters', href: '/workers?category=Painting+%26+Decorating' },
              { label: 'Landscapers', href: '/workers?category=Landscaping+%26+Gardening' },
              { label: 'Roofers', href: '/workers?category=Roofing' },
              { label: 'Tilers', href: '/workers?category=Tiling+%26+Flooring' },
              { label: 'Labourers', href: '/workers?category=General+Labourer' },
            ].map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="bg-gray-900 border border-gray-800 hover:border-indigo-500/50 rounded-xl p-4 text-center text-gray-300 hover:text-white font-medium transition-all text-sm"
              >
                {label} →
              </a>
            ))}
          </div>
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

      {/* Trust Indicators */}
      <section className="py-16" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">
              Why Choose QuickTrade?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-indigo-400" />,
                title: 'Verified Professionals',
                description: 'All workers are background-checked and license-verified before joining the platform.',
              },
              {
                icon: <Clock className="h-8 w-8 text-sky-400" />,
                title: 'Fast Response Time',
                description: 'Get proposals from multiple workers within hours of posting your job.',
              },
              {
                icon: <Star className="h-8 w-8 text-violet-400" />,
                title: 'Quality Guaranteed',
                description: 'Our escrow payment system ensures you only pay for work you\'re satisfied with.',
              },
            ].map(({ icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 glass-card rounded-2xl shadow-sm mb-4">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-400 text-sm">{description}</p>
              </div>
            ))}
          </div>
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
              🔨 Find Jobs Near Me
            </GlowButton>
            <GlowButton href="/jobs/create?path=client" variant="violet">
              🏠 Post a Job
            </GlowButton>
            <GlowButton href="/jobs?path=jobseeker" variant="indigo">
              👷 Browse Roles
            </GlowButton>
            <GlowButton href="/jobs/create?path=employer" variant="violet">
              🏢 Post a Role
            </GlowButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
