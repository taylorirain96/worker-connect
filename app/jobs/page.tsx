'use client'
import { useEffect, useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import JobCard from '@/components/jobs/JobCard'
import JobFilters from '@/components/jobs/JobFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Link from 'next/link'
import { Plus, Briefcase } from 'lucide-react'
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
    location: 'New York, NY',
    budget: 150,
    budgetType: 'fixed',
    urgency: 'high',
    status: 'open',
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
    location: 'Los Angeles, CA',
    budget: 2500,
    budgetType: 'fixed',
    urgency: 'medium',
    status: 'open',
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
    location: 'Chicago, IL',
    budget: 200,
    budgetType: 'fixed',
    urgency: 'low',
    status: 'open',
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
    location: 'Houston, TX',
    budget: 8500,
    budgetType: 'fixed',
    urgency: 'low',
    status: 'open',
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
    location: 'Phoenix, AZ',
    budget: 500,
    budgetType: 'fixed',
    urgency: 'emergency',
    status: 'open',
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
    location: 'Seattle, WA',
    budget: 65,
    budgetType: 'hourly',
    urgency: 'low',
    status: 'open',
    skills: ['Painting', 'Interior Painting', 'Primer Application'],
    applicantsCount: 9,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

export default function JobsPage() {
  const { profile } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    location: '',
    budgetMin: '',
    budgetMax: '',
    urgency: '',
    status: '',
  })

  useEffect(() => {
    async function fetchJobs() {
      setLoading(true)
      try {
        const fetched = await getJobs()
        // Fall back to mock data when Firestore is not configured or returns empty
        setJobs(fetched.length > 0 ? fetched : MOCK_JOBS)
      } catch {
        setJobs(MOCK_JOBS)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

  // Sort urgent jobs first
  const sortedJobs = [...jobs].sort((a, b) => {
    const urgencyOrder = { emergency: 0, high: 1, medium: 2, low: 3 }
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
  })

  const filteredJobs = sortedJobs.filter((job) => {
    if (filters.search && !job.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !job.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.category && job.category !== filters.category) return false
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.budgetMin && job.budget < Number(filters.budgetMin)) return false
    if (filters.budgetMax && job.budget > Number(filters.budgetMax)) return false
    if (filters.urgency && job.urgency !== filters.urgency) return false
    if (filters.status && job.status !== filters.status) return false
    return true
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleFilterReset = () => {
    setFilters({ search: '', category: '', location: '', budgetMin: '', budgetMax: '', urgency: '', status: '' })
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
                  Browse Jobs
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} available
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
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              {filteredJobs.length === 0 ? (
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
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

