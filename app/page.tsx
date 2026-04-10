import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { JOB_CATEGORIES, CATEGORY_ICONS, CATEGORY_GRADIENTS, type CategoryId } from '@/lib/utils'
import TrustSignalBar from '@/components/luxury/TrustSignalBar'
import PremiumCategoryCard from '@/components/luxury/PremiumCategoryCard'
import GlowButton from '@/components/luxury/GlowButton'
import PremiumBadge from '@/components/luxury/PremiumBadge'
import {
  Search,
  MapPin,
  Shield,
  Clock,
  Star,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  FileText,
  UserCheck,
  CreditCard,
  UserCircle,
  Briefcase,
  Banknote,
  Crown,
  BadgeCheck,
} from 'lucide-react'

const STATS = [
  { label: 'Active Workers', value: '12,000+', icon: Users },
  { label: 'Jobs Completed', value: '45,000+', icon: CheckCircle },
  { label: 'Avg Rating', value: '4.8★', icon: Star },
  { label: 'Cities Covered', value: '200+', icon: MapPin },
]

const HOW_IT_WORKS_EMPLOYER = [
  { step: '01', title: 'Post a Job', description: 'Describe what you need, set your budget, and specify the timeline.', icon: FileText },
  { step: '02', title: 'Review Applicants', description: 'Browse worker profiles, check reviews, and compare proposals.', icon: UserCheck },
  { step: '03', title: 'Hire & Pay Securely', description: 'Accept a worker, fund escrow, and release payment when done.', icon: CreditCard },
]

const HOW_IT_WORKS_WORKER = [
  { step: '01', title: 'Create Your Profile', description: 'Showcase your skills, certifications, and portfolio.', icon: UserCircle },
  { step: '02', title: 'Browse & Apply', description: 'Find jobs that match your skills and submit proposals.', icon: Briefcase },
  { step: '03', title: 'Work & Get Paid', description: 'Complete the job and receive secure payment instantly.', icon: Banknote },
]

