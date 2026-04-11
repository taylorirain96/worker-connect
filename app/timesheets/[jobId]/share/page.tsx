'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { getTimesheet, getTimesheetEntries } from '@/lib/timesheets/firebase'
import type { JobTimesheet, TimesheetEntry } from '@/lib/timesheets/firebase'
import { ClipboardList, Clock, Package, Share2 } from 'lucide-react'

export default function TimesheetSharePage() {
  const params = useParams()
  const jobId = params.jobId as string

  const [timesheet, setTimesheet] = useState<JobTimesheet | null>(null)
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const ts = await getTimesheet(jobId)
        if (!ts || !ts.sharedWithClient) {
          setNotFound(true)
          return
        }
        setTimesheet(ts)
        const ents = await getTimesheetEntries(jobId)
        setEntries(ents)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [jobId])

  const timeEntries = entries.filter((e) => e.type === 'time')
  const materialEntries = entries.filter((e) => e.type === 'material')
  const totalMinutes = timeEntries.reduce((s, e) => s + (e.hours ?? 0) * 60 + (e.minutes ?? 0), 0)
  const totalHrs = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const totalMaterialsCost = materialEntries.reduce((s, e) => s + (e.cost ?? 0), 0)

  const dates = entries.map((e) => e.date).sort()
  const dateRange =
    dates.length > 0
      ? dates[0] === dates[dates.length - 1]
        ? new Date(dates[0] + 'T00:00:00').toLocaleDateString()
        : `${new Date(dates[0] + 'T00:00:00').toLocaleDateString()} - ${new Date(dates[dates.length - 1] + 'T00:00:00').toLocaleDateString()}`
      : 'No entries yet'

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Loading…</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (notFound || !timesheet) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Report not available</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">This timesheet has not been shared or does not exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-fuchsia-100 dark:bg-fuchsia-900/30">
                <Share2 className="h-5 w-5 text-fuchsia-600 dark:text-fuchsia-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{timesheet.jobTitle}</h1>
                {timesheet.employerName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Client: {timesheet.employerName}</p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Active dates: {dateRange}</p>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid sm:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-fuchsia-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Time</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHrs}h {totalMins}m</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-fuchsia-500" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Materials Total</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalMaterialsCost.toFixed(2)}</p>
            </div>
          </div>

          {/* Time summary table */}
          {timeEntries.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Time Log</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {timeEntries.map((e) => (
                  <div key={e.id} className="flex items-start px-5 py-3 gap-4">
                    <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 flex-shrink-0">
                      {e.hours ?? 0}h {e.minutes ?? 0}m
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{e.notes}</span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>{totalHrs}h {totalMins}m</span>
              </div>
            </div>
          )}

          {/* Materials breakdown table */}
          {materialEntries.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Materials Breakdown</h2>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {materialEntries.map((e) => (
                  <div key={e.id} className="flex items-start px-5 py-3 gap-4">
                    <span className="text-sm text-gray-500 w-28 flex-shrink-0">
                      {new Date(e.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white flex-1">{e.itemName}</span>
                    {e.receiptNote && (
                      <span className="text-sm text-gray-400 flex-1">{e.receiptNote}</span>
                    )}
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right flex-shrink-0">
                      ${(e.cost ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 flex justify-between text-sm font-semibold text-gray-900 dark:text-white">
                <span>Total</span>
                <span>${totalMaterialsCost.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-400 dark:text-gray-500 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            This report was shared via QuickTrade · Generated {new Date().toLocaleDateString()}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
