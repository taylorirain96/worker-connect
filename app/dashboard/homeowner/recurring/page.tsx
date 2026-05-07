'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { RefreshCw, Calendar, Pause, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Job } from '@/types'

const INTERVAL_LABELS: Record<string, string> = {
  weekly: 'Weekly',
  fortnightly: 'Fortnightly',
  monthly: 'Monthly',
}

const INTERVAL_COLORS: Record<string, string> = {
  weekly: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  fortnightly: 'bg-violet-500/10 border-violet-500/30 text-violet-300',
  monthly: 'bg-slate-700/50 border-slate-600/50 text-slate-300',
}

export default function RecurringJobsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [fetching, setFetching] = useState(true)
  const [pausingId, setPausingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [authLoading, user, router])

  const fetchJobs = useCallback(async () => {
    if (!user || !db) return
    setFetching(true)
    try {
      const q = query(
        collection(db, 'jobs'),
        where('employerId', '==', user.uid),
        where('recurring', '==', true)
      )
      const snap = await getDocs(q)
      const result = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Job))
      setJobs(result)
    } catch {
      toast.error('Could not load recurring jobs')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  async function handlePause(jobId: string) {
    if (!user) return
    setPausingId(jobId)
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ recurring: false }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Recurring job paused')
      setJobs((prev) => prev.filter((j) => j.id !== jobId))
    } catch {
      toast.error('Could not pause job')
    } finally {
      setPausingId(null)
    }
  }

  if (authLoading || !user) return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Recurring Services</h1>
            <p className="text-sm text-slate-400 mt-0.5">Jobs that auto-repost on a schedule</p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-12 text-center">
            <RefreshCw className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-white mb-1">No recurring jobs yet</p>
            <p className="text-sm text-slate-400 mb-4">
              Create a recurring job when posting to auto-repost it on a schedule.
            </p>
            <Link
              href="/post/homeowner"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Post a Job
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5 flex items-start gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-white truncate">{job.title}</p>
                    {job.recurrenceInterval && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${INTERVAL_COLORS[job.recurrenceInterval] ?? INTERVAL_COLORS.monthly}`}>
                        {INTERVAL_LABELS[job.recurrenceInterval] ?? job.recurrenceInterval}
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-300">
                      {job.status}
                    </span>
                  </div>
                  {job.nextRecurrenceAt && (
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Next repost: {new Date(job.nextRecurrenceAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handlePause(job.id)}
                  disabled={pausingId === job.id}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600/50 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Pause className="h-3.5 w-3.5" />
                  Pause
                </button>
              </div>
            ))}
          </div>
        )}

        {!fetching && jobs.length > 0 && (
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Pausing a recurring job stops future auto-reposts. The existing job listing remains active.</span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
