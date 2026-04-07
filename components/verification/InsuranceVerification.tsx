'use client'
import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  provider: z.string().min(2, 'Provider name required'),
  policyNumber: z.string().min(3, 'Policy number required'),
  expiryDate: z.string().min(1, 'Expiry date required'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: { provider: string; policyNumber: string; expiryDate: string }) => Promise<void>
}

export default function InsuranceVerification({ onSubmit }: Props) {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })
  const minDate = useMemo(() => new Date().toISOString().split('T')[0], [])

  const submit = async (data: FormData) => {
    setLoading(true)
    try {
      await onSubmit(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
        <input
          {...register('provider')}
          placeholder="e.g. State Farm"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.provider && <p className="text-xs text-red-500 mt-1">{errors.provider.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
        <input
          {...register('policyNumber')}
          placeholder="e.g. POL-1234567"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.policyNumber && <p className="text-xs text-red-500 mt-1">{errors.policyNumber.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
        <input
          type="date"
          {...register('expiryDate')}
          min={minDate}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.expiryDate && <p className="text-xs text-red-500 mt-1">{errors.expiryDate.message}</p>}
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Submitting...' : 'Submit Insurance'}
      </button>
    </form>
  )
}
