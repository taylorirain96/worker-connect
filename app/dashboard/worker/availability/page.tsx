'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Save, Plus, X, Clock, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import type { WorkerAvailability, DayAvailability } from '@/types'

const DAYS: { key: keyof Omit<WorkerAvailability, 'blockedDates' | 'minNoticeHours'>; label: string }[] = [
  { key: 'monday',    label: 'Monday' },
  { key: 'tuesday',   label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday',  label: 'Thursday' },
  { key: 'friday',    label: 'Friday' },
  { key: 'saturday',  label: 'Saturday' },
  { key: 'sunday',    label: 'Sunday' },
]

const DEFAULT_DAY: DayAvailability = { available: false, start: '08:00', end: '17:00' }

const DEFAULT_AVAILABILITY: WorkerAvailability = {
  monday:    { available: true,  start: '08:00', end: '17:00' },
  tuesday:   { available: true,  start: '08:00', end: '17:00' },
  wednesday: { available: true,  start: '08:00', end: '17:00' },
  thursday:  { available: true,  start: '08:00', end: '17:00' },
  friday:    { available: true,  start: '08:00', end: '17:00' },
  saturday:  { available: false, start: '08:00', end: '17:00' },
  sunday:    { available: false, start: '08:00', end: '17:00' },
  blockedDates: [],
  minNoticeHours: 24,
}

export default function WorkerAvailabilityPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()
  const [availability, setAvailability] = useState<WorkerAvailability>(DEFAULT_AVAILABILITY)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newBlockedDate, setNewBlockedDate] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    fetch('/api/availability', {
      headers: { 'x-user-id': user.uid },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.availability) {
          setAvailability({ ...DEFAULT_AVAILABILITY, ...data.availability })
        }
      })
      .catch(() => { /* use default */ })
      .finally(() => setFetching(false))
  }, [user])

  const toggleDay = (day: keyof Omit<WorkerAvailability, 'blockedDates' | 'minNoticeHours'>) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], available: !prev[day].available },
    }))
  }

  const updateHours = (
    day: keyof Omit<WorkerAvailability, 'blockedDates' | 'minNoticeHours'>,
    field: 'start' | 'end',
    value: string,
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const addBlockedDate = () => {
    if (!newBlockedDate) return
    if (availability.blockedDates.includes(newBlockedDate)) {
      toast.error('That date is already blocked')
      return
    }
    setAvailability((prev) => ({
      ...prev,
      blockedDates: [...prev.blockedDates, newBlockedDate].sort(),
    }))
    setNewBlockedDate('')
  }

  const removeBlockedDate = (date: string) => {
    setAvailability((prev) => ({
      ...prev,
      blockedDates: prev.blockedDates.filter((d) => d !== date),
    }))
  }

  const handleSave = async () => {
    if (!user?.uid) return
    setSaving(true)
    try {
      const res = await fetch('/api/availability', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify(availability),
      })
      if (!res.ok) throw new Error('Save failed')
      toast.success('Availability saved!')
    } catch {
      toast.error('Failed to save availability. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colours"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Availability</h1>
              <p className="text-sm text-gray-500 mt-1">Set your available days and hours so homeowners know when to book you.</p>
            </div>
            <Button onClick={handleSave} loading={saving}>
              <Save className="h-4 w-4" />
              Save
            </Button>
          </div>

          {/* Weekly Schedule */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                Weekly Schedule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {DAYS.map(({ key, label }) => {
                  const day = availability[key]
                  return (
                    <div
                      key={key}
                      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border transition-colours ${
                        day.available
                          ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/10'
                          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-[140px]">
                        <button
                          type="button"
                          onClick={() => toggleDay(key)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colours focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                            day.available ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          aria-label={`Toggle ${label}`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              day.available ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-sm font-medium ${day.available ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'}`}>
                          {label}
                        </span>
                      </div>

                      {day.available && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <input
                            type="time"
                            value={day.start}
                            onChange={(e) => updateHours(key, 'start', e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={day.end}
                            onChange={(e) => updateHours(key, 'end', e.target.value)}
                            className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      )}

                      {!day.available && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 italic">Unavailable</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Minimum Notice */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Minimum Notice Period
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                How much notice do you need before a booking?
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={168}
                  value={availability.minNoticeHours}
                  onChange={(e) =>
                    setAvailability((prev) => ({
                      ...prev,
                      minNoticeHours: Math.max(0, Math.min(168, Number(e.target.value))),
                    }))
                  }
                  className="w-24 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">hours notice required</span>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Common choices: 4 hours, 24 hours (1 day), 48 hours (2 days)
              </p>
            </CardContent>
          </Card>

          {/* Blocked Dates */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <X className="h-5 w-5 text-red-500" />
                Blocked Dates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Block specific dates you&apos;re unavailable — holidays, personal time, etc.
              </p>
              <div className="flex gap-2 mb-4">
                <input
                  type="date"
                  value={newBlockedDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Button variant="outline" size="sm" onClick={addBlockedDate} disabled={!newBlockedDate}>
                  <Plus className="h-4 w-4" />
                  Block Date
                </Button>
              </div>

              {availability.blockedDates.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No blocked dates set.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {availability.blockedDates.map((date) => (
                    <span
                      key={date}
                      className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 px-3 py-1 rounded-full text-sm"
                    >
                      {new Date(date + 'T12:00:00').toLocaleDateString('en-NZ', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                      <button
                        type="button"
                        onClick={() => removeBlockedDate(date)}
                        className="hover:text-red-900 dark:hover:text-red-200 transition-colours"
                        aria-label={`Remove ${date}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} loading={saving} size="lg">
              <Save className="h-4 w-4" />
              Save Availability
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
