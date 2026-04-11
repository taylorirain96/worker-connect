'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import { ArrowLeft, Star, ChevronDown, ChevronUp, Users, MessageSquare, Loader2 } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import { getJobApplications, acceptApplication, rejectApplication } from '@/lib/applications'
import { db } from '@/lib/firebase'
import { doc, getDoc, Timestamp } from 'firebase/firestore'
import { getOrCreateConversation } from '@/lib/messaging'
import type { Job, JobApplication } from '@/types'

function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function CoverLetterCell({ text }: { text?: string }) {
  const [expanded, setExpanded] = useState(false)
  if (!text) return <span className="text-gray-400 text-sm italic">No cover letter</span>
  const isLong = text.length > 150
  return (
    <div>
      <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
        {expanded || !isLong ? text : `${text.slice(0, 150)}…`}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 mt-1 hover:underline"
        >
          {expanded ? <><ChevronUp className="h-3 w-3" /> Show less</> : <><ChevronDown className="h-3 w-3" /> Read more</>}
        </button>
      )}
    </div>
  )
}

export default function ApplicantsPage() {
  const params = useParams()
  const router = useRouter()
  const jobId = params.id as string
  const { user, profile, loading } = useAuth()

  const [job, setJob] = useState<Job | null>(null)
  const [applications, setApplications] = useState<JobApplication[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [messagingId, setMessagingId] = useState<string | null>(null)

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user) return

    async function fetchData() {
      try {
        // Fetch job details
        let fetchedJob: Job | null = null
        if (db) {
          const jobSnap = await getDoc(doc(db, 'jobs', jobId))
          if (jobSnap.exists()) {
            const data = jobSnap.data()
            fetchedJob = {
              ...data,
              id: jobSnap.id,
              createdAt:
                data.createdAt instanceof Timestamp
                  ? data.createdAt.toDate().toISOString()
                  : data.createdAt ?? new Date().toISOString(),
              updatedAt:
                data.updatedAt instanceof Timestamp
                  ? data.updatedAt.toDate().toISOString()
                  : data.updatedAt ?? new Date().toISOString(),
            } as Job
          }
        }
        setJob(fetchedJob)

        // Fetch applications
        const apps = await getJobApplications(jobId)
        setApplications(apps)
      } catch {
        toast.error('Failed to load applicants')
      } finally {
        setLoadingData(false)
      }
    }

    fetchData()
  }, [user, jobId])

  const handleAccept = async (app: JobApplication) => {
    setActionInProgress(app.id)
    try {
      await acceptApplication(app.id, jobId, app.workerId)
      setApplications((prev) =>
        prev.map((a) => {
          if (a.id === app.id) return { ...a, status: 'accepted' }
          if (a.status === 'pending') return { ...a, status: 'rejected' }
          return a
        })
      )
      toast.success('Worker accepted! Job is now in progress')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to accept application')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleReject = async (app: JobApplication) => {
    setActionInProgress(app.id)
    try {
      await rejectApplication(app.id)
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: 'rejected' } : a))
      )
      toast.success('Application rejected')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reject application')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleMessage = async (app: JobApplication) => {
    if (!user || !app.workerId) return
    setMessagingId(app.id)
    try {
      const conversationId = await getOrCreateConversation(
        user.uid,
        profile?.displayName || user.displayName || user.email || 'Employer',
        profile?.photoURL || user.photoURL || null,
        app.workerId,
        app.workerName || 'Worker',
        null,
        jobId,
        job?.title
      )
      router.push(`/messages/${conversationId}`)
    } catch {
      toast.error('Could not start conversation. Please try again.')
    } finally {
      setMessagingId(null)
    }
  }

  // Guard: only show while loading auth
  if (loading || (!user && !loading)) return null

  // 403: only the employer who posted the job can view this page
  if (!loadingData && job && user?.uid !== job.employerId) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <p className="text-5xl mb-4">🚫</p>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Access Denied</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              You don&apos;t have permission to view applicants for this job.
            </p>
            <Link href="/dashboard/employer">
              <Button>Go to Dashboard</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const positionFilled = applications.some((a) => a.status === 'accepted')
  const pendingCount = applications.filter((a) => a.status === 'pending').length

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back link */}
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Link>

          {/* Header */}
          <div className="mb-6">
            {loadingData ? (
              <div className="animate-pulse">
                <div className="h-7 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Applicants for &ldquo;{job?.title ?? 'Job'}&rdquo;
                </h1>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {applications.length} applicant{applications.length !== 1 ? 's' : ''}
                  </span>
                  {pendingCount > 0 && (
                    <Badge variant="warning">{pendingCount} pending</Badge>
                  )}
                  {positionFilled && (
                    <Badge variant="success">Position filled</Badge>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Loading skeletons */}
          {loadingData && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-64 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loadingData && applications.length === 0 && (
            <Card>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">No applications yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Applications will appear here once workers apply.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Application cards */}
          {!loadingData && applications.length > 0 && (
            <div className="space-y-4">
              {applications.map((app) => {
                const isProcessing = actionInProgress === app.id
                const workerInitials = getInitials(app.workerName)

                return (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5"
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {app.workerPhotoURL ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={app.workerPhotoURL}
                            alt={app.workerName ?? 'Worker'}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-semibold text-primary-700 dark:text-primary-400 text-sm">
                            {workerInitials}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {app.workerId ? (
                            <Link
                              href={`/profile/${app.workerId}`}
                              className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                            >
                              {app.workerName ?? 'Anonymous Worker'}
                            </Link>
                          ) : (
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {app.workerName ?? 'Anonymous Worker'}
                            </span>
                          )}

                          {/* Rating */}
                          {app.workerRating != null && (
                            <span className="flex items-center gap-0.5 text-xs text-gray-500">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              {app.workerRating.toFixed(1)}
                            </span>
                          )}

                          {/* Status badge */}
                          {app.status === 'accepted' && (
                            <Badge variant="success">Accepted ✓</Badge>
                          )}
                          {app.status === 'rejected' && (
                            <Badge variant="default">Rejected</Badge>
                          )}
                          {app.status === 'withdrawn' && (
                            <Badge variant="default">Withdrawn</Badge>
                          )}
                        </div>

                        {/* Applied date */}
                        <p className="text-xs text-gray-400 mb-3">
                          Applied {formatRelativeDate(app.appliedAt)}
                        </p>

                        {/* Cover letter */}
                        <CoverLetterCell text={app.coverLetter} />

                        {/* Actions */}
                        <div className="mt-4 flex items-center gap-2 flex-wrap">
                          {app.status === 'pending' && !positionFilled && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleAccept(app)}
                                loading={isProcessing}
                                disabled={isProcessing}
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(app)}
                                loading={isProcessing}
                                disabled={isProcessing}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {app.status === 'pending' && positionFilled && (
                            <span className="text-xs text-gray-500 italic">Position filled</span>
                          )}
                          {app.workerId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMessage(app)}
                              disabled={messagingId === app.id}
                            >
                              {messagingId === app.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5" />
                              )}
                              Message
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
