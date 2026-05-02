'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, FileText, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUserProfile } from '@/lib/users/getProfile'
import type { UserProfile, WorkerAvailability } from '@/types'

// Ordered to match JavaScript's Date.getDay() (0=Sunday … 6=Saturday).
// The calendar grid renders Monday-first by applying a (day + 6) % 7 offset.
const DAYS_OF_WEEK = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

function isDateAvailable(date: Date, availability: WorkerAvailability): boolean {
  const dayName = DAYS_OF_WEEK[date.getDay()]
  const isoDate = date.toISOString().split('T')[0]

  // Check blocked dates
  if (availability.blockedDates.includes(isoDate)) return false

  // Check day of week availability
  const dayKey = dayName as keyof Omit<WorkerAvailability, 'blockedDates' | 'minNoticeHours'>
  if (!availability[dayKey]?.available) return false

  // Check min notice
  const now = new Date()
  const minNoticeMs = (availability.minNoticeHours ?? 0) * 60 * 60 * 1000
  if (date.getTime() - now.getTime() < minNoticeMs) return false

  return true
}

function generateTimeSlots(start: string, end: string): string[] {
  const slots: string[] = []
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  let h = startH
  let m = startM
  while (h < endH || (h === endH && m < endM)) {
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    m += 30
    if (m >= 60) { h++; m = 0 }
  }
  return slots
}

export default function BookWorkerPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [worker, setWorker] = useState<UserProfile | null>(null)
  const [availability, setAvailability] = useState<WorkerAvailability | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [duration, setDuration] = useState(2)
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Calendar state
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [calendarMonth, setCalendarMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1))

  useEffect(() => {
    async function loadData() {
      const [profileResult, availabilityResult] = await Promise.all([
        getUserProfile(params.id),
        fetch(`/api/availability/${params.id}`).then((r) => r.json()).catch(() => ({ availability: null })),
      ])
      if (!profileResult || profileResult.role !== 'worker') {
        router.push('/workers')
        return
      }
      setWorker(profileResult)
      setAvailability(availabilityResult.availability ?? null)
      setLoadingData(false)
    }
    loadData()
  }, [params.id, router])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/auth/login?redirect=/workers/${params.id}/book`)
    }
  }, [authLoading, user, params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.uid || !worker) return
    if (!selectedDate || !selectedTime || !description.trim() || !address.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          workerId: worker.uid,
          requestedDate: selectedDate,
          requestedTime: selectedTime,
          duration,
          description: description.trim(),
          address: address.trim(),
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to send booking request')
      }
      setSubmitted(true)
      toast.success('Booking request sent!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || loadingData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!worker) return null

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center px-4 max-w-md">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Request Sent!</h1>
            <p className="text-gray-500 mb-6">
              Your booking request has been sent to {worker.displayName}. You&apos;ll receive an email when they respond.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard/homeowner/bookings">
                <Button>View My Bookings</Button>
              </Link>
              <Link href={`/workers/${params.id}`}>
                <Button variant="outline">Back to Profile</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // Calendar helpers
  const year = calendarMonth.getFullYear()
  const month = calendarMonth.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  // Adjust for Mon-first week (0=Mon … 6=Sun)
  const startOffset = (firstDayOfMonth + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const calendarCells: (Date | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]

  const monthLabel = calendarMonth.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' })

  // Time slots for selected date
  let timeSlots: string[] = []
  if (selectedDate && availability) {
    const selDate = new Date(selectedDate + 'T12:00:00')
    const dayName = DAYS_OF_WEEK[selDate.getDay()] as keyof Omit<WorkerAvailability, 'blockedDates' | 'minNoticeHours'>
    const dayAvail = availability[dayName]
    if (dayAvail?.available) {
      timeSlots = generateTimeSlots(dayAvail.start, dayAvail.end)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/workers/${params.id}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to {worker.displayName}&apos;s Profile
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Book {worker.displayName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Choose a date and time, then describe the job. The worker will accept or decline within 24 hours.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Calendar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary-600" />
                  Choose a Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!availability ? (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">This worker hasn&apos;t set their availability yet.</p>
                    <p className="text-xs text-gray-400 mt-1">You can still send a message to arrange a time.</p>
                  </div>
                ) : (
                  <>
                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                        aria-label="Previous month"
                      >
                        ‹
                      </button>
                      <span className="font-semibold text-gray-900 dark:text-white">{monthLabel}</span>
                      <button
                        type="button"
                        onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-400"
                        aria-label="Next month"
                      >
                        ›
                      </button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 mb-1">
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
                        <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                      ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {calendarCells.map((date, idx) => {
                        if (!date) return <div key={idx} />
                        const isoDate = date.toISOString().split('T')[0]
                        const available = isDateAvailable(date, availability)
                        const isPast = date < today
                        const isSelected = isoDate === selectedDate

                        return (
                          <button
                            key={idx}
                            type="button"
                            disabled={isPast || !available}
                            onClick={() => {
                              setSelectedDate(isoDate)
                              setSelectedTime('')
                            }}
                            className={`
                              h-9 w-full rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500
                              ${isSelected
                                ? 'bg-primary-600 text-white'
                                : available && !isPast
                                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800'
                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}
                            `}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
                        Available
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-primary-600 inline-block" />
                        Selected
                      </span>
                    </div>

                    {availability.minNoticeHours > 0 && (
                      <p className="text-xs text-gray-400 mt-2">
                        ⚠ This worker requires at least {availability.minNoticeHours} hours&apos; notice.
                      </p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Time slot */}
            {selectedDate && timeSlots.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-primary-600" />
                    Choose a Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedTime(slot)}
                        className={`
                          py-2 rounded-lg text-sm font-medium transition-colors border focus:outline-none focus:ring-2 focus:ring-primary-500
                          ${selectedTime === slot
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-300 dark:hover:border-primary-600'}
                        `}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Duration */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" />
                  Estimated Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, Math.min(12, Number(e.target.value))))}
                    className="w-20 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    hour{duration !== 1 ? 's' : ''} estimated
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Job details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  Job Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Job Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what you need done. Include any relevant details about the job — materials, access, specific requirements, etc."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      Job Address <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 12 Example Street, Auckland 1010"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary & submit */}
            {selectedDate && selectedTime && (
              <Card className="bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800">
                <CardContent className="py-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Booking Summary</h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex justify-between">
                      <span>Worker</span>
                      <span className="font-medium text-gray-900 dark:text-white">{worker.displayName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-NZ', {
                          weekday: 'long', day: 'numeric', month: 'long',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Time</span>
                      <span className="font-medium text-gray-900 dark:text-white">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration</span>
                      <span className="font-medium text-gray-900 dark:text-white">{duration} hour{duration !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
              disabled={submitting || !selectedDate || !selectedTime || !description.trim() || !address.trim()}
            >
              <Calendar className="h-4 w-4" />
              Send Booking Request
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
