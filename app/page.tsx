import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { JOB_CATEGORIES } from '@/lib/utils'
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
} from 'lucide-react'

const STATS = [
  { label: 'Active Workers', value: '12,000+', icon: Users },
  { label: 'Jobs Completed', value: '45,000+', icon: CheckCircle },
  { label: 'Avg Rating', value: '4.8★', icon: Star },
  { label: 'Cities Covered', value: '200+', icon: MapPin },
]

const HOW_IT_WORKS_EMPLOYER = [
  { step: '01', title: 'Post a Job', description: 'Describe what you need, set your budget, and specify the timeline.', icon: '📝' },
  { step: '02', title: 'Review Applicants', description: 'Browse worker profiles, check reviews, and compare proposals.', icon: '👀' },
  { step: '03', title: 'Hire & Pay Securely', description: 'Accept a worker, fund escrow, and release payment when done.', icon: '✅' },
]

const HOW_IT_WORKS_WORKER = [
  { step: '01', title: 'Create Your Profile', description: 'Showcase your skills, certifications, and portfolio.', icon: '👤' },
  { step: '02', title: 'Browse & Apply', description: 'Find jobs that match your skills and submit proposals.', icon: '🔍' },
  { step: '03', title: 'Work & Get Paid', description: 'Complete the job and receive secure payment instantly.', icon: '💰' },
]

const FEATURED_WORKERS = [
  { name: 'Mike Johnson', skill: 'Master Plumber', rating: 4.9, jobs: 87, location: 'New York, NY', avatar: '👷' },
  { name: 'Sarah Chen', skill: 'Licensed Electrician', rating: 4.8, jobs: 124, location: 'Los Angeles, CA', avatar: '⚡' },
  { name: 'Carlos Rivera', skill: 'HVAC Technician', rating: 5.0, jobs: 56, location: 'Chicago, IL', avatar: '❄️' },
  { name: 'Emily Parker', skill: 'Carpenter & Joiner', rating: 4.7, jobs: 203, location: 'Houston, TX', avatar: '🪚' },
]

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-700 to-primary-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <TrendingUp className="h-4 w-4 text-accent-500" />
              <span>Trusted by 12,000+ skilled workers</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Find Skilled Workers{' '}
              <span className="text-accent-500">Fast</span>
            </h1>
            <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Connect with verified plumbers, electricians, carpenters, and more. Post a job in
              minutes, get proposals from skilled tradespeople near you.
            </p>

            {/* Search Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="What do you need help with?"
                    className="w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none text-sm"
                  />
                </div>
                <div className="flex-1 relative border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your location"
                    className="w-full pl-10 pr-4 py-3 text-gray-900 dark:text-gray-100 bg-transparent focus:outline-none text-sm"
                  />
                </div>
                <Link
                  href="/workers"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  Search
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6 text-sm text-primary-200">
              <span>Popular:</span>
              {['Plumbing', 'Electrical', 'Carpentry', 'HVAC', 'Roofing'].map((cat) => (
                <Link
                  key={cat}
                  href={`/workers?category=${cat.toLowerCase()}`}
                  className="hover:text-white transition-colors underline underline-offset-2"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{value}</div>
                  <div className="text-sm text-gray-500">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
            Browse by Category
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Find the right skilled professional for any trade work
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {JOB_CATEGORIES.map((category) => (
            <Link
              key={category.id}
              href={`/workers?category=${category.id}`}
              className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-400 dark:hover:border-primary-600 hover:shadow-md transition-all group"
            >
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">{category.icon}</span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors text-center">
                {category.label}
              </span>
              <span className="text-xs text-gray-400 text-center mt-1 hidden sm:block">
                {category.description}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">How It Works</h2>
            <p className="text-gray-500 dark:text-gray-400">Get started in just a few simple steps</p>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-primary-600 text-white rounded-lg px-3 py-1 text-sm">For Employers</span>
              </h3>
              <div className="space-y-6">
                {HOW_IT_WORKS_EMPLOYER.map(({ step, title, description, icon }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-xl">
                        {icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-primary-600 uppercase tracking-wide">{step}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/jobs/create"
                className="mt-8 inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Post a Job <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <span className="bg-accent-500 text-white rounded-lg px-3 py-1 text-sm">For Workers</span>
              </h3>
              <div className="space-y-6">
                {HOW_IT_WORKS_WORKER.map(({ step, title, description, icon }) => (
                  <div key={step} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-xl bg-accent-500/10 flex items-center justify-center text-xl">
                        {icon}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-accent-600 uppercase tracking-wide">{step}</span>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/register"
                className="mt-8 inline-flex items-center gap-2 bg-accent-500 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-accent-600 transition-colors"
              >
                Start Earning <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Top Rated Workers</h2>
            <p className="text-gray-500 dark:text-gray-400">Verified professionals ready to help</p>
          </div>
          <Link href="/workers" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURED_WORKERS.map((worker) => (
            <div
              key={worker.name}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md transition-all"
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">{worker.avatar}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{worker.name}</h3>
                <p className="text-sm text-primary-600">{worker.skill}</p>
              </div>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium text-gray-700 dark:text-gray-300">{worker.rating}</span>
                </div>
                <span>{worker.jobs} jobs</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                <MapPin className="h-3 w-3" />
                {worker.location}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-primary-50 dark:bg-primary-900/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              Why Choose QuickTrade?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-8 w-8 text-primary-600" />,
                title: 'Verified Professionals',
                description: 'All workers are background-checked and license-verified before joining the platform.',
              },
              {
                icon: <Clock className="h-8 w-8 text-accent-500" />,
                title: 'Fast Response Time',
                description: 'Get proposals from multiple workers within hours of posting your job.',
              },
              {
                icon: <Star className="h-8 w-8 text-yellow-500" />,
                title: 'Quality Guaranteed',
                description: 'Our escrow payment system ensures you only pay for work you\'re satisfied with.',
              },
            ].map(({ icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="inline-flex items-center justify-center h-16 w-16 bg-white dark:bg-gray-800 rounded-2xl shadow-sm mb-4">
                  {icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-primary-100 mb-8 text-lg">
            Join thousands of workers and employers already using QuickTrade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=employer"
              className="bg-white text-primary-600 px-8 py-3 rounded-xl font-semibold hover:bg-primary-50 transition-colors"
            >
              Post a Job
            </Link>
            <Link
              href="/auth/register?role=worker"
              className="bg-primary-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-primary-400 border border-primary-400 transition-colors"
            >
              Find Work
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
