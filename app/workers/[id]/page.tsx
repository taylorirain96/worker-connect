'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { MapPin, Star, CheckCircle, Briefcase, DollarSign, ArrowLeft, MessageSquare, Calendar, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { UserProfile, ReviewAggregates, PortfolioPhoto } from '@/types'
import Link from 'next/link'
import { getUserProfile } from '@/lib/users/getProfile'
import ReviewSummary from '@/components/reviews/ReviewSummary'
import { getReviewAggregates } from '@/lib/reviews/firebase'
import { useAuth } from '@/components/providers/AuthProvider'
import { getOrCreateConversation } from '@/lib/messaging'
import toast from 'react-hot-toast'
import FavouriteButton from '@/components/workers/FavouriteButton'
import PortfolioGallery from '@/components/portfolio/PortfolioGallery'

export default function WorkerProfilePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, profile: currentProfile } = useAuth()
  const [worker, setWorker] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [reviewAgg, setReviewAgg] = useState<ReviewAggregates | null>(null)
  const [messaging, setMessaging] = useState(false)
  const [hasAvailability, setHasAvailability] = useState(false)
  const [portfolio, setPortfolio] = useState<PortfolioPhoto[]>([])

  useEffect(() => {
    async function fetchWorker() {
      setLoading(true)
      const [profile, agg] = await Promise.all([
        getUserProfile(params.id),
        getReviewAggregates(params.id),
      ])
      if (!profile || profile.role !== 'worker') {
        setNotFound(true)
      } else {
        setWorker(profile)
        // Check if worker has set availability
        fetch(`/api/availability/${params.id}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.availability) {
              const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
              const hasAny = days.some((d) => data.availability[d]?.available)
              setHasAvailability(hasAny)
            }
          })
          .catch(() => {})
        // Fetch portfolio
        fetch(`/api/portfolio?uid=${params.id}`)
          .then((r) => r.json())
          .then((data: { photos?: PortfolioPhoto[] }) => {
            if (data.photos) setPortfolio(data.photos)
          })
          .catch(() => {})
      }
      setReviewAgg(agg)
      setLoading(false)
    }
    fetchWorker()
  }, [params.id])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-start gap-5">
                      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700" />
                      <div className="flex-1 space-y-3">
                        <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                        <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                      </div>
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

  if (notFound || !worker) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Workers
            </Link>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Worker not found</p>
              <p className="text-gray-500 text-sm">This worker profile does not exist or has been removed.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {reviewAgg && reviewAgg.totalReviews > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: worker.displayName ?? 'Worker',
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: reviewAgg.averageRating,
                reviewCount: reviewAgg.totalReviews,
                bestRating: 5,
                worstRating: 1,
              },
            }),
          }}
        />
      )}
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
                    {worker.photoURL ? (
                      <Image
                        src={worker.photoURL}
                        alt={worker.displayName ?? 'Worker'}
                        width={80}
                        height={80}
                        className="h-20 w-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                        {getInitials(worker.displayName || 'W')}
                      </div>
                    )}
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
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {(reviewAgg?.averageRating ?? worker.rating)?.toFixed(1) ?? '-'}
                        </span>
                        <span className="text-gray-500">
                          ({(reviewAgg?.totalReviews ?? worker.reviewCount ?? 0)} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500">
                        <Briefcase className="h-4 w-4" />
                        {worker.completedJobs ?? 0} completed
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <Badge variant={worker.availability === 'available' ? 'success' : 'warning'}>
                        {worker.availability === 'available' ? '✓ Available Now' : 'Currently Busy'}
                      </Badge>
                      {worker.verified && <Badge variant="info">Verified Pro</Badge>}
                      {portfolio.length > 0 && (
                        <Badge variant="default">
                          <Camera className="h-3 w-3" />
                          {portfolio.length} project{portfolio.length !== 1 ? 's' : ''}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {worker.hourlyRate != null && (
                    <div className="text-right flex-shrink-0">
                      <div className="flex items-center gap-1 text-2xl font-bold text-gray-900 dark:text-white">
                        <DollarSign className="h-5 w-5 text-green-500" />
                        {worker.hourlyRate}
                      </div>
                      <p className="text-sm text-gray-500">per hour</p>
                    </div>
                  )}
                </div>

                {worker.bio && (
                  <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">About</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{worker.bio}</p>
                  </div>
                )}
              </div>

              {/* Skills */}
              {worker.skills && worker.skills.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Skills & Expertise</h2>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill) => (
                      <span key={skill} className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Portfolio */}
              {portfolio.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Portfolio
                    <span className="ml-2 text-sm font-normal text-gray-400">{portfolio.length} photo{portfolio.length !== 1 ? 's' : ''}</span>
                  </h2>
                  <PortfolioGallery
                    photos={portfolio}
                    limit={6}
                    viewAllHref={portfolio.length > 6 ? `/workers/${params.id}/portfolio` : undefined}
                  />
                </div>
              )}

              {/* Reviews */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <ReviewSummary entityId={params.id} profileId={params.id} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <Button
                  className="w-full mb-3"
                  disabled={messaging || user?.uid === worker.uid}
                  onClick={async () => {
                    if (!user) {
                      router.push(`/auth/login?redirect=/workers/${worker.uid}`)
                      return
                    }
                    setMessaging(true)
                    try {
                      const convId = await getOrCreateConversation(
                        user.uid,
                        currentProfile?.displayName || user.displayName || user.email || 'User',
                        currentProfile?.photoURL ?? user.photoURL ?? null,
                        worker.uid,
                        worker.displayName || 'Worker',
                        worker.photoURL ?? null,
                      )
                      router.push(`/messages/${convId}`)
                    } catch (err) {
                      console.error('Failed to open conversation:', err)
                      toast.error('Could not open conversation. Please try again.')
                    } finally {
                      setMessaging(false)
                    }
                  }}
                >
                  <MessageSquare className="h-4 w-4" />
                  {messaging ? 'Opening…' : 'Send Message'}
                </Button>
                {hasAvailability && user?.uid !== worker.uid && (
                  <Link href={`/workers/${worker.uid}/book`} className="block mb-3">
                    <Button variant="secondary" className="w-full">
                      <Calendar className="h-4 w-4" />
                      Check Availability &amp; Book
                    </Button>
                  </Link>
                )}
                <Button variant="outline" className="w-full mb-3">
                  <Calendar className="h-4 w-4" />
                  Request Quote
                </Button>
                {user && user.uid !== worker.uid && currentProfile?.role === 'homeowner' && (
                  <div className="flex items-center justify-center pt-1">
                    <FavouriteButton
                      workerId={worker.uid}
                      initialFavourited={currentProfile?.favourites?.includes(worker.uid) ?? false}
                      size="md"
                    />
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Save to favourites</span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Stats</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jobs Completed</span>
                    <span className="font-medium text-gray-900 dark:text-white">{worker.completedJobs ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Avg Rating</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {(reviewAgg?.averageRating ?? worker.rating)?.toFixed(1) ?? '-'} ★
                    </span>
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
