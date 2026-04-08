'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Button from '@/components/ui/Button'
import type { DisputeResolutionReason } from '@/types'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DISPUTE_REASONS: { value: DisputeResolutionReason; label: string }[] = [
  { value: 'quality_issues', label: 'Quality issues with work' },
  { value: 'non_payment', label: 'Non-payment' },
  { value: 'non_delivery', label: 'Work not delivered' },
  { value: 'misrepresentation', label: 'Misrepresentation of services' },
  { value: 'safety_concern', label: 'Safety concern' },
  { value: 'overcharge', label: 'Overcharged' },
  { value: 'incomplete_work', label: 'Incomplete work' },
  { value: 'other', label: 'Other' },
]

const schema = z.object({
  reason: z.enum([
    'quality_issues',
    'non_payment',
    'non_delivery',
    'misrepresentation',
    'safety_concern',
    'overcharge',
    'incomplete_work',
    'other',
  ] as const),
  description: z.string().min(20, 'Please describe the issue in at least 20 characters'),
})

type FormData = z.infer<typeof schema>

interface DisputeFormProps {
  jobId: string
  jobTitle: string
  workerId: string
  clientId: string
  filedBy: 'worker' | 'client'
  onSuccess?: (disputeId: string) => void
}

export default function DisputeForm({
  jobId,
  jobTitle,
  workerId,
  clientId,
  filedBy,
  onSuccess,
}: DisputeFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { reason: 'quality_issues', description: '' },
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/disputes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          workerId,
          clientId,
          reason: data.reason,
          description: data.description,
          filedBy,
        }),
      })

      if (!res.ok) {
        const err = (await res.json()) as { error?: string }
        throw new Error(err.error ?? 'Failed to file dispute')
      }

      const result = (await res.json()) as { id: string }
      toast.success('Dispute filed successfully. Our team will review within 3 business days.')
      onSuccess?.(result.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to file dispute'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      {/* Job context */}
      <div className="rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 px-4 py-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Dispute related to</p>
        <p className="text-sm font-medium text-gray-900 dark:text-white">{jobTitle}</p>
        <p className="text-xs text-gray-400">Job ID: {jobId}</p>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
        <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        Filing a dispute will pause payment processing until the issue is resolved.
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Reason for dispute
        </label>
        <select
          {...register('reason')}
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {DISPUTE_REASONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.reason && (
          <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Describe the issue
        </label>
        <textarea
          {...register('description')}
          rows={4}
          placeholder="Please provide as much detail as possible…"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
        {errors.description && (
          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm text-red-700 dark:text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      <Button type="submit" variant="danger" loading={loading} className="w-full gap-2">
        <AlertTriangle className="h-4 w-4" />
        File Dispute
      </Button>
    </form>
  )
}
