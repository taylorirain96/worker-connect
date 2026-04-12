'use client'

import { useState } from 'react'
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
  HardHat,
  ClipboardList,
  Hammer,
  Briefcase,
  Wrench,
  Building2,
  ChevronDown,
} from 'lucide-react'

const STATS = [
  { label: 'Active Workers', value: '12,000+', icon: Users },
  { label: 'Jobs Completed', value: '45,000+', icon: CheckCircle },
  { label: 'Avg Rating', value: '4.8★', icon: Star },
  { label: 'Regions Covered', value: 'NZ Wide', icon: MapPin },
]

const WORK_SUBTILES = [
  {
    icon: Hammer,
    title: "I'm a Tradie",
    description: 'Trade & skilled work',
    href: '/jobs?path=tradie',
  },
  {
    icon: Briefcase,
    title: 'Looking for work',
    description: 'Jobs, contracts & roles',
    href: '/jobs?path=jobseeker',
  },
]

const HIRE_SUBTILES = [
  {
    icon: Wrench,
    title: 'Get a job done',
    description: 'One-off, any size',
    href: '/jobs/create?path=client',
  },
  {
    icon: Building2,
    title: "I'm a Business",
    description: 'I hire regularly',
    href: '/jobs/create?path=employer',
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
  const [expanded, setExpanded] = useState<'work' | 'hire' | null>(null)

  function toggle(key: 'work' | 'hire') {
    setExpanded((prev) => (prev === key ? null : key))
  }

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
              Whether you need a tradie or you are one — QuickTrade connects the right people across New Zealand.
            </p>

            {/* 2-Step Path Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 max-w-2xl mx-auto">
              {/* I want work */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggle('work')}
                  aria-expanded={expanded === 'work'}
                  className="bg-slate-900/70 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] group w-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 mb-4">
                      <HardHat className="h-6 w-6 text-indigo-400" />
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-indigo-400 mt-1 transition-transform duration-300 ${expanded === 'work' ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <h2 className="text-base font-bold text-white mb-1">I want work</h2>
                  <p className="text-sm text-slate-400">Tradies & job seekers</p>
                </button>
                <div
                  aria-hidden={expanded !== 'work'}
                  className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ${expanded === 'work' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {WORK_SUBTILES.map(({ icon: Icon, title, description, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="bg-slate-800/60 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/50 text-left transition-all group"
                    >
                      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500/10 mb-3">
                        <Icon className="h-4 w-4 text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                      <p className="text-xs text-slate-400 mb-2">{description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        Go <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* I need work done */}
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => toggle('hire')}
                  aria-expanded={expanded === 'hire'}
                  className="bg-slate-900/70 rounded-2xl p-6 border border-indigo-500/30 hover:border-indigo-500/60 text-left transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.2)] group w-full"
                >
                  <div className="flex items-start justify-between">
                    <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-500/10 mb-4">
                      <ClipboardList className="h-6 w-6 text-indigo-400" />
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-indigo-400 mt-1 transition-transform duration-300 ${expanded === 'hire' ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <h2 className="text-base font-bold text-white mb-1">I need work done</h2>
                  <p className="text-sm text-slate-400">One-off or hire someone</p>
                </button>
                <div
                  aria-hidden={expanded !== 'hire'}
                  className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 ${expanded === 'hire' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  {HIRE_SUBTILES.map(({ icon: Icon, title, description, href }) => (
                    <Link
                      key={href}
                      href={href}
                      className="bg-slate-800/60 rounded-xl p-4 border border-indigo-500/20 hover:border-indigo-500/50 text-left transition-all group"
                    >
                      <div className="inline-flex items-center justify-center h-9 w-9 rounded-lg bg-indigo-500/10 mb-3">
                        <Icon className="h-4 w-4 text-indigo-400" />
                      </div>
                      <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                      <p className="text-xs text-slate-400 mb-2">{description}</p>
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                        Go <ArrowRight className="h-3 w-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
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
