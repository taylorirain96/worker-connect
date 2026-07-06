'use client'

import { useState, type FormEvent } from 'react'
import { CheckCircle, Clock, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { CertificationRecord } from '@/types'
import { CERT_SUGGESTIONS } from './constants'

interface CertificationsManagerProps {
  certs: CertificationRecord[]
  onAdd: (cert: CertificationRecord) => void
  onRemove: (id: string) => void
  userId: string
}

export default function CertificationsManager({
  certs,
  onAdd,
  onRemove,
  userId,
}: CertificationsManagerProps) {
  const [form, setForm] = useState({
    name: '', issuingOrganization: '', certificateNumber: '', issueDate: '', expirationDate: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Certification name is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/business/verify/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add')
      onAdd(data as CertificationRecord)
      setForm({ name: '', issuingOrganization: '', certificateNumber: '', issueDate: '', expirationDate: '' })
      toast.success('Certification added!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error adding certification')
    } finally {
      setSaving(false)
    }
  }

  async function handleRemove(id: string) {
    try {
      await fetch(`/api/business/verify/certifications?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })
      onRemove(id)
    } catch {
      toast.error('Failed to remove certification')
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Existing certs */}
      {certs.length > 0 && (
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</p>
                {cert.issuingOrganization && (
                  <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>
                )}
                {cert.expirationDate && (
                  <p className="text-xs text-gray-400">Expires {new Date(cert.expirationDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cert.verified ? (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </span>
                )}
                <button
                  onClick={() => handleRemove(cert.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove certification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <form onSubmit={handleAdd} className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Certification
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <select
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select certification…</option>
              {CERT_SUGGESTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issuing Organization</label>
            <Input
              placeholder="e.g. OSHA, EPA"
              value={form.issuingOrganization}
              onChange={(e) => setForm((p) => ({ ...p, issuingOrganization: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Certificate Number</label>
            <Input
              placeholder="e.g. OSHA30-2023-001"
              value={form.certificateNumber}
              onChange={(e) => setForm((p) => ({ ...p, certificateNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issue Date</label>
            <Input
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
            <Input
              type="date"
              value={form.expirationDate}
              onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" disabled={saving} size="sm" variant="outline">
          {saving ? 'Adding…' : 'Add Certification'}
        </Button>
      </form>
    </div>
  )
}
