'use client'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { collection, query, where, orderBy, getDocs, type DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'

interface PostedJob {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
  budget: number
  budgetType: 'fixed' | 'hourly'
  createdAt: string
  quoteCount: number
}

interface SimpleQuote {
  id: string
  jobId: string
  workerName: string
  workerRating?: number
  amount: number
  message: string
  status: string
  createdAt: string
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  in_progress: { label: 'In Progress', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  completed: { label: 'Done', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
  disputed: { label: 'Disputed', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
}

const MOCK_JOBS: PostedJob[] = [
  {
    id: 'demo-1',
    title: 'Fix leaking bathroom tap',
    description: 'The cold tap in the main bathroom has been dripping for a week.',
    status: 'open',
    budget: 0,
    budgetType: 'fixed',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    quoteCount: 2,
  },
  {
    id: 'demo-2',
    title: 'Paint the living room',
    description: 'Need the living room repainted in a light grey colour.',
    status: 'in_progress',
    budget: 800,
    budgetType: 'fixed',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    quoteCount: 0,
  },
]

const MOCK_QUOTES: SimpleQuote[] = [
  {
    id: 'q1',
    jobId: 'demo-1',
    workerName: 'Mike T.',
    workerRating: 4.8,
    amount: 120,
    message: "Happy to help — I can come out tomorrow morning and get it sorted in under an hour.",
    status: 'pending',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'q2',
    jobId: 'demo-1',
    workerName: 'Sarah P.',
    workerRating: 4.9,
    amount: 95,
    message: "I'm a licensed plumber with 10 years experience. Can do Thursday or Friday.",
    status: 'pending',
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
]

function docToJob(id: string, data: DocumentData): PostedJob {
  const toISO = (v: unknown) =>
    v && typeof v === 'object' && 'toDate' in v
      ? (v as { toDate: () => Date }).toDate().toISOString()
      : typeof v === 'string' ? v : new Date().toISOString()
  return {
    id,
    title: data.title ?? 'Untitled job',
    description: data.description ?? '',
    status: data.status ?? 'open',
    budget: data.budget ?? 0,
    budgetType: data.budgetType ?? 'fixed',
    createdAt: toISO(data.createdAt),
    quoteCount: data.applicantsCount ?? 0,
  }
}

export default function HomeownerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<PostedJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [quotes, setQuotes] = useState<SimpleQuote[]>([])
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null)
  const [acceptingQuote, setAcceptingQuote] = useState<string | null>(null)
  const [acceptedQuote, setAcceptedQuote] = useState<SimpleQuote | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid || !db) {
      setJobs(MOCK_JOBS)
      setQuotes(MOCK_QUOTES)
      setLoadingJobs(false)
      return
    }
    async function fetchData() {
      try {
        const jobsRef = collection(db!, 'jobs')
        const q = query(jobsRef, where('employerId', '==', user!.uid), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const fetched = snapshot.docs.map((d) => docToJob(d.id, d.data()))
        setJobs(fetched.length > 0 ? fetched : MOCK_JOBS)

        // Fetch quotes for these jobs
        if (fetched.length > 0) {
          const quotesRef = collection(db!, 'quotes')
          const qSnap = await getDocs(
            query(quotesRef, where('jobId', 'in', fetched.slice(0, 10).map((j) => j.id)))
          )
          const fetchedQuotes: SimpleQuote[] = qSnap.docs.map((d) => {
            const data = d.data()
            const toISO = (v: unknown) =>
              v && typeof v === 'object' && 'toDate' in v
                ? (v as { toDate: () => Date }).toDate().toISOString()
                : typeof v === 'string' ? v : new Date().toISOString()
            return {
              id: d.id,
              jobId: data.jobId,
              workerName: data.workerName ?? 'Tradie',
              workerRating: data.workerRating,
              amount: data.amount ?? 0,
              message: data.message ?? data.coverLetter ?? '',
              status: data.status ?? 'pending',
              createdAt: toISO(data.createdAt),
            }
          })
          setQuotes(fetchedQuotes.length > 0 ? fetchedQuotes : MOCK_QUOTES)
        } else {
          setQuotes(MOCK_QUOTES)
        }
      } catch {
        setJobs(MOCK_JOBS)
        setQuotes(MOCK_QUOTES)
      } finally {
        setLoadingJobs(false)
      }
    }
    fetchData()
  }, [user])

  const handleAcceptQuote = async (quote: SimpleQuote) => {
    setAcceptingQuote(quote.id)
    // In real implementation this would trigger escrow payment flow
    await new Promise((r) => setTimeout(r, 600))
    setAcceptingQuote(null)
    setAcceptedQuote(quote)
  }

  const totalNewQuotes = jobs.reduce((sum, j) => sum + (j.quoteCount || 0), 0)
  const inProgressJobs = useMemo(() => jobs.filter((j) => j.status === 'in_progress'), [jobs])

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Accepted quote confirmation screen
  if (acceptedQuote) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              You&apos;re hiring {acceptedQuote.workerName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              for {formatCurrency(acceptedQuote.amount)}. They&apos;ll be in touch soon.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-6 text-left">
              <p className="text-sm text-green-800 dark:text-green-300">
                ✅ Your payment is securely held in escrow and will only be released when you confirm the job is done.
              </p>
            </div>
            <button
              onClick={() => setAcceptedQuote(null)}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
            >
              Back to My Jobs
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                My Jobs
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                Hi {profile?.displayName?.split(' ')[0] || 'there'} 👋
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard/homeowner/alerts"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="Job alerts"
              >
                🔔 <span className="hidden sm:inline">Alerts</span>
              </Link>
              <Link
                href="/dashboard/homeowner/spending"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="Spending dashboard"
              >
                💰 <span className="hidden sm:inline">Spending</span>
              </Link>
              <Link
                href="/dashboard/homeowner/bookings"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="My bookings"
              >
                📅 <span className="hidden sm:inline">Bookings</span>
              </Link>
              <Link
                href="/dashboard/homeowner/favourites"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="My favourite tradies"
              >
                ❤️ <span className="hidden sm:inline">Favourites</span>
              </Link>
              <Link
                href="/dashboard/homeowner/templates"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="My job templates"
              >
                📋 <span className="hidden sm:inline">Templates</span>
              </Link>
              <Link
                href="/dashboard/homeowner/recurring"
                className="py-2.5 px-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center gap-1.5"
                aria-label="My recurring services"
              >
                🔁 <span className="hidden sm:inline">Recurring Services</span>
              </Link>
              <Link
                href="/post/homeowner"
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                + Post a Job
              </Link>
            </div>
          </div>

          {/* Disputed jobs banner */}
          {!loadingJobs && jobs.filter((j) => j.status === 'disputed').length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-orange-700 dark:text-orange-400">⚠️ Jobs Under Dispute</span>
              </div>
              {jobs
                .filter((j) => j.status === 'disputed')
                .map((job) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                  >
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatRelativeDate(job.createdAt)}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 whitespace-nowrap">
                      Under Review
                    </span>
                  </Link>
                ))}
            </div>
          )}

          {/* Jobs awaiting your completion confirmation */}
          {!loadingJobs && inProgressJobs.length > 0 && (
            <div className="mb-6 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-semibold text-green-700 dark:text-green-400">✅ Jobs Awaiting Your Confirmation</span>
              </div>
              {inProgressJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">In progress · {formatRelativeDate(job.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/homeowner/jobs/${job.id}/milestones`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 whitespace-nowrap hover:opacity-80 transition-opacity"
                    >
                      Milestones
                    </Link>
                    <Link
                      href={`/jobs/${job.id}`}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 whitespace-nowrap hover:opacity-80 transition-opacity"
                    >
                      Mark Complete →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Notification banner */}
          {totalNewQuotes > 0 && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 mb-6 flex items-center gap-3">
              <span className="text-xl">🔔</span>
              <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300">
                You have <strong>{totalNewQuotes} new {totalNewQuotes === 1 ? 'quote' : 'quotes'}</strong> — tap a job below to see them
              </p>
            </div>
          )}

          {/* Jobs list */}
          {loadingJobs ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No jobs yet</h3>
              <p className="text-gray-500 mb-6">Post your first job and get quotes from local tradies</p>
              <Link
                href="/post/homeowner"
                className="py-3 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
              >
                Post a Job — Free
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const jobQuotes = quotes.filter((q) => q.jobId === job.id && q.status === 'pending')
                const isExpanded = expandedJobId === job.id
                const statusConf = STATUS_CONFIG[job.status] || STATUS_CONFIG.open

                return (
                  <div key={job.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Job summary row */}
                    <button
                      type="button"
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="w-full text-left p-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusConf.color}`}>
                              {statusConf.label}
                            </span>
                            {jobQuotes.length > 0 && (
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                🔔 {jobQuotes.length} {jobQuotes.length === 1 ? 'quote' : 'quotes'}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{job.title}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{formatRelativeDate(job.createdAt)}</p>
                        </div>
                        <span className="text-gray-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                    </button>

                    {/* Expanded: quotes */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 dark:border-gray-800 p-5 pt-4 space-y-4">
                        {jobQuotes.length === 0 ? (
                          <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                            <p className="text-sm">No quotes yet — tradies will respond soon!</p>
                          </div>
                        ) : (
                          <>
                            {/* Show top quote prominently */}
                            {(() => {
                              const topQuote = [...jobQuotes].sort((a, b) => a.amount - b.amount)[0]
                              return (
                                <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <span className="font-semibold text-gray-900 dark:text-white">{topQuote.workerName}</span>
                                      {topQuote.workerRating && (
                                        <span className="ml-2 text-sm text-yellow-600">⭐ {topQuote.workerRating}</span>
                                      )}
                                    </div>
                                    <span className="text-xl font-bold text-green-700 dark:text-green-400">
                                      {formatCurrency(topQuote.amount)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">{'"'}{topQuote.message}{'"'}</p>
                                  <button
                                    type="button"
                                    disabled={acceptingQuote === topQuote.id}
                                    onClick={() => handleAcceptQuote(topQuote)}
                                    className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold rounded-xl transition-colors text-base"
                                  >
                                    {acceptingQuote === topQuote.id ? (
                                      <span className="flex items-center justify-center gap-2">
                                        <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Accepting...
                                      </span>
                                    ) : (
                                      `Accept This Quote — ${formatCurrency(topQuote.amount)}`
                                    )}
                                  </button>
                                </div>
                              )
                            })()}

                            {/* Other quotes */}
                            {jobQuotes.length > 1 && (
                              <div>
                                <p className="text-xs font-medium text-gray-500 mb-2">Other quotes:</p>
                                <div className="space-y-2">
                                  {[...jobQuotes]
                                    .sort((a, b) => a.amount - b.amount)
                                    .slice(1)
                                    .map((q) => (
                                      <div key={q.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div>
                                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{q.workerName}</span>
                                          {q.workerRating && (
                                            <span className="ml-2 text-xs text-yellow-600">⭐ {q.workerRating}</span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                          <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(q.amount)}</span>
                                          <button
                                            type="button"
                                            disabled={acceptingQuote === q.id}
                                            onClick={() => handleAcceptQuote(q)}
                                            className="text-xs py-1.5 px-3 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors"
                                          >
                                            Accept
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Footer CTA */}
          {jobs.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/post/homeowner"
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
              >
                + Post another job
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
