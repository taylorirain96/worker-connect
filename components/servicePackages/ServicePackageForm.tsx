'use client'
import { useState, type FormEvent } from 'react'
import { X, PlusCircle, Trash2 } from 'lucide-react'
import Button from '@/components/ui/Button'
import { JOB_CATEGORIES, NZ_REGIONS } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { ServicePackage } from '@/types'

interface ServicePackageFormProps {
  userId: string
  /** Pre-fill for editing an existing package */
  initial?: Partial<ServicePackage>
  onSaved: (pkg: ServicePackage) => void
  onClose: () => void
}

export default function ServicePackageForm({
  userId,
  initial,
  onSaved,
  onClose,
}: ServicePackageFormProps) {
  const isEdit = !!initial?.id

  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState<number | ''>(initial?.price ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  const [region, setRegion] = useState(initial?.region ?? '')
  const [inclusions, setInclusions] = useState<string[]>(initial?.inclusions ?? [''])
  const [estimatedDurationHours, setEstimatedDurationHours] = useState<number | ''>(
    initial?.estimatedDurationHours ?? 1
  )
  const [instantBook, setInstantBook] = useState(initial?.instantBook ?? false)
  const [instantBookDepositPercent, setInstantBookDepositPercent] = useState<number>(
    initial?.instantBookDepositPercent ?? 20
  )
  const [saving, setSaving] = useState(false)

  function addInclusion() {
    if (inclusions.length >= 8) return toast.error('Maximum 8 inclusions')
    setInclusions((prev) => [...prev, ''])
  }

  function updateInclusion(idx: number, value: string) {
    setInclusions((prev) => prev.map((v, i) => (i === idx ? value : v)))
  }

  function removeInclusion(idx: number) {
    setInclusions((prev) => prev.filter((_, i) => i !== idx))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return toast.error('Please enter a title')
    if (!description.trim()) return toast.error('Please enter a description')
    if (!price || Number(price) <= 0) return toast.error('Please enter a valid price')
    if (!category) return toast.error('Please select a category')
    if (!region) return toast.error('Please select a region')

    const cleanedInclusions = inclusions.map((s) => s.trim()).filter(Boolean)

    setSaving(true)
    try {
      const method = isEdit ? 'PUT' : 'POST'
      const url = isEdit ? `/api/service-packages/${initial!.id}` : '/api/service-packages'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          price: Number(price),
          category,
          region,
          inclusions: cleanedInclusions,
          estimatedDurationHours: Number(estimatedDurationHours) || 1,
          instantBook,
          instantBookDepositPercent: instantBook ? instantBookDepositPercent : undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save package')
      }

      const data = await res.json() as { package: ServicePackage }
      toast.success(isEdit ? 'Package updated' : 'Package created')
      onSaved(data.package)
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error saving package')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl my-4">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {isEdit ? 'Edit Package' : 'New Service Package'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Package title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 1BR apartment clean"
              maxLength={80}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder="What exactly is included? What should the homeowner expect?"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>

          {/* Price + Duration row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fixed price (NZD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={100000}
                step={1}
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="80"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Est. duration (hours)
              </label>
              <input
                type="number"
                min={0.5}
                max={48}
                step={0.5}
                value={estimatedDurationHours}
                onChange={(e) =>
                  setEstimatedDurationHours(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="2"
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Category + Region row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select…</option>
                {JOB_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Region <span className="text-red-500">*</span>
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select…</option>
                {NZ_REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Inclusions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                What&apos;s included (up to 8)
              </label>
              {inclusions.length < 8 && (
                <button
                  type="button"
                  onClick={addInclusion}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Add item
                </button>
              )}
            </div>
            <div className="space-y-2">
              {inclusions.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => updateInclusion(i, e.target.value)}
                    placeholder={`Inclusion ${i + 1}`}
                    maxLength={80}
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  {inclusions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInclusion(i)}
                      className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instant Book settings */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Instant Book Settings</p>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={instantBook}
                onChange={(e) => setInstantBook(e.target.checked)}
                className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Enable Instant Booking — skip the quote queue
              </span>
            </label>
            {instantBook && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Deposit %
                </label>
                <input
                  type="number"
                  min={10}
                  max={50}
                  value={instantBookDepositPercent}
                  onChange={(e) => setInstantBookDepositPercent(Number(e.target.value))}
                  className="w-32 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <p className="text-xs text-gray-400 mt-1">Percentage of total price collected as deposit (10–50%)</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" type="button" onClick={onClose} disabled={saving} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={saving} className="flex-1">
              {isEdit ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
