'use client'

import { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import type { BackgroundCheckDetails } from '@/types'

interface BackgroundCheckSectionProps {
  details: BackgroundCheckDetails
  onInitiate: (data: BackgroundCheckDetails) => void
  userId: string
}

export default function BackgroundCheckSection({
  details,
  onInitiate,
  userId,
}: BackgroundCheckSectionProps) {
  const [loading, setLoading] = useState(false)

  async function handleInitiate() {
    setLoading(true)
    try {
      const res = await fetch('/api/business/verify/background-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({ provider: 'Checkr' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initiate')
      onInitiate({ ...details, status: 'pending', provider: data.provider })
      toast.success('Background check initiated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error initiating background check')
    } finally {
      setLoading(false)
    }
  }

  if (details.status === 'clear') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-green-700 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        Background check cleared
        {details.completedAt && (
          <span className="text-gray-400 ml-1">
            · {new Date(details.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    )
  }

  if (details.status === 'pending') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-yellow-700 dark:text-yellow-400">
        <Clock className="h-4 w-4" />
        Background check in progress via {details.provider ?? 'provider'} — typically 1–3 business days.
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        We partner with <strong>Checkr</strong> to run secure background checks. This helps enterprise
        clients trust your business. Typical turnaround: <strong>1–3 business days</strong>.
      </p>
      <Button size="sm" onClick={handleInitiate} disabled={loading}>
        {loading ? 'Initiating…' : 'Initiate Background Check via Checkr'}
      </Button>
    </div>
  )
}
