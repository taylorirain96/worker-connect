'use client'

import { useState, type FormEvent } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import type { InsuranceDetails } from '@/types'

interface InsuranceFormProps {
  onSave: (data: InsuranceDetails) => void
  userId: string
}

export default function InsuranceForm({ onSave, userId }: InsuranceFormProps) {
  const [form, setForm] = useState({
    hasGeneralLiability: false,
    generalLiabilityPolicyNumber: '',
    generalLiabilityExpiration: '',
    generalLiabilityCoverage: '',
    hasWorkersComp: false,
    workersCompPolicyNumber: '',
    workersCompExpiration: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.hasGeneralLiability && !form.hasWorkersComp) {
      toast.error('Select at least one insurance type')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        generalLiabilityCoverage: form.generalLiabilityCoverage
          ? Number(form.generalLiabilityCoverage)
          : undefined,
      }
      const res = await fetch('/api/business/verify/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')
      onSave(data as InsuranceDetails)
      toast.success('Insurance details submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error submitting insurance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* General Liability */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasGeneralLiability}
            onChange={(e) => setForm((p) => ({ ...p, hasGeneralLiability: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">General Liability Insurance</span>
        </label>
        {form.hasGeneralLiability && (
          <div className="grid sm:grid-cols-3 gap-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Policy Number</label>
              <Input
                placeholder="GL-XXXXXXX"
                value={form.generalLiabilityPolicyNumber}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityPolicyNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
              <Input
                type="date"
                value={form.generalLiabilityExpiration}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityExpiration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coverage Amount ($)</label>
              <Input
                type="number"
                placeholder="e.g. 2000000"
                value={form.generalLiabilityCoverage}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityCoverage: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Workers' Comp */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasWorkersComp}
            onChange={(e) => setForm((p) => ({ ...p, hasWorkersComp: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Workers&apos; Compensation Insurance</span>
        </label>
        {form.hasWorkersComp && (
          <div className="grid sm:grid-cols-2 gap-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Policy Number</label>
              <Input
                placeholder="WC-XXXXXXX"
                value={form.workersCompPolicyNumber}
                onChange={(e) => setForm((p) => ({ ...p, workersCompPolicyNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
              <Input
                type="date"
                value={form.workersCompExpiration}
                onChange={(e) => setForm((p) => ({ ...p, workersCompExpiration: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Submitting…' : 'Submit Insurance Details'}
      </Button>
    </form>
  )
}
