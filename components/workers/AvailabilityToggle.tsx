'use client'
import { useState } from 'react'
import { useAuth } from '@/components/providers/AuthProvider'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import toast from 'react-hot-toast'
import { Circle, ChevronDown } from 'lucide-react'

type AvailabilityStatus = 'available' | 'busy' | 'unavailable'

const STATUS_CONFIG: Record<AvailabilityStatus, { label: string; dot: string; badge: string }> = {
  available: {
    label: 'Available Now',
    dot: 'bg-green-500',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 ring-1 ring-green-500/30',
  },
  busy: {
    label: 'Busy',
    dot: 'bg-amber-400',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 ring-1 ring-amber-500/30',
  },
  unavailable: {
    label: 'Unavailable',
    dot: 'bg-gray-400',
    badge: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 ring-1 ring-gray-500/30',
  },
}

export default function AvailabilityToggle() {
  const { user, profile } = useAuth()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const current: AvailabilityStatus =
    (profile?.availability as AvailabilityStatus) ?? 'unavailable'

  const config = STATUS_CONFIG[current]

  const handleSelect = async (status: AvailabilityStatus) => {
    if (!user || status === current) {
      setOpen(false)
      return
    }

    setSaving(true)
    setOpen(false)
    try {
      // Optimistic update via Firestore client SDK so AuthProvider picks it up
      await updateDoc(doc(db, 'users', user.uid), {
        availability: status,
        availabilityUpdatedAt: new Date().toISOString(),
      })
      toast.success(`Status updated to "${STATUS_CONFIG[status].label}"`)
    } catch (err) {
      console.error('Availability update error:', err)
      toast.error('Failed to update status. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        disabled={saving}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all ${config.badge} ${saving ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'}`}
        aria-label="Change availability status"
        aria-expanded={open}
      >
        <span className={`inline-block h-2 w-2 rounded-full flex-shrink-0 ${config.dot}`} />
        {saving ? 'Saving…' : config.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute left-0 z-20 mt-1 w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black/5 overflow-hidden">
            {(Object.entries(STATUS_CONFIG) as [AvailabilityStatus, typeof STATUS_CONFIG[AvailabilityStatus]][]).map(
              ([status, cfg]) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleSelect(status)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 ${status === current ? 'font-semibold' : 'font-normal'}`}
                >
                  <Circle
                    className={`h-2.5 w-2.5 flex-shrink-0 fill-current ${
                      status === 'available'
                        ? 'text-green-500'
                        : status === 'busy'
                        ? 'text-amber-400'
                        : 'text-gray-400'
                    }`}
                  />
                  <span className="text-gray-700 dark:text-gray-200">{cfg.label}</span>
                  {status === current && (
                    <span className="ml-auto text-xs text-primary-500">✓</span>
                  )}
                </button>
              ),
            )}
          </div>
        </>
      )}
    </div>
  )
}
