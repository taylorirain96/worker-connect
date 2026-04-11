'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import RatingStars from '@/components/reviews/RatingStars'
import Link from 'next/link'
import {
  Briefcase, DollarSign, Star, Clock, TrendingUp,
  CheckCircle, AlertCircle, Search, Settings, FileText, MessageSquare, Send
} from 'lucide-react'
import { formatCurrency, STATUS_LABELS, formatRelativeDate } from '@/lib/utils'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Application, DetailedReview } from '@/types'
import { getWorkerReviews, respondToReview } from '@/lib/reviews/index'
import toast from 'react-hot-toast'

const MAX_DISPLAYED_REVIEWS = 10

interface RecentApplication {
  id: string
  title: string
  employer: string
  status: string
  appliedAt: string
  budget: number
  budgetType: 'fixed' | 'hourly'
}

function docToApplication(id: string, data: DocumentData): Application {
  const toISO = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : typeof v === 'string'
      ? v
      : new Date().toISOString()
  return { ...data, id, createdAt: toISO(data.createdAt), updatedAt: toISO(data.updatedAt) } as Application
}

export default function WorkerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [applications, setApplications] = useState<RecentApplication[]>([])
  const [loadingApps, setLoadingApps] = useState(true)
  const [reviews, setReviews] = useState<DetailedReview[]>([])
  const [loadingReviews, setLoadingReviews] = useState(true)
  const [respondingId, setRespondingId] = useState<string | null>(null)
  const [responseText, setResponseText] = useState('')
  const [submittingResponse, setSubmittingResponse] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid || !db) {
      setLoadingApps(false)
      return
    }
    async function fetchApplications() {
      try {
        const appsRef = collection(db!, 'applications')
        const q = query(appsRef, where('workerId', '==', user!.uid), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const apps = snapshot.docs.map((d) => docToApplication(d.id, d.data()))
        setApplications(
          apps.slice(0, 5).map((a) => ({
            id: a.id,
            title: a.jobTitle,
            employer: a.employerId,
            status: a.status,
            appliedAt: a.createdAt,
            budget: a.proposedRate,
            budgetType: 'fixed' as const,
          }))
        )
      } catch {
        setApplications([])
      } finally {
        setLoadingApps(false)
      }
    }
    fetchApplications()
  }, [user])

  // Fetch reviews received by this worker
  useEffect(() => {
    if (!user?.uid) {
      setLoadingReviews(false)
      return
    }
    getWorkerReviews(user.uid)
      .then((fetched) => setReviews(fetched.slice(0, MAX_DISPLAYED_REVIEWS)))
      .catch(() => setReviews([]))
      .finally(() => setLoadingReviews(false))
  }, [user])

  const handleSubmitResponse = async (reviewId: string) => {
    if (!user || !profile) return
    if (!responseText.trim()) {
      toast.error('Response cannot be empty')
      return
    }
    setSubmittingResponse(true)
    try {
      await respondToReview(
        reviewId,
        user.uid,
        profile.displayName ?? user.displayName ?? 'Worker',
        responseText
      )
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? {
                ...r,
                response: {
                  // Use a client-generated temp ID for the optimistic update;
                  // the real ID lives server-side inside the review document.
                  id: `${reviewId}_response`,
                  reviewId,
                  authorId: user.uid,
                  authorName: profile.displayName ?? user.displayName ?? 'Worker',
                  text: responseText,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              }
            : r
        )
      )
      setRespondingId(null)
      setResponseText('')
      toast.success('Response posted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post response')
    } finally {
      setSubmittingResponse(false)
    }
  }

  const handleStartResponse = (reviewId: string) => {
    setRespondingId(reviewId)
    setResponseText('')
  }

  const handleCancelResponse = () => {
    setRespondingId(null)
    setResponseText('')
  }

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  const totalApplied = applications.length
  const activeJobs = applications.filter((a) => a.status === 'accepted').length
  const completedJobs = profile?.completedJobs ?? 0
  const totalEarned = profile?.totalEarnings ?? 0

  const stats = [
    { label: 'Jobs Applied', value: String(totalApplied), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: String(activeJobs), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Completed', value: String(completedJobs), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Worker'}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {profile?.availability === 'available' ? '🟢 You are visible to employers' : '🔴 Update your availability to get more jobs'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/settings/profile">
                <Button variant="outline" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Edit Profile
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Analytics
                </Button>
              </Link>
              <Link href="/jobs">
                <Button className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  Find Jobs
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Applied Jobs */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Applications</CardTitle>
                    <Link href="/dashboard/worker/applications" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingApps ? (
                    <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No applications yet</p>
                      <Link href="/jobs">
                        <Button variant="outline" size="sm" className="mt-3">Browse Jobs</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.map((app) => {
                        const status = STATUS_LABELS[app.status]
                        return (
                          <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{app.title}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(app.budget)} · {formatRelativeDate(app.appliedAt)}</p>
                            </div>
                            <Badge
                              variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                            >
                              {status?.label ?? app.status}
                            </Badge>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reviews Received */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                    <CardTitle>Reviews Received</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {loadingReviews ? (
                    <div className="space-y-3">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      ))}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-6">
                      <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No reviews yet</p>
                      <p className="text-xs text-gray-400 mt-1">Complete jobs to start receiving reviews.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((review) => (
                        <div key={review.id} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {review.isAnonymous ? 'Anonymous' : review.reviewerName}
                              </p>
                              <p className="text-xs text-gray-500">{review.jobTitle} · {formatRelativeDate(review.createdAt)}</p>
                            </div>
                            <RatingStars rating={review.rating} size="sm" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>

                          {/* Existing response */}
                          {review.response && (
                            <div className="mt-3 pl-3 border-l-2 border-primary-200 dark:border-primary-800">
                              <p className="text-xs font-medium text-primary-700 dark:text-primary-400 mb-1">Your response:</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">{review.response.text}</p>
                            </div>
                          )}

                          {/* Respond button / form */}
                          {!review.response && respondingId !== review.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => handleStartResponse(review.id)}
                            >
                              <MessageSquare className="h-3.5 w-3.5" />
                              Respond
                            </Button>
                          )}

                          {!review.response && respondingId === review.id && (
                            <div className="mt-3 space-y-2">
                              <textarea
                                rows={3}
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Write your response..."
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCancelResponse}
                                >
                                  Cancel
                                </Button>
                                <Button
                                  size="sm"
                                  loading={submittingResponse}
                                  onClick={() => handleSubmitResponse(review.id)}
                                >
                                  <Send className="h-3.5 w-3.5" />
                                  Post Response
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Completion & Quick Stats */}
            <div className="space-y-4">
              {/* Profile Completion */}
              <Card>
                <CardHeader>
                  <CardTitle>Profile Strength</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Profile Photo', done: !!user?.photoURL },
                      { label: 'Bio Added', done: !!profile?.bio },
                      { label: 'Skills Listed', done: (profile?.skills?.length || 0) > 0 },
                      { label: 'Hourly Rate Set', done: !!profile?.hourlyRate },
                      { label: 'Location Added', done: !!profile?.location },
                    ].map(({ label, done }) => (
                      <div key={label} className="flex items-center gap-2 text-sm">
                        {done ? (
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                        )}
                        <span className={done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm" className="w-full mt-4">Complete Profile</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Rating */}
              {(profile?.rating ?? 0) > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>Your rating: <strong className="text-gray-900 dark:text-white">{profile?.rating?.toFixed(1)}</strong> ({profile?.reviewCount ?? 0} reviews)</span>
                </div>
              )}

              {/* Earnings link */}
              <Link href="/earnings">
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    View Earnings & Withdraw
                  </div>
                  <span className="text-xs text-primary-600">→</span>
                </div>
              </Link>

              {/* My Applications link */}
              <Link href="/dashboard/worker/applications">
                <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
                  <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <FileText className="h-4 w-4 text-primary-600" />
                    My Applications
                    {applications.filter((a) => a.status === 'pending').length > 0 && (
                      <span className="ml-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                        {applications.filter((a) => a.status === 'pending').length} pending
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-primary-600">→</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

