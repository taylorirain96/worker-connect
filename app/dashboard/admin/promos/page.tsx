'use client'
import { useEffect, useState, useCallback } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Tag, Plus, Trash2, ToggleLeft, ToggleRight, RefreshCw } from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'
import type { PromoCode, PromoDiscountType, PromoApplicableTo } from '@/types'

const APPLICABLE_OPTIONS: { value: PromoApplicableTo; label: string }[] = [
  { value: 'all_jobs', label: 'All Jobs' },
  { value: 'first_job', label: 'First Job Only' },
]

function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-NZ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function fmtNZD(amount: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

interface CreateForm {
  code: string
  discountType: PromoDiscountType
  discountAmount: string
  maxUses: string
  expiresAt: string
  applicableTo: PromoApplicableTo
}

const EMPTY_FORM: CreateForm = {
  code: '',
  discountType: 'fixed',
  discountAmount: '',
  maxUses: '',
  expiresAt: '',
  applicableTo: 'all_jobs',
}

export default function AdminPromosPage() {
  const { user } = useAuth()
  const [codes, setCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  const handleCancel = () => {
    setShowForm(false)
    setForm(EMPTY_FORM)
  }

  const loadCodes = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/promos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error('Failed to load')
      const data = await res.json()
      setCodes(data.codes ?? [])
    } catch {
      toast.error('Could not load promo codes')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadCodes()
  }, [loadCodes])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!form.code || !form.discountAmount) {
      toast.error('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          code: form.code,
          discountType: form.discountType,
          discountAmount: parseFloat(form.discountAmount),
          maxUses: form.maxUses ? parseInt(form.maxUses, 10) : 0,
          expiresAt: form.expiresAt || null,
          applicableTo: form.applicableTo,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to create promo code')
        return
      }
      toast.success(`Promo code ${data.code} created!`)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await loadCodes()
    } catch {
      toast.error('Failed to create promo code')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (code: string, currentActive: boolean) => {
    if (!user) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/promos/${encodeURIComponent(code)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ active: !currentActive }),
      })
      if (!res.ok) throw new Error()
      toast.success(`Code ${code} ${!currentActive ? 'activated' : 'deactivated'}`)
      setCodes((prev) => prev.map((c) => (c.code === code ? { ...c, active: !currentActive } : c)))
    } catch {
      toast.error('Failed to update code')
    }
  }

  const deleteCode = async (code: string) => {
    if (!user) return
    if (!confirm(`Delete promo code ${code}? This cannot be undone.`)) return
    try {
      const token = await user.getIdToken()
      const res = await fetch(`/api/promos/${encodeURIComponent(code)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error()
      toast.success(`Code ${code} deleted`)
      setCodes((prev) => prev.filter((c) => c.code !== code))
    } catch {
      toast.error('Failed to delete code')
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Tag className="h-6 w-6 text-indigo-400" />
            Promo Codes
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create and manage discount codes for marketing campaigns.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadCodes}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <Button onClick={() => (showForm ? handleCancel() : setShowForm(true))} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            New Code
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-slate-800 border border-slate-700 rounded-xl p-5 space-y-4"
        >
          <h2 className="text-sm font-semibold text-slate-200">Create Promo Code</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Code */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Code <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SUMMER20"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono uppercase"
              />
            </div>

            {/* Discount type */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Discount Type</label>
              <select
                value={form.discountType}
                onChange={(e) => setForm((f) => ({ ...f, discountType: e.target.value as PromoDiscountType }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="fixed">Fixed NZD amount (e.g. NZ$10)</option>
                <option value="percent">Percentage (e.g. 20%)</option>
              </select>
            </div>

            {/* Discount amount */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {form.discountType === 'percent' ? 'Discount %' : 'Discount Amount (NZD)'}{' '}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                required
                min={form.discountType === 'percent' ? '1' : '0.01'}
                max={form.discountType === 'percent' ? '100' : undefined}
                step={form.discountType === 'percent' ? '1' : '0.01'}
                value={form.discountAmount}
                onChange={(e) => setForm((f) => ({ ...f, discountAmount: e.target.value }))}
                placeholder={form.discountType === 'percent' ? '20' : '10'}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Max uses */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Max Uses <span className="text-slate-500">(0 = unlimited)</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="0"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Expiry date */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Expiry Date <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Applicable to */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Applicable To</label>
              <select
                value={form.applicableTo}
                onChange={(e) => setForm((f) => ({ ...f, applicableTo: e.target.value as PromoApplicableTo }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {APPLICABLE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving} size="sm">
              {saving ? 'Creating…' : 'Create Code'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      ) : codes.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-8 text-center">
          <Tag className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No promo codes yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Code</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Discount</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden sm:table-cell">Applies To</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Uses</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium hidden md:table-cell">Expires</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {codes.map((c) => (
                <tr key={c.code} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-white">{c.code}</td>
                  <td className="px-4 py-3 text-slate-300">
                    {c.discountType === 'percent'
                      ? `${c.discountAmount}%`
                      : fmtNZD(c.discountAmount)}
                  </td>
                  <td className="px-4 py-3 text-slate-300 hidden sm:table-cell">
                    {APPLICABLE_OPTIONS.find((o) => o.value === c.applicableTo)?.label ?? c.applicableTo}
                  </td>
                  <td className="px-4 py-3 text-slate-300 hidden md:table-cell">
                    {c.usedCount} / {c.maxUses > 0 ? c.maxUses : '∞'}
                  </td>
                  <td className="px-4 py-3 text-slate-300 hidden md:table-cell">{fmtDate(c.expiresAt)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={c.active ? 'success' : 'default'} size="sm">
                      {c.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={() => toggleActive(c.code, c.active)}
                        className="p-1.5 rounded hover:bg-slate-600 transition-colors text-slate-400 hover:text-white"
                        title={c.active ? 'Deactivate' : 'Activate'}
                      >
                        {c.active ? (
                          <ToggleRight className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => deleteCode(c.code)}
                        className="p-1.5 rounded hover:bg-red-900/40 transition-colors text-slate-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
