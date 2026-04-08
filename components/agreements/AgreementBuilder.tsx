'use client'

import { useState } from 'react'
import type { Agreement } from '@/types'

interface AgreementBuilderProps {
  proposalId: string
  jobId: string
  workerId: string
  employerId: string
  workerName?: string
  employerName?: string
  defaultRate?: number
  defaultHours?: number
  onSuccess?: (agreementId: string) => void
}

export default function AgreementBuilder({
  proposalId,
  jobId,
  workerId,
  employerId,
  workerName,
  employerName,
  defaultRate,
  defaultHours,
  onSuccess,
}: AgreementBuilderProps) {
  const [rate, setRate] = useState(String(defaultRate ?? ''))
  const [hours, setHours] = useState(String(defaultHours ?? ''))
  const [duration, setDuration] = useState('')
  const [paymentSchedule, setPaymentSchedule] = useState('Upon completion')
  const [deliverables, setDeliverables] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCreate() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/agreements/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId,
          jobId,
          workerId,
          employerId,
          workerName,
          employerName,
          agreedTerms: {
            rate: Number(rate),
            hours: Number(hours),
            duration,
            deliverables: deliverables.split('\n').map(d => d.trim()).filter(Boolean),
            payment_schedule: paymentSchedule,
          },
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to create agreement')
      onSuccess?.(data.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5 shadow-sm">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Agreement Builder</h2>
        <p className="text-sm text-gray-500 mt-1">Customize the terms of this agreement</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
          <input
            type="number"
            value={rate}
            onChange={e => setRate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
          <input
            type="number"
            value={hours}
            onChange={e => setHours(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
        <input
          type="text"
          value={duration}
          onChange={e => setDuration(e.target.value)}
          placeholder="e.g. 2 weeks, 3 months"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables (one per line)</label>
        <textarea
          value={deliverables}
          onChange={e => setDeliverables(e.target.value)}
          rows={4}
          placeholder="Complete installation&#10;Clean up site&#10;Final inspection sign-off"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Schedule</label>
        <select
          value={paymentSchedule}
          onChange={e => setPaymentSchedule(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Upon completion</option>
          <option>50% upfront, 50% on completion</option>
          <option>Weekly</option>
          <option>Bi-weekly</option>
          <option>Monthly</option>
          <option>Milestone-based</option>
        </select>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-700">Summary</p>
        <p className="text-gray-600 mt-1">
          ${rate || '0'}/hr × {hours || '0'} hours = <span className="font-semibold">${(Number(rate) * Number(hours)).toFixed(2)}</span>
        </p>
        <p className="text-gray-600">Payment: {paymentSchedule}</p>
      </div>
      <button
        onClick={handleCreate}
        disabled={loading || !rate || !hours || !duration}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Creating...' : 'Create Agreement'}
      </button>
    </div>
  )
}
