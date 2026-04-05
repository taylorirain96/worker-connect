'use client'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { MapPin, Star, CheckCircle, Briefcase, DollarSign, ArrowLeft, MessageSquare, Calendar } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { UserProfile } from '@/types'
import Link from 'next/link'

const MOCK_WORKERS: Record<string, UserProfile & { skills: string[]; portfolio?: { title: string; description: string; image?: string }[] }> = {
  w1: {
    uid: 'w1',
    email: 'mike@example.com',
    displayName: 'Mike Johnson',
    photoURL: null,
    role: 'worker',
    createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
    profileComplete: true,
    bio: 'Master plumber with 15 years of experience. Specialized in residential and commercial plumbing, pipe repair, and water heater installation. Fully licensed and insured in New York State.',
    location: 'New York, NY',
    skills: ['Plumbing', 'Pipe Repair', 'Water Heater', 'Drain Cleaning', 'Fixture Installation', 'Leak Detection'],
    hourlyRate: 85,
    availability: 'available',
    rating: 4.9,
    reviewCount: 87,
    completedJobs: 87,
    verified: true,
    portfolio: [
      { title: 'Bathroom Renovation', description: 'Complete bathroom plumbing overhaul for a 3-bedroom house.' },
      { title: 'Commercial Kitchen Install', description: 'Industrial plumbing setup for restaurant kitchen.' },
    ],
  },
}

const MOCK_REVIEWS = [
  { id: '1', reviewerName: 'John S.', rating: 5, comment: 'Mike was fantastic! Fixed our leak quickly and professionally. Highly recommend.', createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '2', reviewerName: 'Amy K.', rating: 5, comment: 'Excellent work on our bathroom renovation. Clean, efficient, and very knowledgeable.', createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() },
  { id: '3', reviewerName: 'Robert M.', rating: 4, comment: 'Good work, arrived on time. Minor issue with cleanup but overall satisfied.', createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
]

export default function WorkerProfilePage() {
  const params = useParams()
  const router = useRouter()
  const worker = MOCK_WORKERS[params.id as string] || MOCK_WORKERS['w1']

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Workers
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-start gap-5">
                  <div className="relative flex-shrink-0">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                      {getInitials(worker.displayName || 'W')}
                    </div>
                    {worker.availability === 'available' && (
                      <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{worker.displayName}</h1>
                      {worker.verified && (
                        <CheckCircle className="h-5 w-5 text-blue-500" aria-label="Verified Professional" />
                      )}
                    </div>
                    {worker.location && (
                      <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                        <MapPin className="h-4 w-4" />
                        {worker.location}
                      </div>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">{worker.rating?.toFixed(1)}</span>
                        <span className="text-gray-500">({worker.reviewCount} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Briefcase className="h-4 w-4" />
                        {worker.completedJobs} completed
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={worker.availability === 'available' ? 'success' : 'warning'}>
                        {worker.availability === 'available' ? '✓ Available Now' : 'Currently Busy'}
                      </Badge>
                      {worker.verified && <Badge variant="info">Verified Pro</Badge>}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="flex items-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      {worker.hourlyRate}
                    </div>
                    <p className="text-sm text-gray-500">per hour</p>
                  </div>
                </div>

                {worker.bio && (
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{worker.bio}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Skills & Expertise</h2>
                <div className="flex flex-wrap gap-2">
                  {worker.skills?.map((skill) => (
                    <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Reviews ({worker.reviewCount})</h2>
                <div className="space-y-4">
                  {MOCK_REVIEWS.map((review) => (
                    <div key={review.id} className="pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{review.reviewerName}</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3.5 w-3.5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <Button className="w-full mb-3" onClick={() => router.push('/messages')}>
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="h-4 w-4" />
                  Request Quote
                </Button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jobs Completed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{worker.completedJobs}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Rating</span>
                    <span className="font-medium text-gray-900 dark:text-white">{worker.rating?.toFixed(1)} ★</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member Since</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(worker.createdAt).getFullYear()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
