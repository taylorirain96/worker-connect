'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Link from 'next/link'
import { AlertCircle, Sparkles, Search } from 'lucide-react'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Application, DetailedReview } from '@/types'
import { getWorkerReviews, respondToReview } from '@/lib/reviews/index'
import { getWorkerActivePlacement, type Placement } from '@/lib/placements/firebase'
import toast from 'react-hot-toast'
import JobsForYouFeed from '@/components/jobs/JobsForYouFeed'
import WorkerOnboardingChecklist from '@/components/workers/WorkerOnboardingChecklist'
import CrossHatCTA from '@/components/profiles/CrossHatCTA'
import WalletSummaryCard from '@/components/profiles/WalletSummaryCard'
import TrustBadgeNudge from '@/components/profiles/TrustBadgeNudge'
import WorkerDashboardHeader from '@/components/dashboard/WorkerDashboardHeader'
import WorkerStatsOverview from '@/components/dashboard/WorkerStatsOverview'
import ActivePlacementCard from '@/components/dashboard/ActivePlacementCard'
import WorkerJobAlerts from '@/components/dashboard/WorkerJobAlerts'
import WorkerRecentApplications from '@/components/dashboard/WorkerRecentApplications'
import WorkerReviewsReceived from '@/components/dashboard/WorkerReviewsReceived'
import WorkerSidebar from '@/components/dashboard/WorkerSidebar'

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

interface DisputedWorkerJob {
  id: string
  title: string
  lastModified: string
}

interface AwaitingPaymentJob {
  id: string
  title: string
  budget: number
  updatedAt: string
}

interface ReviewableJob {
  id: string
  title: string
  completedAt: string
}

function toISO(v: unknown): string {
  if (v && typeof v === 'object' && 'toDate' in v) {
    return (v as { toDate: () => Date }).toDate().toISOString()
  }
  return typeof v === 'string' ? v : new Date().toISOString()
}

