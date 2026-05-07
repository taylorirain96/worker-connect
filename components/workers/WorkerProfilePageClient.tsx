'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import {
  ArrowLeft,
  Award,
  Briefcase,
  Building2,
  Calendar,
  CalendarDays,
  Camera,
  CheckCircle,
  DollarSign,
  Hash,
  MapPin,
  MessageSquare,
  Package,
  Star,
  Video,
} from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { WorkerPublicProfileData } from '@/lib/workers/publicProfile'
import { TRADE_LICENCE_LABELS } from '@/types'
import { getReviewAggregates } from '@/lib/reviews/firebase'
import ReviewSummary from '@/components/reviews/ReviewSummary'
import { useAuth } from '@/components/providers/AuthProvider'
import { getOrCreateConversation } from '@/lib/messaging'
import toast from 'react-hot-toast'
import FavouriteButton from '@/components/workers/FavouriteButton'
import VideoProfilePlayer from '@/components/workers/VideoProfilePlayer'
import PortfolioGallery from '@/components/portfolio/PortfolioGallery'
import ServicePackageCard from '@/components/servicePackages/ServicePackageCard'
import { absoluteUrl } from '@/lib/seo/config'

interface WorkerProfilePageClientProps {
  workerId: string
  initialData: WorkerPublicProfileData
}

