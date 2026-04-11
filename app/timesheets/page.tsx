'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { getWorkerTimesheets, getTimesheetEntries } from '@/lib/timesheets/firebase'
import type { JobTimesheet, TimesheetEntry } from '@/lib/timesheets/firebase'
import { ClipboardList, Clock, DollarSign, Plus, ChevronRight } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'

interface TimesheetSummary {
  timesheet: JobTimesheet
  totalMinutes: number
  totalMaterialsCost: number
}

export default function TimesheetsPage() {
  const { user, profile } = useAuth()
  const [summaries, setSummaries] = useState<TimesheetSummary[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const load = async () => {
      setLoading(true)
      try {
        const sheets = await getWorkerTimesheets(user.uid)
        const results = await Promise.all(
          sheets.map(async (ts) => {
            const entries: TimesheetEntry[] = await getTimesheetEntries(ts.jobId)
            const totalMinutes = entries
              .filter((e) => e.type === 'time')
              .reduce((sum, e) => sum + (e.hours ?? 0) * 60 + (e.minutes ?? 0), 0)
            const totalMaterialsCost = entries
              .filter((e) => e.type === 'material')
              .reduce((sum, e) => sum + (e.cost ?? 0), 0)
            return { timesheet: ts, totalMinutes, totalMaterialsCost }
          })
        )
        setSummaries(results)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [user])

  if (profile?.role !== 'worker') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Timesheets are only available for workers.</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30">
                <ClipboardList className="h-6 w-6 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Timesheets</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Track time and costs per job</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
                  <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                </div>
              ))}
            </div>
          ) : summaries.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No timesheets yet</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                Start tracking your time and materials by visiting an active job.
              </p>
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
              >
                <Plus className="h-4 w-4" />
                Browse Jobs
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {summaries.map(({ timesheet, totalMinutes, totalMaterialsCost }) => {
                const hrs = Math.floor(totalMinutes / 60)
                const mins = totalMinutes % 60
                const budgetPercent = timesheet.quotedBudget > 0
                  ? Math.min(100, (totalMaterialsCost / timesheet.quotedBudget) * 100)
                  : 0
                const barColor =
                  budgetPercent >= 90
                    ? 'bg-red-500'
                    : budgetPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-fuchsia-500'

                return (
                  <Link
                    key={timesheet.jobId}
                    href={`/timesheets/${timesheet.jobId}`}
                    className="block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:border-fuchsia-700 dark:hover:border-fuchsia-700 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition-colors truncate">
                          {timesheet.jobTitle}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{timesheet.employerName}</p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    </div>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 text-fuchsia-500" />
                        <span>
                          {hrs > 0 ? `${hrs}h ` : ''}{mins}m logged
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                        <DollarSign className="h-4 w-4 text-fuchsia-500" />
                        <span>${totalMaterialsCost.toFixed(2)} spent</span>
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 text-xs ml-auto">
                        Updated {formatRelativeDate(timesheet.updatedAt)}
                      </div>
                    </div>

                    {timesheet.quotedBudget > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Materials vs budget</span>
                          <span>${totalMaterialsCost.toFixed(2)} / ${timesheet.quotedBudget.toFixed(2)}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${barColor}`}
                            style={{ width: `${budgetPercent}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </Link>
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
