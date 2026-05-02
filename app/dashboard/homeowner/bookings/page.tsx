'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, MapPin, MessageSquare, User } from 'lucide-react'
import toast from 'react-hot-toast'
import type { BookingRequest, BookingStatus } from '@/types'

const STATUS_CONFIG: Record<BookingStatus, { label: string; variant: 'warning' | 'success' | 'danger' | 'default'; description: string }> = {
  pending:   { label: 'Pending',   variant: 'warning', description: 'Waiting for the worker to respond.' },
  confirmed: { label: 'Confirmed', variant: 'success', description: 'The worker has accepted your booking.' },
  declined:  { label: 'Declined',  variant: 'danger',  description: 'The worker is unavailable for this time.' },
}

export default function HomeownerBookingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<BookingRequest[]>([])
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (!user?.uid) return
    fetch('/api/bookings?role=homeowner', {
      headers: { 'x-user-id': user.uid },
    })
      .then((r) => r.json())
      .then((data) => setBookings(data.bookings ?? []))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setFetching(false))
  }, [user])

  if (loading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
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
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
            <p className="text-sm text-gray-500 mt-1">Track your booking requests and their status.</p>
          </div>

          {bookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="font-semibold text-gray-900 dark:text-white">No bookings yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Find a tradie and request a booking to get started.
                </p>
                <Link href="/workers" className="mt-4 inline-block">
                  <Button variant="outline" size="sm">Find a Tradie</Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const { label, variant, description } = STATUS_CONFIG[booking.status]
                const formattedDate = new Date(booking.requestedDate + 'T12:00:00').toLocaleDateString('en-NZ', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })

                return (
                  <Card key={booking.id} className="overflow-hidden">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {booking.workerName}
                            </span>
                            <Badge variant={variant}>{label}</Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
                        </div>
                        {booking.status === 'confirmed' && (
                          <Link href={`/workers/${booking.workerId}`}>
                            <Button variant="outline" size="sm">
                              <User className="h-3.5 w-3.5" />
                              View Profile
                            </Button>
                          </Link>
                        )}
                        {booking.status === 'declined' && (
                          <Link href="/workers">
                            <Button variant="outline" size="sm">Find Another</Button>
                          </Link>
                        )}
                      </div>

                      <div className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Calendar className="h-4 w-4 flex-shrink-0 text-primary-500" />
                          <span>{formattedDate} at {booking.requestedTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Clock className="h-4 w-4 flex-shrink-0 text-primary-500" />
                          <span>{booking.duration} hour{booking.duration !== 1 ? 's' : ''} estimated</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 sm:col-span-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 text-primary-500" />
                          <span>{booking.address}</span>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Job Description</p>
                        <p>{booking.description}</p>
                      </div>

                      {booking.workerMessage && (
                        <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                          <MessageSquare className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span className="italic">&ldquo;{booking.workerMessage}&rdquo; — {booking.workerName}</span>
                        </div>
                      )}

                      {booking.status === 'confirmed' && (
                        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                          <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                            ✓ Booking confirmed — the worker will contact you closer to the date.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