export default function WorkerProfilePageClient({
  workerId,
  initialData,
}: WorkerProfilePageClientProps) {
  const router = useRouter()
  const { user, profile: currentProfile } = useAuth()
  const [worker, setWorker] = useState(initialData.worker)
  const [reviewAgg, setReviewAgg] = useState(initialData.reviewAgg)
  const [messaging, setMessaging] = useState(false)
  const [hasAvailability, setHasAvailability] = useState(initialData.hasAvailability)
  const [portfolio, setPortfolio] = useState(initialData.portfolio)
  const [servicePackages, setServicePackages] = useState(initialData.servicePackages)
  const [tradeLicences, setTradeLicences] = useState(initialData.tradeLicences)

  useEffect(() => {
    setWorker(initialData.worker)
    setReviewAgg(initialData.reviewAgg)
    setHasAvailability(initialData.hasAvailability)
    setPortfolio(initialData.portfolio)
    setServicePackages(initialData.servicePackages)
    setTradeLicences(initialData.tradeLicences)
  }, [initialData])

  useEffect(() => {
    let cancelled = false

    async function refreshProfileData() {
      try {
        const [agg, availabilityRes, portfolioRes, servicePackagesRes, tradeLicencesRes] =
          await Promise.all([
            getReviewAggregates(workerId),
            fetch(`/api/availability/${workerId}`),
            fetch(`/api/portfolio?uid=${workerId}`),
            fetch(`/api/service-packages?workerId=${workerId}`),
            fetch(`/api/worker-trade-licences?uid=${workerId}`),
          ])

        if (cancelled) return

        setReviewAgg(agg)

        if (availabilityRes.ok) {
          const availabilityData = (await availabilityRes.json()) as {
            availability?: Record<string, { available?: boolean }>
          }
          if (availabilityData.availability) {
            const days = [
              'monday',
              'tuesday',
              'wednesday',
              'thursday',
              'friday',
              'saturday',
              'sunday',
            ] as const
            setHasAvailability(days.some((day) => availabilityData.availability?.[day]?.available))
          }
        }

        if (portfolioRes.ok) {
          const portfolioData = (await portfolioRes.json()) as { photos?: typeof initialData.portfolio }
          if (portfolioData.photos) setPortfolio(portfolioData.photos)
        }

        if (servicePackagesRes.ok) {
          const packageData = (await servicePackagesRes.json()) as {
            packages?: typeof initialData.servicePackages
          }
          if (packageData.packages) setServicePackages(packageData.packages)
        }

        if (tradeLicencesRes.ok) {
          const licencesData = (await tradeLicencesRes.json()) as {
            licences?: typeof initialData.tradeLicences
          }
          if (licencesData.licences) setTradeLicences(licencesData.licences)
        }
      } catch {
        // Keep server-rendered data if the client refresh fails.
      }
    }

    refreshProfileData()

    return () => {
      cancelled = true
    }
  }, [workerId, initialData])

  const workerJsonLd = useMemo(() => {
    const person: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: worker.displayName ?? 'QuickTrade worker',
      description: worker.bio ?? undefined,
      url: absoluteUrl(`/workers/${worker.uid}`),
      image: worker.photoURL ?? undefined,
      knowsAbout: worker.skills?.length ? worker.skills : undefined,
      address: worker.location
        ? {
            '@type': 'PostalAddress',
            addressLocality: worker.location,
            addressCountry: worker.country ?? 'NZ',
          }
        : undefined,
    }

    if (reviewAgg && reviewAgg.totalReviews > 0) {
      person.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: reviewAgg.averageRating,
        reviewCount: reviewAgg.totalReviews,
        bestRating: 5,
        worstRating: 1,
      }
    }

    if (tradeLicences.length > 0) {
      person.hasCredential = tradeLicences.map((licence) => ({
        '@type': 'EducationalOccupationalCredential',
        credentialCategory:
          TRADE_LICENCE_LABELS[licence.licenceType] ?? TRADE_LICENCE_LABELS.other,
        recognizedBy: licence.issuingBody
          ? {
              '@type': 'Organization',
              name: licence.issuingBody,
            }
          : undefined,
      }))
    }

    return person
  }, [reviewAgg, tradeLicences, worker])

  const breadcrumbJsonLd = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
        { '@type': 'ListItem', position: 2, name: 'Find a Tradie', item: absoluteUrl('/workers') },
        {
          '@type': 'ListItem',
          position: 3,
          name: worker.displayName ?? 'Worker profile',
          item: absoluteUrl(`/workers/${worker.uid}`),
        },
      ],
    }),
    [worker.displayName, worker.uid],
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Script
        id="jsonld-worker-profile"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(workerJsonLd) }}
      />
      <Script
        id="jsonld-worker-breadcrumb"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Navbar />
      <main className="flex-1">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Workers
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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
                        priority
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
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {worker.displayName}
                      </h1>
                      {worker.verified && (
                        <CheckCircle
                          className="h-5 w-5 text-blue-500"
                          aria-label="Verified Professional"
                        />
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
                          ({reviewAgg?.totalReviews ?? worker.reviewCount ?? 0} reviews)
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
                      {servicePackages.length > 0 && (
                        <Badge variant="default">
                          <Package className="h-3 w-3" />
                          {servicePackages.length} package{servicePackages.length !== 1 ? 's' : ''}
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
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-2">About</h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {worker.bio}
                    </p>
                  </div>
                )}
              </div>

              {worker.skills && worker.skills.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Skills &amp; Expertise
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {worker.skills.map((skill) => (
                      <span
                        key={skill}
                        className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-3 py-1.5 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {worker.videoProfileUrl && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Video className="h-4 w-4 text-violet-500" />
                    Video Profile
                  </h2>
                  <VideoProfilePlayer
                    videoProfileUrl={worker.videoProfileUrl}
                    workerName={worker.displayName ?? undefined}
                  />
                </div>
              )}

              {portfolio.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Portfolio
                    <span className="ml-2 text-sm font-normal text-gray-400">
                      {portfolio.length} photo{portfolio.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <PortfolioGallery
                    photos={portfolio}
                    limit={6}
                    viewAllHref={portfolio.length > 6 ? `/workers/${workerId}/portfolio` : undefined}
                  />
                </div>
              )}

              {servicePackages.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Package className="h-4 w-4 text-primary-500" />
                    Service Packages
                    <span className="ml-1 text-sm font-normal text-gray-400">
                      {servicePackages.length} fixed-price package
                      {servicePackages.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {servicePackages.map((pkg) => (
                      <ServicePackageCard key={pkg.id} pkg={pkg} />
                    ))}
                  </div>
                </div>
              )}

              {tradeLicences.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Award className="h-4 w-4 text-indigo-500" />
                    Trade Licences &amp; Certifications
                    <span className="ml-1 text-sm font-normal text-gray-400">
                      {tradeLicences.length} credential{tradeLicences.length !== 1 ? 's' : ''}
                    </span>
                  </h2>
                  <div className="space-y-3">
                    {tradeLicences.map((licence) => {
                      const expired = licence.expiryDate
                        ? new Date(licence.expiryDate) < new Date()
                        : false
                      return (
                        <div
                          key={licence.id}
                          className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        >
                          <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                            <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 dark:text-white text-sm">
                                {TRADE_LICENCE_LABELS[licence.licenceType] ??
                                  TRADE_LICENCE_LABELS.other}
                              </p>
                              {expired ? (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                  Expired
                                </span>
                              ) : licence.expiryDate ? (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                  Active
                                </span>
                              ) : null}
                            </div>
                            <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-gray-500 dark:text-gray-400">
                              {licence.licenceNumber && (
                                <span className="flex items-center gap-1">
                                  <Hash className="h-3 w-3" />
                                  {licence.licenceNumber}
                                </span>
                              )}
                              {licence.issuingBody && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="h-3 w-3" />
                                  {licence.issuingBody}
                                </span>
                              )}
                              {licence.expiryDate && (
                                <span
                                  className={`flex items-center gap-1 ${expired ? 'text-red-500 dark:text-red-400' : ''}`}
                                >
                                  <CalendarDays className="h-3 w-3" />
                                  {expired ? 'Expired' : 'Expires'}{' '}
                                  {new Date(licence.expiryDate).toLocaleDateString('en-NZ', {
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <ReviewSummary entityId={workerId} profileId={workerId} />
              </div>
            </div>

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
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      Save to favourites
                    </span>
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                <h2 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">Stats</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jobs Completed</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {worker.completedJobs ?? 0}
                    </span>
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
