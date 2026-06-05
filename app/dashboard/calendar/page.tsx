'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import {
  ArrowLeft,
  Bell,
  BellOff,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  MapPin,
  Plus,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { BookingRequest, InstantBooking } from '@/types'
import { downloadIcs, type IcsEvent } from '@/lib/calendar/ics'
import {
  useEventReminders,
  useNotificationPermission,
} from '@/hooks/useEventReminders'

type EventSource = 'booking' | 'instant'

interface CalendarEvent {
  id: string
  source: EventSource
  /** ISO 'YYYY-MM-DD'. */
  date: string
  /** 'HH:MM' 24h. */
  time: string
  durationHours: number
  title: string
  counterpartyName: string
  address: string
  description: string
  /** Combined local Date for sorting & reminder scheduling. */
  startsAt: Date
}

function parseLocal(date: string, time: string): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, 0, 0)
}

function fromBooking(b: BookingRequest, viewerIsWorker: boolean): CalendarEvent {
  const counterparty = viewerIsWorker ? b.homeownerName : b.workerName
  return {
    id: `bk_${b.id}`,
    source: 'booking',
    date: b.requestedDate,
    time: b.requestedTime,
    durationHours: b.duration || 1,
    title: viewerIsWorker
      ? `Job for ${counterparty}`
      : `Job with ${counterparty}`,
    counterpartyName: counterparty,
    address: b.address,
    description: b.description,
    startsAt: parseLocal(b.requestedDate, b.requestedTime),
  }
}

function fromInstant(b: InstantBooking, viewerIsWorker: boolean): CalendarEvent {
  const counterparty = viewerIsWorker ? b.homeownerName : b.workerName
  return {
    id: `ib_${b.id}`,
    source: 'instant',
    date: b.requestedDate,
    time: b.requestedTime,
    durationHours: 1,
    title: b.packageTitle || 'Instant Booking',
    counterpartyName: counterparty,
    address: b.address,
    description: b.notes ?? '',
    startsAt: parseLocal(b.requestedDate, b.requestedTime),
  }
}

