'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, MapPin, Briefcase } from 'lucide-react'

interface WorkerData {
  uid: string
  displayName: string
  photoURL?: string | null
  location?: string
  rating?: number
  completedJobs?: number
  skills?: string[]
  completionRate?: number
}

export default function WorkerOfMonth() {
  const [worker, setWorker] = useState<WorkerData | null>(null)

  useEffect(() => {
    fetch('/api/platform/worker-of-month')
      .then((r) => r.json())
      .then((data: { worker?: WorkerData | null }) => {
        if (data.worker) setWorker(data.worker)
      })
      .catch(() => {})
  }, [])

  if (!worker) return null

  return (
    <div className="relative rounded-2xl overflow-hidden border border-indigo-500/30 bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 p-6 shadow-[0_0_40px_rgba(99,102,241,0.12)]">
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 60%)' }} />

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="relative shrink-0">
          {worker.photoURL ? (
            <img
              src={worker.photoURL}
              alt={worker.displayName ?? 'Worker'}
              className="h-16 w-16 rounded-full object-cover border-2 border-indigo-500/50"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-500/20 border-2 border-indigo-500/50 flex items-center justify-center">
              <span className="text-2xl font-bold text-indigo-400">
                {(worker.displayName ?? 'W')[0]}
              </span>
            </div>
          )}
          <span className="absolute -top-1 -right-1 text-base">⭐</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-0.5">Worker of the Month</p>
          <h3 className="text-xl font-bold platinum-shimmer truncate">{worker.displayName}</h3>

          <div className="mt-1.5 flex flex-wrap items-center gap-3 text-sm text-slate-400">
            {worker.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {worker.location}
              </span>
            )}
            {worker.rating !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                {worker.rating.toFixed(1)}
              </span>
            )}
            {worker.completedJobs !== undefined && (
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {worker.completedJobs} jobs completed
              </span>
            )}
          </div>

          {worker.skills && worker.skills.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {worker.skills.slice(0, 5).map((skill) => (
                <span
                  key={skill}
                  className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/workers/${worker.uid}`}
          className="shrink-0 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}
