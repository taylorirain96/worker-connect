'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  getOrCreateTimesheet,
  getTimesheet,
  getTimesheetEntries,
  addTimesheetEntry,
  deleteTimesheetEntry,
  toggleShareWithClient,
} from '@/lib/timesheets/firebase'
import type { JobTimesheet, TimesheetEntry } from '@/lib/timesheets/firebase'
import {
  ChevronLeft,
  Clock,
  Package,
  Plus,
  Trash2,
  Share2,
  CalendarDays,
} from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'time' | 'materials'

export default function JobTimesheetPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const { user, profile } = useAuth()

  const [timesheet, setTimesheet] = useState<JobTimesheet | null>(null)
  const [entries, setEntries] = useState<TimesheetEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('time')
  const [sharing, setSharing] = useState(false)

  // Time entry form state
  const [showTimeForm, setShowTimeForm] = useState(false)
  const [timeDate, setTimeDate] = useState(new Date().toISOString().split('T')[0])
  const [timeHours, setTimeHours] = useState('')
  const [timeMinutes, setTimeMinutes] = useState('')
  const [timeNotes, setTimeNotes] = useState('')
  const [savingTime, setSavingTime] = useState(false)

  // Material entry form state
  const [showMaterialForm, setShowMaterialForm] = useState(false)
  const [matDate, setMatDate] = useState(new Date().toISOString().split('T')[0])
  const [matItemName, setMatItemName] = useState('')
  const [matCost, setMatCost] = useState('')
  const [matReceiptNote, setMatReceiptNote] = useState('')
  const [savingMat, setSavingMat] = useState(false)

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      try {
        let ts = await getTimesheet(jobId)
        if (!ts) {
          // Create a new timesheet with placeholder values — the worker arrived here from the job page
          ts = await getOrCreateTimesheet(
            jobId,
            user.uid,
            '',
            'Job ' + jobId,
            '',
            0
          )
        }
        setTimesheet(ts)
        const ents = await getTimesheetEntries(jobId)
        setEntries(ents)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load timesheet')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user, jobId])

  const refreshEntries = async () => {
    const ents = await getTimesheetEntries(jobId)
    setEntries(ents)
  }

  const handleAddTime = async () => {
    if (!timeHours && !timeMinutes) {
      toast.error('Enter hours or minutes')
      return
    }
    setSavingTime(true)
    try {
      await addTimesheetEntry(jobId, {
        type: 'time',
        date: timeDate,
        hours: timeHours ? parseInt(timeHours) : 0,
        minutes: timeMinutes ? parseInt(timeMinutes) : 0,
        notes: timeNotes || undefined,
      })
      toast.success('Time entry added')
      setShowTimeForm(false)
      setTimeHours('')
      setTimeMinutes('')
      setTimeNotes('')
      await refreshEntries()
    } catch {
      toast.error('Failed to add entry')
    } finally {
      setSavingTime(false)
    }
  }

  const handleAddMaterial = async () => {
    if (!matItemName || !matCost) {
      toast.error('Enter item name and cost')
      return
    }
    setSavingMat(true)
    try {
      await addTimesheetEntry(jobId, {
        type: 'material',
        date: matDate,
        itemName: matItemName,
        cost: parseFloat(matCost),
        receiptNote: matReceiptNote || undefined,
      })
      toast.success('Material added')
      setShowMaterialForm(false)
      setMatItemName('')
      setMatCost('')
      setMatReceiptNote('')
      await refreshEntries()
    } catch {
      toast.error('Failed to add material')
    } finally {
      setSavingMat(false)
    }
  }

  const handleDelete = async (entryId: string) => {
    try {
      await deleteTimesheetEntry(jobId, entryId)
      toast.success('Entry deleted')
      await refreshEntries()
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const handleToggleShare = async () => {
    if (!timesheet) return
    setSharing(true)
    try {
      const newVal = !timesheet.sharedWithClient
      await toggleShareWithClient(jobId, newVal)
      setTimesheet({ ...timesheet, sharedWithClient: newVal })
      toast.success(newVal ? 'Shared with client' : 'Sharing disabled')
    } catch {
      toast.error('Failed to update sharing')
    } finally {
      setSharing(false)
    }
  }

  // Derived totals
  const timeEntries = entries.filter((e) => e.type === 'time')
  const materialEntries = entries.filter((e) => e.type === 'material')
  const totalMinutes = timeEntries.reduce((s, e) => s + (e.hours ?? 0) * 60 + (e.minutes ?? 0), 0)
  const totalHrs = Math.floor(totalMinutes / 60)
  const totalMins = totalMinutes % 60
  const totalMaterialsCost = materialEntries.reduce((s, e) => s + (e.cost ?? 0), 0)
  const quotedBudget = timesheet?.quotedBudget ?? 0
  const budgetPercent = quotedBudget > 0 ? Math.min(100, (totalMaterialsCost / quotedBudget) * 100) : 0
  const barColor =
    budgetPercent >= 90 ? 'bg-red-500' : budgetPercent >= 75 ? 'bg-amber-500' : 'bg-fuchsia-500'

  const distinctDates = new Set(entries.map((e) => e.date)).size

  // Group entries by date
  function groupByDate<T extends { date: string }>(items: T[]): Record<string, T[]> {
    return items.reduce<Record<string, T[]>>((acc, item) => {
      if (!acc[item.date]) acc[item.date] = []
      acc[item.date].push(item)
      return acc
    }, {})
  }

  const inputClass =
    'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500'

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-slate-100 to-gray-50 dark:bg-gray-900">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading timesheet…</div>
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
          {/* Back */}
          <Link
            href="/timesheets"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Timesheets
          </Link>

          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  {timesheet?.jobTitle || 'Timesheet'}
                </h1>
                {timesheet?.employerName && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{timesheet.employerName}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                {timesheet?.sharedWithClient && (
                  <Link
                    href={`/timesheets/${jobId}/share`}
                    className="inline-flex items-center gap-1.5 text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                  >
                    <Share2 className="h-4 w-4" />
                    View share page
                  </Link>
                )}
                <button
                  onClick={handleToggleShare}
                  disabled={sharing}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    timesheet?.sharedWithClient
                      ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30 border-fuchsia-300 dark:border-fuchsia-700 text-fuchsia-700 dark:text-fuchsia-300'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-fuchsia-500'
                  }`}
                >
                  <Share2 className="h-4 w-4" />
                  {timesheet?.sharedWithClient ? 'Shared' : 'Share with Client'}
                </button>
              </div>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-fuchsia-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Hours</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalHrs}h {totalMins}m
              </p>
              <p className="text-xs text-gray-400 mt-0.5">logged so far</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Package className="h-4 w-4 text-fuchsia-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Materials</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalMaterialsCost.toFixed(2)}</p>
              {quotedBudget > 0 && (
                <>
                  <p className="text-xs text-gray-400 mt-0.5">of ${quotedBudget.toFixed(2)} budget</p>
                  <div className="mt-2 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${barColor}`} style={{ width: `${budgetPercent}%` }} />
                  </div>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-2 mb-1">
                <CalendarDays className="h-4 w-4 text-fuchsia-500" />
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Days Active</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{distinctDates}</p>
              <p className="text-xs text-gray-400 mt-0.5">distinct dates</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
            {(['time', 'materials'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab
                    ? 'bg-white dark:bg-gray-700 text-fuchsia-600 dark:text-fuchsia-400 shadow-sm border border-fuchsia-200 dark:border-fuchsia-800'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'time' ? <Clock className="h-4 w-4" /> : <Package className="h-4 w-4" />}
                {tab === 'time' ? 'Time' : 'Materials'}
              </button>
            ))}
          </div>

          {/* Time Tab */}
          {activeTab === 'time' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 dark:text-white">Time Entries</h2>
                <button
                  onClick={() => setShowTimeForm(!showTimeForm)}
                  className="inline-flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Time Entry
                </button>
              </div>

              {/* Add time form */}
              {showTimeForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Time Entry</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                      <input type="date" value={timeDate} onChange={(e) => setTimeDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Hours</label>
                      <input type="number" min="0" value={timeHours} onChange={(e) => setTimeHours(e.target.value)} placeholder="0" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Minutes (0-59)</label>
                      <input type="number" min="0" max="59" value={timeMinutes} onChange={(e) => setTimeMinutes(e.target.value)} placeholder="0" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                    <textarea rows={2} value={timeNotes} onChange={(e) => setTimeNotes(e.target.value)} placeholder="What did you work on?" className={inputClass} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowTimeForm(false)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={handleAddTime} disabled={savingTime} className="px-3 py-1.5 text-sm bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                      {savingTime ? 'Saving…' : 'Save Entry'}
                    </button>
                  </div>
                </div>
              )}

              {/* Time entry list */}
              {timeEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                  No time entries yet. Add your first one above.
                </div>
              ) : (
                Object.entries(groupByDate(timeEntries))
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayEntries]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                        {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="space-y-2">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-fuchsia-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">
                                  {entry.hours ?? 0}h {entry.minutes ?? 0}m
                                </span>
                              </div>
                              {entry.notes && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">{entry.notes}</p>
                              )}
                            </div>
                            {profile?.role === 'worker' && (
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                                aria-label="Delete entry"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Material Entries</h2>
                  {materialEntries.length > 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Running total: <span className="font-semibold text-gray-900 dark:text-white">${totalMaterialsCost.toFixed(2)}</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowMaterialForm(!showMaterialForm)}
                  className="inline-flex items-center gap-1.5 bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add Material
                </button>
              </div>

              {/* Add material form */}
              {showMaterialForm && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-fuchsia-200 dark:border-fuchsia-800 p-4 space-y-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">New Material Entry</h3>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                      <input type="date" value={matDate} onChange={(e) => setMatDate(e.target.value)} className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Item Name</label>
                      <input type="text" value={matItemName} onChange={(e) => setMatItemName(e.target.value)} placeholder="e.g. Copper pipe" className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cost ($)</label>
                      <input type="number" min="0" step="0.01" value={matCost} onChange={(e) => setMatCost(e.target.value)} placeholder="0.00" className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Receipt Note (optional)</label>
                    <input type="text" value={matReceiptNote} onChange={(e) => setMatReceiptNote(e.target.value)} placeholder="e.g. Receipt #1234" className={inputClass} />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button onClick={() => setShowMaterialForm(false)} className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Cancel</button>
                    <button onClick={handleAddMaterial} disabled={savingMat} className="px-3 py-1.5 text-sm bg-fuchsia-600 hover:bg-fuchsia-700 text-white rounded-lg disabled:opacity-50 transition-colors">
                      {savingMat ? 'Saving…' : 'Save Material'}
                    </button>
                  </div>
                </div>
              )}

              {/* Material list */}
              {materialEntries.length === 0 ? (
                <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                  No materials logged yet. Add your first one above.
                </div>
              ) : (
                Object.entries(groupByDate(materialEntries))
                  .sort(([a], [b]) => b.localeCompare(a))
                  .map(([date, dayEntries]) => (
                    <div key={date}>
                      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
                        {new Date(date + 'T00:00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      <div className="space-y-2">
                        {dayEntries.map((entry) => (
                          <div key={entry.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Package className="h-4 w-4 text-fuchsia-400 flex-shrink-0" />
                                <span className="font-medium text-gray-900 dark:text-white text-sm">{entry.itemName}</span>
                                <span className="ml-auto font-semibold text-gray-900 dark:text-white text-sm">${(entry.cost ?? 0).toFixed(2)}</span>
                              </div>
                              {entry.receiptNote && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-6">{entry.receiptNote}</p>
                              )}
                            </div>
                            {profile?.role === 'worker' && (
                              <button
                                onClick={() => handleDelete(entry.id)}
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex-shrink-0"
                                aria-label="Delete material"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
