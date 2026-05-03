'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import JobsForYouFeed from '@/components/jobs/JobsForYouFeed'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import { Plus, Briefcase, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { getJobs } from '@/lib/services/jobService'
import type { Job } from '@/types'

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Fix Leaking Bathroom Pipe',
    description: 'I have a leaking pipe under the bathroom sink. Water is dripping consistently and needs to be fixed ASAP. The pipe appears to be cracked near the joint.',
    category: 'plumbing',
    employerId: 'emp1',
    employerName: 'John Smith',
    location: 'Blenheim/Marlborough',
    budget: 150,
    budgetType: 'fixed',
    urgency: 'high',
    status: 'open',
    jobType: 'gig',
    skills: ['Plumbing', 'Pipe Repair', 'Fixture Installation'],
    applicantsCount: 4,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Install New Electrical Panel',
    description: 'Need to upgrade the electrical panel from 100A to 200A service. Must be licensed electrician. Permit pulling required.',
    category: 'electrical',
    employerId: 'emp2',
    employerName: 'Sarah Johnson',
    location: 'Nelson',
    budget: 2500,
    budgetType: 'fixed',
    urgency: 'medium',
    status: 'open',
    jobType: 'gig',
    skills: ['Electrical', 'Panel Upgrade', 'Licensed Electrician'],
    applicantsCount: 7,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'HVAC System Maintenance',
    description: 'Annual HVAC maintenance for a 3-bedroom house. Need tune-up, filter replacement, and system inspection for both heating and cooling units.',
    category: 'hvac',
    employerId: 'emp3',
    employerName: 'Mike Williams',
    location: 'Wellington',
    budget: 200,
    budgetType: 'fixed',
    urgency: 'low',
    status: 'open',
    jobType: 'gig',
    skills: ['HVAC', 'Air Conditioning', 'Heating Systems'],
    applicantsCount: 2,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Deck Construction - 400 sq ft',
    description: 'Build a new pressure-treated wood deck off the back of the house. 20x20 feet, with stairs and railing. Permits required.',
    category: 'carpentry',
    employerId: 'emp4',
    employerName: 'Lisa Brown',
    location: 'Christchurch',
    budget: 8500,
    budgetType: 'fixed',
    urgency: 'low',
    status: 'open',
    jobType: 'gig',
    skills: ['Carpentry', 'Deck Building', 'Framing'],
    applicantsCount: 12,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Emergency Roof Leak Repair',
    description: 'Water coming in through the roof during rain. Need immediate inspection and patch. Single-story home, asphalt shingles.',
    category: 'roofing',
    employerId: 'emp5',
    employerName: 'David Garcia',
    location: 'Auckland',
    budget: 500,
    budgetType: 'fixed',
    urgency: 'emergency',
    status: 'open',
    jobType: 'gig',
    skills: ['Roofing', 'Shingle Repair', 'Waterproofing'],
    applicantsCount: 3,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Interior House Painting',
    description: 'Paint the interior of a 2000 sq ft home - 4 bedrooms, 2 bathrooms, living room, kitchen. Customer will provide paint. Need primer + 2 coats.',
    category: 'painting',
    employerId: 'emp6',
    employerName: 'Amanda Lee',
    location: 'Hamilton',
    budget: 65,
    budgetType: 'hourly',
    urgency: 'low',
    status: 'open',
    jobType: 'gig',
    skills: ['Painting', 'Interior Painting', 'Primer Application'],
    applicantsCount: 9,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const EMPTY_FILTERS = {
  search: '',
  category: '',
  location: '',
  budgetMin: '',
  budgetMax: '',
  urgency: '',
  jobType: '',
  sortBy: '',
}

function JobsPageContent() {
  const { profile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'for-you'>(
    searchParams.get('tab') === 'for-you' ? 'for-you' : 'all'
  )

  // Initialise filter state from URL params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') ?? '',
    category: searchParams.get('category') ?? '',
    location: searchParams.get('location') ?? '',
    budgetMin: searchParams.get('budgetMin') ?? '',
    budgetMax: searchParams.get('budgetMax') ?? '',
    urgency: searchParams.get('urgency') ?? '',
    jobType: searchParams.get('jobType') ?? '',
    sortBy: searchParams.get('sortBy') ?? '',
  }))

  // Sync filters → URL params
  const syncUrl = useCallback((newFilters: typeof filters, tab: 'all' | 'for-you') => {
    const params = new URLSearchParams()
    if (tab === 'for-you') params.set('tab', 'for-you')
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const fetched = await getJobs()
        setJobs(fetched.length > 0 ? fetched : MOCK_JOBS)
      } catch {
        setJobs(MOCK_JOBS)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 } as const

  // Jobseekers only see employment-type jobs
  const roleFilteredJobs = profile?.role === 'jobseeker'
    ? jobs.filter((job) => !job.jobType || job.jobType === 'employment')
    : jobs

  const filteredJobs = roleFilteredJobs.filter((job) => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category && job.category !== filters.category) return false
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.budgetMin && job.budget < Number(filters.budgetMin)) return false
    if (filters.budgetMax && job.budget > Number(filters.budgetMax)) return false
    if (filters.urgency && job.urgency !== filters.urgency) return false
    if (filters.jobType && job.jobType !== filters.jobType) return false
    return true
  })

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'budget_high':
        return b.budget - a.budget
      case 'budget_low':
        return a.budget - b.budget
      case 'urgency':
      default:
        return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    }
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      syncUrl(next, activeTab)
      return next
    })
  }

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS)
    syncUrl(EMPTY_FILTERS, activeTab)
  }

  const handleTabChange = (tab: 'all' | 'for-you') => {
    setActiveTab(tab)
    syncUrl(filters, tab)
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="h-6 w-6 text-primary-600" />
                  {profile?.role === 'jobseeker' ? 'Staff Jobs' : 'Browse Jobs'}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {activeTab === 'all'
                    ? `${sortedJobs.length} job${sortedJobs.length !== 1 ? 's' : ''} found${profile?.role === 'jobseeker' ? ' — employment roles' : ''}`
                    : 'Jobs matched to your skills'}
                </p>
              </div>
              {profile?.role === 'employer' && (
                <Link href="/jobs/create">
                  <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Post a Job
                  </button>
                </Link>
              )}
            </div>

            {/* Tabs — only shown to workers */}
            {profile?.role === 'worker' && (
              <div className="flex gap-1 mt-5 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleTabChange('all')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === 'all'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  All Jobs
                </button>
                <button
                  onClick={() => handleTabChange('for-you')}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    activeTab === 'for-you'
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  For You
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'for-you' && profile?.role === 'worker' ? (
            <JobsForYouFeed />
          ) : (
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Filters Sidebar */}
              <div className="lg:w-72 flex-shrink-0">
                <div className="sticky top-20">
                  <JobFilters
                    filters={filters}
                    onChange={handleFilterChange}
                    onReset={handleFilterReset}
                  />
                </div>
              </div>

              {/* Job Listings */}
              <div className="flex-1">
                {sortedJobs.length === 0 ? (
                  <div className="text-center py-16">
                    <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No jobs found</h3>
                    <p className="text-gray-500 dark:text-gray-400">
                      Try adjusting your filters or{' '}
                      <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                        clear all filters
                      </button>
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sortedJobs.map((job) => (
                      <JobCard key={job.id} job={job} showApplyButton={profile?.role === 'jobseeker'} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    }>
      <JobsPageContent />
    </Suspense>
  )
}
