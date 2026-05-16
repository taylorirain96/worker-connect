'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { getUserProfile } from '@/lib/users/getProfile'
import toast from 'react-hot-toast'
import {
  ArrowLeft,
  CheckCircle,
  DollarSign,
  User,
  Briefcase,
  AlertCircle,
  Star,
  Loader2,
} from 'lucide-react'
import type { Job, UserProfile } from '@/types'

function formatNZD(amount: number): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatDisputeDeadline(dateString: string): string {
  return new Date(dateString).toLocaleString('en-NZ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function JobCompletePage() {
  const params = useParams()
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const jobId = params.jobId as string

  const [job, setJob] = useState<Job | null>(null)
  const [worker, setWorker] = useState<UserProfile | null>(null)
  const [loadingJob, setLoadingJob] = useState(true)
  const [jobError, setJobError] = useState<string | null>(null)
  const [marking, setMarking] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [completedAt, setCompletedAt] = useState<string | null>(null)
  const [disputeDeadline, setDisputeDeadline] = useState<string | null>(null)

  // Load job from Firestore
  useEffect(() => {
    if (!jobId || !db) {
      setLoadingJob(false)
      return
    }
    const firestore = db
    async function fetchJob() {
      try {
        const snap = await getDoc(doc(firestore, 'jobs', jobId))
        if (snap.exists()) {
          setJob({ id: snap.id, ...snap.data() } as Job)
        } else {
          setJobError('Job not found.')
        }
      } catch (err) {
        console.error('Failed to load job:', err)
        setJobError('Unable to load job details. Please try again.')
      } finally {
        setLoadingJob(false)
      }
    }
    fetchJob()
  }, [jobId])

  // Load assigned worker's profile
  useEffect(() => {
    if (!job?.assignedWorkerId) return
    getUserProfile(job.assignedWorkerId)
      .then((p) => setWorker(p))
      .catch(() => {})
  }, [job?.assignedWorkerId])

  const handleMarkComplete = async () => {
    if (!user) {
      toast.error('Please sign in to continue.')
      return
    }

    setMarking(true)
    try {
      const res = await fetch(`/api/escrow/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, completedBy: user.uid }),
      })
      const data = await res.json() as {
        success?: boolean
        completedAt?: string
        workerDisputeDeadline?: string
        escrowReleased?: boolean
        error?: string
      }

      if (res.status === 207) {
        // Partial success — job marked complete but escrow release had issues
        setCompleted(true)
        setCompletedAt(data.completedAt ?? new Date().toISOString())
        if (data.workerDisputeDeadline) setDisputeDeadline(data.workerDisputeDeadline)
        toast.error(
          data.error ??
            'Job marked complete but payment release encountered an issue — please contact support.'
        )
      } else if (res.ok && data.success) {
        setCompleted(true)
        setCompletedAt(data.completedAt ?? new Date().toISOString())
        if (data.workerDisputeDeadline) setDisputeDeadline(data.workerDisputeDeadline)
        toast.success('Job marked as complete! Payment has been released to the tradie.')
      } else {
        toast.error(data.error ?? 'Failed to mark job as complete. Please try again.')
      }
    } catch {
      toast.error('Failed to mark job as complete. Please try again.')
    } finally {
      setMarking(false)
    }
  }

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (authLoading || loadingJob) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </main>
        <Footer />
      </div>
    )
  }

  // ── Error loading job ─────────────────────────────────────────────────────────
  if (jobError) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {jobError}
            </p>
            <Link
              href="/dashboard/homeowner"
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:underline text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Auth guard ───────────────────────────────────────────────────────────────
  if (!authLoading && !user) {
    router.push(`/auth/login?redirect=/dashboard/jobs/${jobId}/complete`)
    return null
  }

  // ── Authorisation — must be the homeowner ───────────────────────────────────
  if (job && user && job.employerId !== user.uid) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <div className="max-w-2xl mx-auto px-4 py-16 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Access denied</p>
            <p className="text-gray-500 text-sm">
              Only the homeowner who posted this job can mark it as complete.
            </p>
            <Link
              href={`/jobs/${jobId}`}
              className="inline-flex items-center gap-2 mt-4 text-primary-600 hover:underline text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to job
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ── Already completed ────────────────────────────────────────────────────────
  const isAlreadyComplete = job?.status === 'completed' && !completed

  // ── Confirmation screen shown after marking complete ─────────────────────────
  if (completed) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center shadow-sm">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Job Marked as Complete!
            </h2>
            {completedAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Completed on{' '}
                {new Date(completedAt).toLocaleDateString('en-NZ', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            )}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Payment has been released to{' '}
              <span className="font-medium text-gray-800 dark:text-gray-200">
                {worker?.displayName ?? 'the tradie'}
              </span>
              .{disputeDeadline
                ? ` The tradie may raise a dispute until ${formatDisputeDeadline(disputeDeadline)}.`
                : ' The tradie has a short window to raise a dispute if needed.'
              }
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
                Leave a review
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Share your experience to help others in the community find great tradies.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href={`/jobs/${jobId}/review`}>
                <Button className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-0">
                  <Star className="h-4 w-4" />
                  Leave a Review
                </Button>
              </Link>
              <Link href={`/jobs/${jobId}`}>
                <Button variant="outline" className="w-full">
                  Back to Job
                </Button>
              </Link>
              <Link href="/dashboard/homeowner">
                <Button variant="outline" className="w-full text-sm">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to job
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 shadow-sm space-y-6">

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Mark Job as Complete
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Confirm the work is done and release payment to the tradie
                </p>
              </div>
            </div>

            {/* Already complete notice */}
            {isAlreadyComplete && (
              <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-300">
                    This job is already marked as complete
                  </p>
                  {job?.completedAt && (
                    <p className="text-sm text-green-700 dark:text-green-400 mt-0.5">
                      Completed on{' '}
                      {new Date(job.completedAt).toLocaleDateString('en-NZ', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Job summary */}
            {job && (
              <div className="space-y-3">
                <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Job Summary
                </h2>

                <div className="rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                  {/* Title */}
                  <div className="flex items-center gap-3 p-4">
                    <Briefcase className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Job</p>
                      <p className="font-medium text-gray-900 dark:text-white truncate">
                        {job.title}
                      </p>
                    </div>
                  </div>

                  {/* Worker */}
                  <div className="flex items-center gap-3 p-4">
                    <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Tradie</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {worker?.displayName ?? (job.assignedWorkerId ? 'Loading…' : 'Not assigned')}
                      </p>
                      {worker?.rating != null && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {worker.rating.toFixed(1)}
                            {worker.reviewCount != null && ` (${worker.reviewCount} reviews)`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Agreed price */}
                  <div className="flex items-center gap-3 p-4">
                    <DollarSign className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Agreed price</p>
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatNZD(job.budget)}
                        {job.budgetType === 'hourly' && (
                          <span className="text-sm font-normal text-gray-500 ml-1">/hr</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* What happens next */}
            {!isAlreadyComplete && (
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 p-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                  What happens when you confirm?
                </p>
                <ul className="text-sm text-amber-700 dark:text-amber-400 space-y-1 list-disc list-inside">
                  <li>The job will be marked as complete</li>
                  <li>Payment will be released to the tradie</li>
                  <li>The tradie has a 24-hour window to raise a dispute if needed</li>
                  <li>You&apos;ll be prompted to leave a review</li>
                </ul>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Link href={`/jobs/${jobId}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              {!isAlreadyComplete && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white border-0 flex items-center justify-center gap-2"
                  onClick={handleMarkComplete}
                  loading={marking}
                  disabled={marking || !job || job.status !== 'in_progress'}
                >
                  {!marking && <CheckCircle className="h-4 w-4" />}
                  Yes, Mark as Complete
                </Button>
              )}
              {isAlreadyComplete && (
                <Link href={`/jobs/${jobId}/review`} className="flex-1">
                  <Button className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white border-0">
                    <Star className="h-4 w-4" />
                    Leave a Review
                  </Button>
                </Link>
              )}
            </div>

            {job && job.status !== 'in_progress' && !isAlreadyComplete && (
              <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                This job cannot be marked complete — current status:{' '}
                <span className="font-medium">{job.status}</span>
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
