'use client'

import { useState, type FormEvent } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import type { LicenseDetails } from '@/types'
import { LICENSE_TYPES, US_STATES } from './constants'

interface LicenseFormProps {
  onSave: (data: LicenseDetails) => void
  userId: string
}

export default function LicenseForm({ onSave, userId }: LicenseFormProps) {
  const [form, setForm] = useState({
    licenseNumber: '', licenseType: '', state: '', expirationDate: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.licenseNumber || !form.licenseType || !form.state || !form.expirationDate) {
      toast.error('All fields are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/business/verify/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')
      onSave(data as LicenseDetails)
      toast.success('License submitted for verification!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error submitting license')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            License Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. GC-445821-NY"
            value={form.licenseNumber}
            onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            License Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.licenseType}
            onChange={(e) => setForm((p) => ({ ...p, licenseType: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select type…</option>
            {LICENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State / Jurisdiction <span className="text-red-500">*</span>
          </label>
          <select
            value={form.state}
            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select state…</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.expirationDate}
            onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
          />
        </div>
      </div>
      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Submitting…' : 'Submit License'}
      </Button>
    </form>
  )
}