const FEATURED_WORKERS = [
  { name: 'Mike Johnson', skill: 'Master Plumber', rating: 4.9, jobs: 87, location: 'New York, NY', isPremium: true },
  { name: 'Sarah Chen', skill: 'Licensed Electrician', rating: 4.8, jobs: 124, location: 'Los Angeles, CA', isPremium: true },
  { name: 'Carlos Rivera', skill: 'HVAC Technician', rating: 5.0, jobs: 56, location: 'Chicago, IL', isPremium: false },
  { name: 'Emily Parker', skill: 'Carpenter & Joiner', rating: 4.7, jobs: 203, location: 'Houston, TX', isPremium: false },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar />
      <TrustSignalBar />

      {/* Hero Section — Luxury Dark */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}>
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.04]" />
        {/* Gold radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Premium trust badge */}
            <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/30 rounded-full px-4 py-1.5 text-sm mb-6">
              <TrendingUp className="h-4 w-4 text-gold-400" />
              <span className="text-gold-300 font-medium">Trusted by 12,000+ skilled professionals</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight text-white">
              Find Elite Tradespeople{' '}
              <span className="gold-shimmer">Near You</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connect with verified, background-checked plumbers, electricians, carpenters, and
              more. Post a job in minutes — get proposals from top-rated professionals.
            </p>

            {/* Search Bar — glass morphism */}
            <div className="bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    className="w-full pl-10 pr-4 py-3 text-white bg-transparent focus:outline-none text-sm placeholder:text-slate-500"
                  />
                </div>
                <div className="flex-1 relative border-t sm:border-t-0 sm:border-l border-slate-700/60">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Your location"
                    className="w-full pl-10 pr-4 py-3 text-white bg-transparent focus:outline-none text-sm placeholder:text-slate-500"
                  />
                </div>
                <Link
                  href="/workers"
                  className="bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold px-6 py-3 rounded-xl text-sm transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-gold-glow hover:scale-105 flex-shrink-0"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Popular categories quick-links */}
            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-slate-500">
              <span>Popular:</span>
              {['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Roofing'].map((cat) => (
                <Link
                  key={cat}
                  href={`/workers?category=${cat.toLowerCase()}`}
                  className="text-gold-500/80 hover:text-gold-400 transition-colors underline underline-offset-2"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gold-500/10 border border-gold-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-gold-400" />
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{value}</div>
                  <div className="text-xs text-slate-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories — Luxury Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">Browse by Category</h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Find the right skilled professional for any trade work
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {JOB_CATEGORIES.map((category) => {
            const id = category.id as CategoryId
            return (
              <PremiumCategoryCard
                key={id}
                id={id}
                label={category.label}
                description={category.description}
                icon={CATEGORY_ICONS[id]}
                gradient={CATEGORY_GRADIENTS[id]}
                isPremium={['plumbing', 'electrical', 'hvac'].includes(id)}
              />
            )
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-slate-900/60 py-16 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">How It Works</h2>
            <p className="text-slate-500">Get started in just a few simple steps</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            {/* For Employers */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 rounded-lg px-3 py-1 normal-case text-sm font-bold">For Employers</span>
              </h3>
              <div className="space-y-6">
                {HOW_IT_WORKS_EMPLOYER.map(({ step, title, description, icon: Icon }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gold-400" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-gold-500/70 uppercase tracking-wide">{step}</span>
                        <h4 className="font-semibold text-white">{title}</h4>
                      </div>
                      <p className="text-sm text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <GlowButton href="/jobs/create" pulse>
                  Post a Job <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </div>
            </div>

            {/* For Workers */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="bg-gradient-to-r from-slate-700 to-slate-600 text-slate-200 rounded-lg px-3 py-1 normal-case text-sm font-bold border border-slate-600/50">For Workers</span>
              </h3>
              <div className="space-y-6">
                {HOW_IT_WORKS_WORKER.map(({ step, title, description, icon: Icon }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-slate-400" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{step}</span>
                        <h4 className="font-semibold text-white">{title}</h4>
                      </div>
                      <p className="text-sm text-slate-500">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <GlowButton href="/auth/register" variant="outline">
                  Start Earning <ArrowRight className="h-4 w-4" />
                </GlowButton>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Top Rated Workers</h2>
            <p className="text-slate-500">Verified professionals ready to help</p>
          </div>
          <Link href="/workers" className="text-gold-500 hover:text-gold-400 text-sm font-medium flex items-center gap-1 transition-colors">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_WORKERS.map((worker) => (
            <div
              key={worker.name}
              className={[
                'relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border p-5 transition-all duration-300 hover:scale-[1.02]',
                worker.isPremium
                  ? 'border-gold-500/30 shadow-gold-glow hover:shadow-gold-glow-lg'
                  : 'border-slate-700/50 hover:border-slate-600/60 hover:shadow-xl',
              ].join(' ')}
            >
              <div className="text-center mb-4">
                {/* Avatar placeholder with initials */}
                <div className="relative inline-block">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-xl font-bold text-white mb-2 mx-auto border-2 border-slate-600/50">
                    {worker.name.split(' ').filter(n => n).map(n => n[0]).join('')}
                  </div>
                  {worker.isPremium && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-gold-500 to-gold-600 rounded-full flex items-center justify-center shadow-gold-glow">
                      <Crown className="h-3 w-3 text-slate-900" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-white text-sm">{worker.name}</h3>
                <p className="text-xs text-gold-400/80 font-medium mt-0.5">{worker.skill}</p>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-gold-400 text-gold-400" />
                  <span className="font-bold text-white text-xs">{worker.rating}</span>
                </div>
                <span className="text-slate-500 text-xs">{worker.jobs} jobs</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-600 mt-2">
                <MapPin className="h-3 w-3" />
                {worker.location}
              </div>

              {worker.isPremium && (
                <div className="mt-3">
                  <PremiumBadge variant="top-pro" pulse />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Trust & Credentials */}
      <section className="bg-slate-900/60 py-16 border-y border-slate-800/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-3">Why Choose QuickTrade?</h2>
            <p className="text-slate-500 max-w-xl mx-auto">Built on a foundation of trust, transparency, and excellence</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                iconColor: 'text-gold-400',
                bgColor: 'bg-gold-500/10 border-gold-500/20',
                title: 'Verified Professionals',
                description: 'All workers are background-checked and license-verified before joining the platform.',
              },
              {
                icon: Clock,
                iconColor: 'text-blue-400',
                bgColor: 'bg-blue-500/10 border-blue-500/20',
                title: 'Fast Response Time',
                description: 'Get proposals from multiple workers within hours of posting your job.',
              },
              {
                icon: BadgeCheck,
                iconColor: 'text-emerald-400',
                bgColor: 'bg-emerald-500/10 border-emerald-500/20',
                title: 'Quality Guaranteed',
                description: 'Our escrow payment system ensures you only pay for work you\'re satisfied with.',
              },
            ].map(({ icon: Icon, iconColor, bgColor, title, description }) => (
              <div
                key={title}
                className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.1)]"
              >
                <div className={`inline-flex items-center justify-center h-14 w-14 border rounded-2xl mb-4 ${bgColor}`}>
                  <Icon className={`h-7 w-7 ${iconColor}`} strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1a2540 50%, #0f172a 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.3) 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 text-sm mb-6">
            <Crown className="h-4 w-4 text-gold-400" />
            <span className="text-gold-400 font-medium">Premium Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-400 mb-10 text-lg max-w-xl mx-auto">
            Join thousands of workers and employers already using QuickTrade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <GlowButton href="/auth/register?role=employer" pulse>
              Post a Job
            </GlowButton>
            <GlowButton href="/auth/register?role=worker" variant="outline">
              Find Work
            </GlowButton>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