function docToApplication(id: string, data: DocumentData): Application {
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
  const [placement, setPlacement] = useState<Placement | null>(null)
  const [placementConfirmed, setPlacementConfirmed] = useState(false)
  const [placementEnded, setPlacementEnded] = useState(false)
  const [confirmingPlacement, setConfirmingPlacement] = useState(false)
  const [disputedJobs, setDisputedJobs] = useState<DisputedWorkerJob[]>([])
  const [awaitingPaymentJobs, setAwaitingPaymentJobs] = useState<AwaitingPaymentJob[]>([])
  const [reviewableJobs, setReviewableJobs] = useState<ReviewableJob[]>([])

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

  useEffect(() => {
    if (!user?.uid || !db) return
    async function fetchAwaitingPayment() {
      try {
        const jobsRef = collection(db!, 'jobs')
        const q = query(
          jobsRef,
          where('assignedWorkerId', '==', user!.uid),
          where('status', '==', 'in_progress'),
          orderBy('updatedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        setAwaitingPaymentJobs(
          snapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title ?? 'Untitled job',
            budget: d.data().budget ?? 0,
            updatedAt: toISO(d.data().updatedAt ?? d.data().createdAt),
          }))
        )
      } catch {
        setAwaitingPaymentJobs([])
      }
    }
    fetchAwaitingPayment()
  }, [user])

  useEffect(() => {
    if (!user?.uid || !db) return
    async function fetchDisputedJobs() {
      try {
        const jobsRef = collection(db!, 'jobs')
        const q = query(
          jobsRef,
          where('assignedWorkerId', '==', user!.uid),
          where('status', '==', 'disputed'),
          orderBy('updatedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        setDisputedJobs(
          snapshot.docs.map((d) => ({
            id: d.id,
            title: d.data().title ?? 'Untitled job',
            lastModified: toISO(d.data().updatedAt ?? d.data().createdAt),
          }))
        )
      } catch {
        setDisputedJobs([])
      }
    }
    fetchDisputedJobs()
  }, [user])

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

  useEffect(() => {
    if (!user?.uid || !db) return
    const firestore = db
    const workerId = user.uid
    async function fetchReviewableJobs() {
      try {
        const jobsRef = collection(firestore, 'jobs')
        const q = query(
          jobsRef,
          where('assignedWorkerId', '==', workerId),
          where('status', '==', 'completed'),
          orderBy('completedAt', 'desc')
        )
        const snapshot = await getDocs(q)
        setReviewableJobs(
          snapshot.docs
            .filter((d) => !d.data().workerReviewLeft)
            .map((d) => ({
              id: d.id,
              title: d.data().title ?? 'Untitled job',
              completedAt: toISO(d.data().completedAt ?? d.data().updatedAt ?? d.data().createdAt),
            }))
        )
      } catch {
        setReviewableJobs([])
      }
    }
    fetchReviewableJobs()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    getWorkerActivePlacement(user.uid)
      .then((p) => setPlacement(p))
      .catch(() => setPlacement(null))
  }, [user])

  const confirmEmployment = async (stillEmployed: boolean) => {
    if (!placement) return
    setConfirmingPlacement(true)
    try {
      const res = await fetch('/api/placements/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placementId: placement.id,
          confirmedBy: 'worker',
          stillEmployed,
        }),
      })
      if (!res.ok) throw new Error('Request failed')
      if (stillEmployed) {
        setPlacementConfirmed(true)
        toast.success('Great! Thanks for confirming. 👍')
      } else {
        setPlacementEnded(true)
        setPlacement(null)
        toast.success('Got it! Welcome back — let\'s find your next job.')
      }
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setConfirmingPlacement(false)
    }
  }

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

  const firstName = profile?.displayName?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'Worker'

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorkerDashboardHeader firstName={firstName} profile={profile} />

          {/* Low rating warning */}
          {(profile?.rating ?? 0) > 0 && (profile?.rating ?? 0) < 3.5 && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-800 dark:text-amber-300">Your rating is low — tips to improve</p>
                  <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                    Your current rating is <strong>{profile?.rating?.toFixed(1)}</strong>. Here are some ways to improve it:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-amber-700 dark:text-amber-400 list-disc list-inside">
                    <li>Respond to messages promptly and professionally</li>
                    <li>Arrive on time and complete work to a high standard</li>
                    <li>Communicate clearly about timelines and any issues</li>
                    <li>Follow up after the job to ensure the client is happy</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Active Placement Check-in */}
          {placement && (
            <ActivePlacementCard
              placement={placement}
              placementConfirmed={placementConfirmed}
              confirmingPlacement={confirmingPlacement}
              onConfirm={confirmEmployment}
            />
          )}

          {/* Re-engagement message shown after worker says they've moved on */}
          {placementEnded && (
            <div className="bg-emerald-900/30 border border-emerald-500/50 rounded-xl p-5 mb-6">
              <h3 className="font-semibold text-white mb-1">Welcome back! Here are jobs matching your skills 👇</h3>
              <p className="text-sm text-emerald-300 mb-4">Your profile is still live and employers can find you right now.</p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors"
              >
                <Search className="h-4 w-4" />
                Find My Next Job →
              </Link>
            </div>
          )}

          {/* Onboarding checklist */}
          {profile && <WorkerOnboardingChecklist profile={profile} />}

          {/* Ecosystem: wallet, trust-badge, cross-promo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            <WalletSummaryCard />
            <CrossHatCTA />
          </div>
          <div className="mb-6">
            <TrustBadgeNudge />
          </div>

          <WorkerStatsOverview applications={applications} profile={profile} />

          <WorkerJobAlerts awaitingPaymentJobs={awaitingPaymentJobs} disputedJobs={disputedJobs} />

          {/* Jobs For You */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  <CardTitle>Jobs For You</CardTitle>
                  <span className="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">AI-powered</span>
                </div>
                <Link href="/jobs?tab=for-you" className="text-sm text-primary-600 hover:text-primary-700">
                  See all matches →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <JobsForYouFeed limit={3} />
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <WorkerRecentApplications
                applications={applications}
                loadingApps={loadingApps}
                reviewableJobs={reviewableJobs}
                workerId={user.uid}
              />
              <WorkerReviewsReceived
                reviews={reviews}
                loadingReviews={loadingReviews}
                respondingId={respondingId}
                responseText={responseText}
                submittingResponse={submittingResponse}
                onStartResponse={handleStartResponse}
                onCancelResponse={handleCancelResponse}
                onChangeResponse={setResponseText}
                onSubmitResponse={handleSubmitResponse}
              />
            </div>
            <WorkerSidebar
              profile={profile}
              photoURL={user.photoURL}
              uid={user.uid}
              pendingApplicationsCount={applications.filter((a) => a.status === 'pending').length}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
