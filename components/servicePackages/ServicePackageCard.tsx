'use client'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Clock, Star, CheckCircle, DollarSign, Package } from 'lucide-react'
import Button from '@/components/ui/Button'
import { getInitials } from '@/lib/utils'
import type { ServicePackage } from '@/types'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/providers/AuthProvider'
import { useRouter } from 'next/navigation'

interface ServicePackageCardProps {
  pkg: ServicePackage
  /** Hide the "Book Now" button (e.g. on the worker's own manage page) */
  hideBook?: boolean
}

export default function ServicePackageCard({ pkg, hideBook = false }: ServicePackageCardProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showBookModal, setShowBookModal] = useState(false)
  const [booking, setBooking] = useState(false)
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('09:00')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')

  const handleBook = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=/packages`)
      return
    }
    if (!preferredDate || !address.trim()) {
      toast.error('Please fill in date and address')
      return
    }
    setBooking(true)
    try {
      const res = await fetch(`/api/service-packages/${pkg.id}/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({ preferredDate, preferredTime, address: address.trim(), notes: notes.trim() || undefined }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Booking failed')
      }
      toast.success('Booking confirmed! You\'ll receive a confirmation email shortly.')
      setShowBookModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  // Tomorrow as the minimum bookable date
  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
        {/* Card header */}
        <div className="p-5 flex-1">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight line-clamp-2 mb-1">
                {pkg.title}
              </h3>
              <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {pkg.region}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  ~{pkg.estimatedDurationHours}h
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-0.5 text-xl font-bold text-gray-900 dark:text-white">
                <DollarSign className="h-4 w-4 text-green-500" />
                {pkg.price.toLocaleString('en-NZ')}
              </div>
              <p className="text-xs text-gray-400">fixed price</p>
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {pkg.description}
          </p>

          {/* Inclusions */}
          {pkg.inclusions.length > 0 && (
            <ul className="space-y-1 mb-3">
              {pkg.inclusions.slice(0, 4).map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                  <CheckCircle className="h-3.5 w-3.5 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
              {pkg.inclusions.length > 4 && (
                <li className="text-xs text-gray-400">+{pkg.inclusions.length - 4} more included</li>
              )}
            </ul>
          )}

          {/* Worker info */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
            <Link href={`/workers/${pkg.workerId}`} className="flex-shrink-0">
              {pkg.workerPhotoURL ? (
                <Image
                  src={pkg.workerPhotoURL}
                  alt={pkg.workerName}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold">
                  {getInitials(pkg.workerName || 'W')}
                </div>
              )}
            </Link>
            <div className="flex-1 min-w-0">
              <Link
                href={`/workers/${pkg.workerId}`}
                className="text-xs font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors truncate block"
              >
                {pkg.workerName}
              </Link>
              {pkg.workerRating != null && pkg.workerRating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-gray-500">
                    {pkg.workerRating.toFixed(1)} ({pkg.workerReviewCount ?? 0})
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-2 py-0.5 rounded-full font-medium">
              {pkg.category}
            </span>
          </div>
        </div>

        {/* CTA */}
        {!hideBook && (
          <div className="px-5 pb-5">
            <Button
              className="w-full"
              size="sm"
              onClick={() => {
                if (!user) {
                  router.push(`/auth/login?redirect=/packages`)
                  return
                }
                setShowBookModal(true)
              }}
            >
              <Package className="h-4 w-4" />
              Book Now — ${pkg.price.toLocaleString('en-NZ')}
            </Button>
          </div>
        )}
      </div>

      {/* Booking modal */}
      {showBookModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setShowBookModal(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-primary-600 to-violet-600 p-5">
              <h2 className="text-lg font-bold text-white">Book: {pkg.title}</h2>
              <p className="text-primary-200 text-sm mt-0.5">Fixed price: ${pkg.price.toLocaleString('en-NZ')} NZD</p>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  min={minDateStr}
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preferred time
                </label>
                <input
                  type="time"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Example St, Auckland"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Additional notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Any special instructions or access notes…"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowBookModal(false)}
                  disabled={booking}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleBook}
                  loading={booking}
                  disabled={!preferredDate || !address.trim()}
                >
                  Confirm Booking
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
