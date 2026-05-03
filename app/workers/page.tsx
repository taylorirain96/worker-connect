'use client'
import { Suspense, useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WorkerCard from '@/components/workers/WorkerCard'
import WorkerFilters from '@/components/workers/WorkerFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Users } from 'lucide-react'
import { getWorkers } from '@/lib/services/workerService'
import type { UserProfile } from '@/types'

const MOCK_WORKERS: UserProfile[] = [
  {
    uid: 'w1',
    email: 'mike@example.com',
    displayName: 'Mike Johnson',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Master plumber with 15 years of experience. Specialised in residential and commercial plumbing, pipe repair, and water heater installation.',
    location: 'Auckland',
    skills: ['Plumbing', 'Pipe Repair', 'Water Heater', 'Drain Cleaning', 'Fixture Installation'],
    hourlyRate: 85,
    availability: 'available',
    rating: 4.9,
    reviewCount: 87,
    completedJobs: 87,
    verified: true,
  },
  {
    uid: 'w2',
    email: 'sarah@example.com',
    displayName: 'Sarah Chen',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Licensed electrician specialising in residential wiring, panel upgrades, and smart home installations.',
    location: 'Wellington',
    skills: ['Electrical', 'Panel Upgrades', 'Smart Home', 'Rewiring', 'EV Chargers'],
    hourlyRate: 95,
    availability: 'available',
    rating: 4.8,
    reviewCount: 124,
    completedJobs: 124,
    verified: true,
  },
  {
    uid: 'w3',
    email: 'carlos@example.com',
    displayName: 'Carlos Rivera',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'HVAC technician certified in all major brands. Available for installation, maintenance, and emergency repairs.',
    location: 'Christchurch',
    skills: ['HVAC', 'Air Conditioning', 'Heating Systems', 'Ductwork', 'Refrigerant'],
    hourlyRate: 75,
    availability: 'busy',
    rating: 5.0,
    reviewCount: 56,
    completedJobs: 56,
    verified: true,
  },
  {
    uid: 'w4',
    email: 'emily@example.com',
    displayName: 'Emily Parker',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Custom furniture builder and finish carpenter with an eye for detail. Kitchen cabinets, decks, and trim work specialist.',
    location: 'Hamilton',
    skills: ['Carpentry', 'Custom Furniture', 'Deck Building', 'Trim Work', 'Cabinet Making'],
    hourlyRate: 70,
    availability: 'available',
    rating: 4.7,
    reviewCount: 203,
    completedJobs: 203,
    verified: true,
  },
  {
    uid: 'w5',
    email: 'james@example.com',
    displayName: 'James Wilson',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Licensed roofer specialising in asphalt shingles, metal roofing, and flat roof systems. Emergency repairs available.',
    location: 'Nelson',
    skills: ['Roofing', 'Shingle Installation', 'Metal Roofing', 'Flat Roofs', 'Gutters'],
    hourlyRate: 80,
    availability: 'available',
    rating: 4.6,
    reviewCount: 42,
    completedJobs: 42,
    verified: false,
  },
  {
    uid: 'w6',
    email: 'anna@example.com',
    displayName: 'Anna Martinez',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Professional interior and exterior painter. Meticulous prep work, clean finish. Residential specialist.',
    location: 'Tauranga',
    skills: ['Painting', 'Interior Painting', 'Exterior Painting', 'Drywall Repair', 'Colour Consultation'],
    hourlyRate: 55,
    availability: 'available',
    rating: 4.9,
    reviewCount: 78,
    completedJobs: 78,
    verified: true,
  },
]

const EMPTY_FILTERS = {
  search: '',
  location: '',
  category: '',
  minRate: '',
  maxRate: '',
  minRating: '',
  availability: '',
  verified: '',
  sortBy: '',
}

function WorkersPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [workers, setWorkers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  // Initialise filter state from URL params
  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') ?? '',
    location: searchParams.get('location') ?? '',
    category: searchParams.get('category') ?? '',
    minRate: searchParams.get('minRate') ?? '',
    maxRate: searchParams.get('maxRate') ?? '',
    minRating: searchParams.get('minRating') ?? '',
    availability: searchParams.get('availability') ?? '',
    verified: searchParams.get('verified') ?? '',
    sortBy: searchParams.get('sortBy') ?? '',
  }))

  // Sync filters → URL params
  const syncUrl = useCallback((newFilters: typeof filters) => {
    const params = new URLSearchParams()
    Object.entries(newFilters).forEach(([k, v]) => { if (v) params.set(k, v) })
    const qs = params.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}`, { scroll: false })
  }, [router, pathname])

  useEffect(() => {
    async function fetchWorkers() {
      setLoading(true)
      try {
        const fetched = await getWorkers()
        setWorkers(fetched.length > 0 ? fetched : MOCK_WORKERS)
      } catch {
        setWorkers(MOCK_WORKERS)
      } finally {
        setLoading(false)
      }
    }
    fetchWorkers()
  }, [])

  const filteredWorkers = workers.filter((worker) => {
    if (filters.search) {
      const q = filters.search.toLowerCase()
      const matchesName = worker.displayName?.toLowerCase().includes(q)
      const matchesBio = worker.bio?.toLowerCase().includes(q)
      const matchesSkill = worker.skills?.some((s) => s.toLowerCase().includes(q))
      if (!matchesName && !matchesBio && !matchesSkill) return false
    }
    if (filters.location && !worker.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.category && !worker.skills?.some((s) => s.toLowerCase().includes(filters.category.toLowerCase()))) return false
    if (filters.minRate && (worker.hourlyRate || 0) < Number(filters.minRate)) return false
    if (filters.maxRate && (worker.hourlyRate || 0) > Number(filters.maxRate)) return false
    if (filters.minRating && (worker.rating || 0) < Number(filters.minRating)) return false
    if (filters.availability && worker.availability !== filters.availability) return false
    if (filters.verified === 'verified' && !worker.verified) return false
    if (filters.verified === 'unverified' && worker.verified) return false
    return true
  })

  const sortedWorkers = [...filteredWorkers].sort((a, b) => {
    switch (filters.sortBy) {
      case 'highest_rated':
        return (b.rating ?? 0) - (a.rating ?? 0)
      case 'most_jobs':
        return (b.completedJobs ?? 0) - (a.completedJobs ?? 0)
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'rate_low':
        return (a.hourlyRate ?? 0) - (b.hourlyRate ?? 0)
      case 'rate_high':
        return (b.hourlyRate ?? 0) - (a.hourlyRate ?? 0)
      default:
        return 0
    }
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value }
      syncUrl(next)
      return next
    })
  }

  const handleFilterReset = () => {
    setFilters(EMPTY_FILTERS)
    syncUrl(EMPTY_FILTERS)
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Users className="h-6 w-6 text-primary-600" />
              Find a Tradie
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {sortedWorkers.length} skilled tradie{sortedWorkers.length !== 1 ? 's' : ''} found — browse and message any tradie directly
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-20">
                <WorkerFilters
                  filters={filters}
                  onChange={handleFilterChange}
                  onReset={handleFilterReset}
                />
              </div>
            </div>

            <div className="flex-1">
              {sortedWorkers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tradies found</h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or{' '}
                    <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                      clear all filters
                    </button>
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedWorkers.map((worker) => (
                    <WorkerCard key={worker.uid} worker={worker} />
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

export default function WorkersPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    }>
      <WorkersPageContent />
    </Suspense>
  )
}
