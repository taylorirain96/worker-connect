'use client'
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { RefreshCw, Calendar, Ban, AlertCircle, CheckCircle2 } from 'lucide-react'
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

interface JobGroup {
  parentId: string
  rootJob: Job
  occurrences: Job[]
  optedOut: boolean
}

export default function WorkerRecurringJobsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [fetching, setFetching] = useState(true)
  const [optingOutId, setOptingOutId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/signin')
    }
  }, [authLoading, user, router])

  const fetchJobs = useCallback(async () => {
    if (!user || !db) return
    setFetching(true)
    try {
      // All jobs assigned to this worker that are part of a recurring series.
      // We OR together two queries because a job can either be the recurring
      // root (recurring=true) or a generated occurrence (parentJobId set).
      const [recurringSnap, occurrenceSnap] = await Promise.all([
        getDocs(query(
          collection(db, 'jobs'),
          where('assignedWorkerId', '==', user.uid),
          where('recurring', '==', true),
        )),
        getDocs(query(
          collection(db, 'jobs'),
          where('assignedWorkerId', '==', user.uid),
        )),
      ])

      const seen = new Map<string, Job>()
      recurringSnap.docs.forEach((d) => seen.set(d.id, { id: d.id, ...d.data() } as Job))
      occurrenceSnap.docs.forEach((d) => {
        const job = { id: d.id, ...d.data() } as Job
        if (job.parentJobId && !seen.has(d.id)) seen.set(d.id, job)
      })

      setJobs(Array.from(seen.values()))
    } catch {
      toast.error('Could not load recurring jobs')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => { fetchJobs() }, [fetchJobs])

  const groups = useMemo<JobGroup[]>(() => {
    const map = new Map<string, JobGroup>()
    for (const job of jobs) {
      const parentId = job.parentJobId ?? job.id
      let group = map.get(parentId)
      if (!group) {
        group = { parentId, rootJob: job, occurrences: [], optedOut: false }
        map.set(parentId, group)
      }
      // Prefer the actual root (recurring=true && no parentJobId) as rootJob.
      if (job.recurring && !job.parentJobId) {
        group.rootJob = job
      }
      group.occurrences.push(job)
      if (user && job.recurringOptOutWorkerIds?.includes(user.uid)) {
        group.optedOut = true
      }
    }
    // Sort occurrences newest-first; missing timestamps go to the end.
    for (const g of map.values()) {
      g.occurrences.sort((a, b) => (b.createdAt ?? '0').localeCompare(a.createdAt ?? '0'))
    }
    return Array.from(map.values())
  }, [jobs, user])

  async function handleOptOut(jobId: string, parentId: string) {
    if (!user) return
    if (!confirm('Stop being auto-assigned to future occurrences of this job? You will still complete the current one.')) {
      return
    }
    setOptingOutId(parentId)
    try {
      const res = await fetch(`/api/jobs/${jobId}/recurring-opt-out`, {
        method: 'POST',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Opted out of future occurrences')
      // Optimistic update
      setJobs((prev) => prev.map((j) =>
        (j.id === parentId || j.parentJobId === parentId || j.id === jobId)
          ? { ...j, recurringOptOutWorkerIds: [...(j.recurringOptOutWorkerIds ?? []), user.uid] }
          : j,
      ))
    } catch {
      toast.error('Could not opt out')
    } finally {
      setOptingOutId(null)
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
            <h1 className="text-2xl font-bold text-white">My Recurring Work</h1>
            <p className="text-sm text-slate-400 mt-0.5">Recurring jobs you&apos;re assigned to</p>
          </div>
        </div>

        {fetching ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-12 text-center">
            <RefreshCw className="h-10 w-10 text-slate-600 mx-auto mb-3" />
            <p className="font-semibold text-white mb-1">No recurring assignments</p>
            <p className="text-sm text-slate-400 mb-4">
              When a homeowner assigns you to a recurring job, it&apos;ll show up here.
            </p>
            <Link
              href="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
            >
              Browse Jobs
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group) => {
              const root = group.rootJob
              const interval = root.recurrenceInterval
              return (
                <div
                  key={group.parentId}
                  className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-5"
                >
                  <div className="flex items-start gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-white truncate">{root.title}</p>
                        {interval && (
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${INTERVAL_COLORS[interval] ?? INTERVAL_COLORS.monthly}`}>
                            {INTERVAL_LABELS[interval] ?? interval}
                          </span>
                        )}
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-700/50 border border-slate-600/50 text-slate-300">
                          {group.occurrences.length} occurrence{group.occurrences.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      {root.nextRecurrenceAt && !group.optedOut && (
                        <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                          <Calendar className="h-3.5 w-3.5" />
                          Next occurrence: {new Date(root.nextRecurrenceAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {group.optedOut && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Opted out — future occurrences will return to the marketplace
                        </p>
                      )}
                    </div>
                    {!group.optedOut && (
                      <button
                        onClick={() => handleOptOut(group.occurrences[0].id, group.parentId)}
                        disabled={optingOutId === group.parentId}
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-600/50 text-slate-300 hover:text-white hover:border-rose-500/50 hover:bg-rose-500/10 text-xs font-medium transition-colors disabled:opacity-50"
                      >
                        <Ban className="h-3.5 w-3.5" />
                        Opt out
                      </button>
                    )}
                  </div>

                  <div className="border-t border-slate-800 pt-3 mt-3">
                    <p className="text-xs uppercase tracking-wide text-slate-500 mb-2">Occurrences</p>
                    <ul className="space-y-1.5">
                      {group.occurrences.slice(0, 5).map((occ) => (
                        <li key={occ.id} className="flex items-center justify-between text-xs">
                          <Link href={`/jobs/${occ.id}`} className="text-slate-300 hover:text-indigo-300 truncate">
                            {occ.createdAt
                              ? new Date(occ.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
                              : 'Unknown date'}
                          </Link>
                          <span className="text-slate-500 ml-2 capitalize">{occ.status.replace('_', ' ')}</span>
                        </li>
                      ))}
                      {group.occurrences.length > 5 && (
                        <li className="text-xs text-slate-500">
                          +{group.occurrences.length - 5} earlier
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!fetching && groups.length > 0 && (
          <div className="mt-4 flex items-start gap-2 text-xs text-slate-500">
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Opting out only affects future auto-assignments. Existing jobs stay on your schedule.</span>
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
