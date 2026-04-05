'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import WorkerCard from '@/components/workers/WorkerCard'
import WorkerFilters from '@/components/workers/WorkerFilters'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Users } from 'lucide-react'
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
    bio: 'Master plumber with 15 years of experience. Specialized in residential and commercial plumbing, pipe repair, and water heater installation.',
    location: 'New York, NY',
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
    bio: 'Licensed electrician specializing in residential wiring, panel upgrades, and smart home installations.',
    location: 'Los Angeles, CA',
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
    location: 'Chicago, IL',
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
    location: 'Houston, TX',
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
    bio: 'Licensed roofer specializing in asphalt shingles, metal roofing, and flat roof systems. Emergency repairs available.',
    location: 'Phoenix, AZ',
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
    location: 'Seattle, WA',
    skills: ['Painting', 'Interior Painting', 'Exterior Painting', 'Drywall Repair', 'Color Consultation'],
    hourlyRate: 55,
    availability: 'available',
    rating: 4.9,
    reviewCount: 78,
    completedJobs: 78,
    verified: true,
  },
]

export default function WorkersPage() {
  const [loading] = useState(false)
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    category: '',
    minRate: '',
    maxRate: '',
    minRating: '',
    availability: '',
  })

  const filteredWorkers = MOCK_WORKERS.filter((worker) => {
    if (filters.search && !worker.displayName?.toLowerCase().includes(filters.search.toLowerCase()) &&
        !worker.bio?.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.location && !worker.location?.toLowerCase().includes(filters.location.toLowerCase())) return false
    if (filters.category && !worker.skills?.some((s) => s.toLowerCase().includes(filters.category.toLowerCase()))) return false
    if (filters.minRate && (worker.hourlyRate || 0) < Number(filters.minRate)) return false
    if (filters.maxRate && (worker.hourlyRate || 0) > Number(filters.maxRate)) return false
    if (filters.minRating && (worker.rating || 0) < Number(filters.minRating)) return false
    if (filters.availability && worker.availability !== filters.availability) return false
    return true
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleFilterReset = () => {
    setFilters({ search: '', location: '', category: '', minRate: '', maxRate: '', minRating: '', availability: '' })
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
              Find Workers
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {filteredWorkers.length} skilled worker{filteredWorkers.length !== 1 ? 's' : ''} available
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
              {filteredWorkers.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No workers found</h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or{' '}
                    <button onClick={handleFilterReset} className="text-primary-600 hover:underline">
                      clear all filters
                    </button>
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredWorkers.map((worker) => (
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