function toIcsEvent(ev: CalendarEvent): IcsEvent {
  return {
    id: ev.id,
    title: `${ev.title} (${ev.counterpartyName})`,
    date: ev.date,
    time: ev.time,
    durationHours: ev.durationHours,
    location: ev.address,
    description: ev.description,
    reminderMinutesBefore: 30,
  }
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function UpcomingJobsCalendarPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [fetching, setFetching] = useState(true)
  const [cursor, setCursor] = useState<{ year: number; month: number }>(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { permission, enable } = useNotificationPermission()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    setFetching(true)
    const headers = { 'x-user-id': user.uid }
    Promise.all([
      fetch('/api/bookings?role=worker', { headers }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/bookings?role=homeowner', { headers }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/instant-book?role=worker', { headers }).then((r) => r.json()).catch(() => ({})),
      fetch('/api/instant-book?role=homeowner', { headers }).then((r) => r.json()).catch(() => ({})),
    ])
      .then(([wB, hB, wI, hI]) => {
        const workerBookings: BookingRequest[] = wB.bookings ?? []
        const homeownerBookings: BookingRequest[] = hB.bookings ?? []
        const workerInstant: InstantBooking[] = wI.bookings ?? []
        const homeownerInstant: InstantBooking[] = hI.bookings ?? []

        const out: CalendarEvent[] = []
        for (const b of workerBookings) {
          if (b.status === 'confirmed') out.push(fromBooking(b, true))
        }
        for (const b of homeownerBookings) {
          if (b.status === 'confirmed') out.push(fromBooking(b, false))
        }
        for (const b of workerInstant) {
          if (b.status === 'confirmed' || b.status === 'in_progress') {
            out.push(fromInstant(b, true))
          }
        }
        for (const b of homeownerInstant) {
          if (b.status === 'confirmed' || b.status === 'in_progress') {
            out.push(fromInstant(b, false))
          }
        }
        out.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
        setEvents(out)
      })
      .catch(() => toast.error('Failed to load calendar'))
      .finally(() => setFetching(false))
  }, [user])

  // Schedule in-page reminder pop-ups 30 minutes before each upcoming event.
  const reminderItems = useMemo(
    () =>
      events.map((ev) => ({
        id: ev.id,
        startsAt: ev.startsAt,
        title: `Upcoming: ${ev.title}`,
        body: `${ev.time} at ${ev.address}`,
      })),
    [events],
  )
  useEventReminders(reminderItems, 30, permission === 'granted')

  // Group events by date string for grid + list rendering.
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const ev of events) {
      const arr = map.get(ev.date) ?? []
      arr.push(ev)
      map.set(ev.date, arr)
    }
    return map
  }, [events])

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  const upcoming = useMemo(
    () => events.filter((ev) => ev.startsAt.getTime() >= Date.now() - 60 * 60 * 1000),
    [events],
  )

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  const { year, month } = cursor
  const firstOfMonth = new Date(year, month, 1)
  const monthLabel = firstOfMonth.toLocaleDateString('en-NZ', {
    month: 'long',
    year: 'numeric',
  })
  const startWeekday = firstOfMonth.getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ key: string; date?: string; day?: number }> = []
  for (let i = 0; i < startWeekday; i++) cells.push({ key: `pad-${i}` })
  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ key: date, date, day: d })
  }

  const goPrev = () => {
    setCursor(({ year: y, month: m }) =>
      m === 0 ? { year: y - 1, month: 11 } : { year: y, month: m - 1 },
    )
    setSelectedDate(null)
  }
  const goNext = () => {
    setCursor(({ year: y, month: m }) =>
      m === 11 ? { year: y + 1, month: 0 } : { year: y, month: m + 1 },
    )
    setSelectedDate(null)
  }
  const goToday = () => {
    const t = new Date()
    setCursor({ year: t.getFullYear(), month: t.getMonth() })
    setSelectedDate(todayKey)
  }

  const visibleList = selectedDate
    ? eventsByDate.get(selectedDate) ?? []
    : upcoming

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary-500" />
                My Schedule
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Every job you&apos;ve agreed to — addresses, dates and times in one place.
                Pop-up reminders fire 30 minutes before each job.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {permission === 'granted' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1.5 rounded-lg">
                  <Bell className="h-3.5 w-3.5" />
                  Reminders on
                </span>
              ) : permission === 'unsupported' ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1.5 rounded-lg">
                  <BellOff className="h-3.5 w-3.5" />
                  Reminders not supported
                </span>
              ) : (
                <Button variant="outline" size="sm" onClick={enable}>
                  <Bell className="h-4 w-4" />
                  Turn on reminders
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadIcs(events.map(toIcsEvent), 'worker-connect-schedule.ics')}
                disabled={events.length === 0}
              >
                <Download className="h-4 w-4" />
                Export all (.ics)
              </Button>
            </div>
          </div>

          {/* Month grid */}
          <Card className="mb-6">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={goPrev}
                    aria-label="Previous month"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white min-w-[10rem] text-center">
                    {monthLabel}
                  </h2>
                  <button
                    onClick={goNext}
                    aria-label="Next month"
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <Button variant="ghost" size="sm" onClick={goToday}>
                  Today
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {WEEKDAYS.map((d) => (
                  <div key={d} className="text-center py-1">{d}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {cells.map((cell) => {
                  if (!cell.date) {
                    return <div key={cell.key} className="h-16 sm:h-20" />
                  }
                  const dayEvents = eventsByDate.get(cell.date) ?? []
                  const isToday = cell.date === todayKey
                  const isSelected = cell.date === selectedDate
                  return (
                    <button
                      key={cell.key}
                      onClick={() => setSelectedDate(isSelected ? null : cell.date!)}
                      className={[
                        'h-16 sm:h-20 rounded-lg border text-left p-1.5 flex flex-col transition-colors',
                        isSelected
                          ? 'border-primary-500 ring-2 ring-primary-200 dark:ring-primary-800 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'text-xs font-semibold',
                          isToday
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-700 dark:text-gray-200',
                        ].join(' ')}
                      >
                        {cell.day}
                      </span>
                      {dayEvents.length > 0 && (
                        <span className="mt-auto inline-flex items-center gap-1 text-[10px] font-medium text-primary-700 dark:text-primary-300 bg-primary-100 dark:bg-primary-900/40 rounded px-1.5 py-0.5 self-start">
                          {dayEvents.length} job{dayEvents.length === 1 ? '' : 's'}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Event list */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {selectedDate
                ? `Jobs on ${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-NZ', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}`
                : 'Upcoming jobs'}
            </h2>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-primary-600 hover:text-primary-700"
              >
                Show all upcoming
              </button>
            )}
          </div>

          {visibleList.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CalendarIcon className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 dark:text-white">
                  {selectedDate ? 'Nothing scheduled this day' : 'No upcoming jobs yet'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Confirmed bookings and accepted instant bookings will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {visibleList.map((ev) => (
                <EventRow key={ev.id} event={ev} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

function EventRow({ event }: { event: CalendarEvent }) {
  const formattedDate = new Date(event.date + 'T12:00:00').toLocaleDateString('en-NZ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 dark:text-white">{event.title}</span>
              <Badge variant={event.source === 'instant' ? 'warning' : 'success'}>
                {event.source === 'instant' ? 'Instant booking' : 'Booking'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">with {event.counterpartyName}</p>
            <div className="grid sm:grid-cols-2 gap-2 text-sm mt-3">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <CalendarIcon className="h-4 w-4 flex-shrink-0 text-primary-500" />
                <span>{formattedDate} at {event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Clock className="h-4 w-4 flex-shrink-0 text-primary-500" />
                <span>
                  {event.durationHours} hour{event.durationHours === 1 ? '' : 's'}
                </span>
              </div>
              <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
                <MapPin className="h-4 w-4 flex-shrink-0 text-primary-500 mt-0.5" />
                <span className="break-words">{event.address}</span>
              </div>
            </div>
            {event.description && (
              <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
                {event.description}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadIcs([toIcsEvent(event)], `${event.id}.ics`)}
          >
            <Plus className="h-4 w-4" />
            Add to calendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
