'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { STATUS_LABELS } from '@/lib/utils'

interface Quote {
  id: string
  workerId: string
  workerName: string
  rating: number
  price: number
  message: string
  status: string
}

interface HomeownerJob {
  id: string
  title: string
  location: string
  status: string
  category: string
  assignedWorkerName?: string
  quotes: Quote[]
  pendingQuoteCount: number
  expanded: boolean
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating.toFixed(1)}</span>
    </span>
  )
}

export default function HomeownerDashboardPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [jobs, setJobs] = useState<HomeownerJob[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) {
      setLoadingJobs(false)
      return
    }

    async function fetchJobs() {
      try {
        const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore')
        const { db } = await import('@/lib/firebase')
        if (!db) {
          setLoadingJobs(false)
          return
        }

        const jobsQuery = query(
          collection(db, 'jobs'),
          where('employerId', '==', user!.uid),
          orderBy('createdAt', 'desc')
        )
        const jobsSnap = await getDocs(jobsQuery)

        const jobList: HomeownerJob[] = await Promise.all(
          jobsSnap.docs.map(async (jobDoc) => {
            const data = jobDoc.data()

            // Fetch quotes for this job
            let quotes: Quote[] = []
            try {
              const quotesQuery = query(
                collection(db!, 'quotes'),
                where('jobId', '==', jobDoc.id)
              )
              const quotesSnap = await getDocs(quotesQuery)
              quotes = quotesSnap.docs.map((qDoc) => {
                const q = qDoc.data()
                return {
                  id: qDoc.id,
                  workerId: q.workerId ?? '',
                  workerName: q.workerName ?? 'Worker',
                  rating: q.workerRating ?? 0,
                  price: q.amount ?? q.price ?? 0,
                  message: q.message ?? '',
                  status: q.status ?? 'pending',
                }
              })
            } catch {
              // quotes fetch is non-blocking
            }

            const pendingQuoteCount = quotes.filter((q) => q.status === 'pending').length

            return {
              id: jobDoc.id,
              title: data.title ?? 'Untitled job',
              location: data.location ?? '',
              status: data.status ?? 'open',
              category: data.category ?? '',
              assignedWorkerName: data.assignedWorkerName ?? undefined,
              quotes,
              pendingQuoteCount,
              expanded: false,
            }
          })
        )

        setJobs(jobList)
      } catch (err) {
        console.error('Failed to load jobs', err)
      } finally {
        setLoadingJobs(false)
      }
    }

    fetchJobs()
  }, [user])

  const toggleExpand = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, expanded: !j.expanded } : j))
    )
  }

  const acceptQuote = async (jobId: string, quoteId: string, workerName: string) => {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      if (!db) return

      await updateDoc(doc(db, 'quotes', quoteId), { status: 'accepted', updatedAt: serverTimestamp() })
      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'in_progress',
        assignedWorkerName: workerName,
        updatedAt: serverTimestamp(),
      })

      setJobs((prev) =>
        prev.map((j) => {
          if (j.id !== jobId) return j
          return {
            ...j,
            status: 'in_progress',
            assignedWorkerName: workerName,
            quotes: j.quotes.map((q) =>
              q.id === quoteId ? { ...q, status: 'accepted' } : q
            ),
          }
        })
      )
      // react-hot-toast — import lazily to keep bundle lean
      const { default: toast } = await import('react-hot-toast')
      toast.success(`Quote accepted! ${workerName} will be in touch.`)
    } catch {
      const { default: toast } = await import('react-hot-toast')
      toast.error('Failed to accept quote. Please try again.')
    }
  }

  const markAsDone = async (jobId: string) => {
    try {
      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')
      if (!db) return

      await updateDoc(doc(db, 'jobs', jobId), {
        status: 'completed',
        updatedAt: serverTimestamp(),
      })

      setJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, status: 'completed' } : j))
      )
      const { default: toast } = await import('react-hot-toast')
      toast.success('Job marked as done! 🎉')
    } catch {
      const { default: toast } = await import('react-hot-toast')
      toast.error('Failed to update job. Please try again.')
    }
  }

  const firstName = profile?.displayName?.split(' ')[0] ?? user?.displayName?.split(' ')[0] ?? 'there'

  if (loading || loadingJobs) {
    return (
      <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 py-10">
        <div
          className="fixed inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-2xl mx-auto">
          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white">Hey {firstName}! 👋</h1>
            <p className="text-gray-400 text-sm mt-1">Here are your posted jobs</p>
          </div>

          {/* Jobs list */}
          {jobs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏠</div>
              <h2 className="text-lg font-semibold text-white mb-2">No jobs posted yet</h2>
              <p className="text-gray-400 text-sm mb-6">Post your first job and get quotes from local workers.</p>
              <Link
                href="/post/homeowner"
                className="inline-block py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Post a Job →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const statusInfo = STATUS_LABELS[job.status] ?? { label: job.status, color: 'bg-gray-700 text-gray-300' }
                return (
                  <div
                    key={job.id}
                    className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-2xl overflow-hidden"
                  >
                    {/* Job header */}
                    <button
                      type="button"
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3 hover:bg-gray-800/40 transition-colors"
                      onClick={() => toggleExpand(job.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-white text-sm truncate">{job.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          {job.pendingQuoteCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">
                              {job.pendingQuoteCount} new {job.pendingQuoteCount === 1 ? 'quote' : 'quotes'}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">📍 {job.location}</p>
                        {job.assignedWorkerName && (
                          <p className="text-xs text-indigo-300 mt-0.5">🔨 Assigned: {job.assignedWorkerName}</p>
                        )}
                      </div>
                      <span className="text-gray-500 text-xs flex-shrink-0 mt-0.5">
                        {job.expanded ? '▲' : '▼'}
                      </span>
                    </button>

                    {/* Expanded: quotes & actions */}
                    {job.expanded && (
                      <div className="border-t border-gray-800 px-5 py-4 space-y-3">
                        {/* In-progress: show mark as done */}
                        {(job.status === 'in_progress') && (
                          <div className="bg-indigo-900/20 border border-indigo-800/40 rounded-xl p-3 flex items-center justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-white">Job in progress</p>
                              {job.assignedWorkerName && (
                                <p className="text-xs text-gray-400">{job.assignedWorkerName} is on it</p>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => markAsDone(job.id)}
                              className="text-xs px-4 py-2 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors flex-shrink-0"
                            >
                              Mark as Done
                            </button>
                          </div>
                        )}

                        {/* Quotes */}
                        {job.quotes.length === 0 ? (
                          <p className="text-sm text-gray-400 py-2">No quotes yet — workers will reach out soon.</p>
                        ) : (
                          <>
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                              Quotes ({job.quotes.length})
                            </p>
                            {job.quotes.map((quote) => (
                              <div
                                key={quote.id}
                                className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-2"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <p className="text-sm font-semibold text-white">{quote.workerName}</p>
                                    {quote.rating > 0 && <StarRating rating={quote.rating} />}
                                  </div>
                                  <span className="text-lg font-bold text-indigo-300">
                                    ${quote.price.toLocaleString()}
                                  </span>
                                </div>
                                {quote.message && (
                                  <p className="text-sm text-gray-300 leading-relaxed">{quote.message}</p>
                                )}
                                {quote.status === 'pending' && job.status === 'open' && (
                                  <button
                                    type="button"
                                    onClick={() => acceptQuote(job.id, quote.id, quote.workerName)}
                                    className="w-full mt-1 py-2 px-4 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors text-sm"
                                  >
                                    Accept Quote
                                  </button>
                                )}
                                {quote.status === 'accepted' && (
                                  <span className="inline-block text-xs px-2 py-0.5 bg-green-500/15 text-green-400 rounded-full font-medium">
                                    ✓ Accepted
                                  </span>
                                )}
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Post another job */}
          {jobs.length > 0 && (
            <div className="mt-8 text-center">
              <Link
                href="/post/homeowner"
                className="inline-block py-3 px-8 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all text-sm"
              >
                Post Another Job →
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
