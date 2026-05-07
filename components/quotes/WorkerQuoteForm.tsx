'use client'
import { useState, useRef, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2, Paperclip, X, FileText, Camera, CheckSquare, Square, Copy } from 'lucide-react'
import AIPriceSuggestion from './AIPriceSuggestion'
import { storage } from '@/lib/firebase'
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { trackEvent } from '@/lib/analytics'
import type { PortfolioPhoto, QuoteTemplate } from '@/types'

interface WorkerQuoteFormProps {
  jobId: string
  jobTitle: string
  jobDescription?: string
  category?: string
  location?: string
  employerId: string
  workerId: string
  workerName: string
  workerAvatar?: string
  onSuccess?: (quoteId: string) => void
  onCancel?: () => void
}

interface FormValues {
  basePrice: number
  laborHours: number
  laborRate: number
  materials: { description: string; cost: number }[]
  travelDistance: number
  travelCost: number
  description: string
  timeline: string
  availability: string
  conditions: string
}

interface AttachmentFile {
  file: File
  preview?: string
  progress: number
  url?: string
  error?: string
}

const MAX_FILES = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export default function WorkerQuoteForm({
  jobId,
  jobTitle,
  jobDescription,
  category,
  location,
  employerId,
  workerId,
  workerName,
  workerAvatar,
  onSuccess,
  onCancel,
}: WorkerQuoteFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<AttachmentFile[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Quote template loading
  const [templates, setTemplates] = useState<QuoteTemplate[]>([])
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [loadingTemplates, setLoadingTemplates] = useState(false)

  // Portfolio photo attachment (up to 3)
  const [portfolioPhotos, setPortfolioPhotos] = useState<PortfolioPhoto[]>([])
  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<Set<string>>(new Set())
  const [loadingPortfolio, setLoadingPortfolio] = useState(false)
  const [showPortfolioPicker, setShowPortfolioPicker] = useState(false)

  const MAX_PORTFOLIO_ATTACH = 3

  useEffect(() => {
    if (!workerId) return
    setLoadingPortfolio(true)
    fetch(`/api/portfolio?uid=${workerId}`)
      .then((r) => r.json())
      .then((data: { photos?: PortfolioPhoto[] }) => {
        if (data.photos && data.photos.length > 0) {
          setPortfolioPhotos(data.photos)
        }
      })
      .catch(() => {})
      .finally(() => setLoadingPortfolio(false))
  }, [workerId])

  const togglePortfolioPhoto = (id: string) => {
    setSelectedPortfolioIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else if (next.size < MAX_PORTFOLIO_ATTACH) {
        next.add(id)
      }
      return next
    })
  }

  const openTemplatePicker = async () => {
    if (!workerId) return
    setShowTemplatePicker(true)
    if (templates.length > 0) return
    setLoadingTemplates(true)
    try {
      const res = await fetch('/api/quote-templates', {
        headers: { 'x-user-id': workerId },
      })
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json() as { templates: QuoteTemplate[] }
      setTemplates(data.templates)
    } catch {
      // Silent fail – template picker is optional
    } finally {
      setLoadingTemplates(false)
    }
  }

  const applyTemplate = (t: QuoteTemplate) => {
    setValue('basePrice', t.basePrice)
    setValue('laborHours', t.laborHours)
    setValue('laborRate', t.laborRate)
    setValue('travelCost', t.travelCost)
    setValue('description', t.description)
    setValue('timeline', t.timeline)
    setValue('conditions', t.conditions)
    if (Array.isArray(t.materials) && t.materials.length > 0) {
      setValue('materials', t.materials)
    }
    setShowTemplatePicker(false)
  }

  const { register, control, watch, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      basePrice: 0,
      laborHours: 0,
      laborRate: 0,
      materials: [],
      travelDistance: 0,
      travelCost: 0,
      description: '',
      timeline: '',
      availability: '',
      conditions: '',
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'materials' })

  const values = watch()
  const materialsTotal = values.materials.reduce((s, m) => s + (Number(m.cost) || 0), 0)
  const laborTotal = (Number(values.laborHours) || 0) * (Number(values.laborRate) || 0)
  const travelCost = Number(values.travelCost) || 0
  const totalPrice = (Number(values.basePrice) || 0) + materialsTotal + laborTotal + travelCost

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (attachments.length + files.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed`)
      return
    }
    const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
    if (oversized.length > 0) {
      setError(`Files must be under 10 MB each: ${oversized.map((f) => f.name).join(', ')}`)
      return
    }
    setError(null)

    const newAttachments: AttachmentFile[] = files.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
    }))

    setAttachments((prev) => [...prev, ...newAttachments])

    // Upload each file
    newAttachments.forEach((att, i) => {
      const globalIdx = attachments.length + i
      if (!storage) {
        // Storage not available — store as pending, submit will fail gracefully
        return
      }
      const path = `quotes/${workerId}/${Date.now()}/${att.file.name}`
      const sRef = storageRef(storage, path)
      const task = uploadBytesResumable(sRef, att.file)

      task.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          setAttachments((prev) => {
            const next = [...prev]
            if (next[globalIdx]) next[globalIdx] = { ...next[globalIdx], progress }
            return next
          })
        },
        (uploadErr) => {
          setAttachments((prev) => {
            const next = [...prev]
            if (next[globalIdx]) next[globalIdx] = { ...next[globalIdx], error: uploadErr.message }
            return next
          })
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref)
          setAttachments((prev) => {
            const next = [...prev]
            if (next[globalIdx]) next[globalIdx] = { ...next[globalIdx], url, progress: 100 }
            return next
          })
        }
      )
    })

    // Reset input so same file can be re-selected if removed
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const next = [...prev]
      const att = next[idx]
      if (att?.preview) URL.revokeObjectURL(att.preview)
      next.splice(idx, 1)
      return next
    })
  }

  const onSubmit = async (data: FormValues) => {
    // Check for pending uploads
    const pendingUploads = attachments.filter((a) => !a.url && !a.error)
    if (pendingUploads.length > 0) {
      setError('Please wait for all files to finish uploading')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const uploadedAttachments = attachments
        .filter((a) => a.url)
        .map((a) => ({
          url: a.url!,
          name: a.file.name,
          type: (a.file.type.startsWith('image/') ? 'image' : 'document') as 'image' | 'document',
        }))

      const selectedPortfolioPhotos = portfolioPhotos
        .filter((p) => selectedPortfolioIds.has(p.id))
        .map((p) => ({ id: p.id, url: p.url, title: p.title }))

      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workerId },
        body: JSON.stringify({
          jobId,
          jobTitle,
          employerId,
          workerId,
          workerName,
          workerAvatar,
          basePrice: Number(data.basePrice),
          laborHours: data.laborHours ? Number(data.laborHours) : undefined,
          laborRate: data.laborRate ? Number(data.laborRate) : undefined,
          materials: (() => {
            const valid = data.materials
              .filter((m) => m.description.trim() && Number(m.cost) > 0)
              .map((m) => ({ description: m.description.trim(), cost: Number(m.cost) }))
            return valid.length > 0 ? valid : undefined
          })(),
          travel: data.travelCost ? { distance: Number(data.travelDistance), cost: Number(data.travelCost) } : undefined,
          description: data.description,
          timeline: data.timeline || undefined,
          availability: data.availability || undefined,
          conditions: data.conditions || undefined,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
          portfolioPhotos: selectedPortfolioPhotos.length > 0 ? selectedPortfolioPhotos : undefined,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to submit quote')
      }
      const result = await res.json()
      trackEvent('quote_submitted', { job_id: jobId, job_title: jobTitle, value: Number(data.basePrice) })
      onSuccess?.(result.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Submit Quote for: {jobTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

          {/* AI Price Suggestion */}
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <AIPriceSuggestion
                jobTitle={jobTitle}
                jobDescription={jobDescription}
                category={category}
                location={location}
                workerId={workerId}
                onUsePrice={(price) => setValue('basePrice', price)}
              />
            </div>
            <button
              type="button"
              onClick={() => void openTemplatePicker()}
              className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
            >
              <Copy className="h-3.5 w-3.5" />
              Load Template
            </button>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Base Price ($) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              {...register('basePrice', { required: 'Base price is required', min: { value: 0, message: 'Must be non-negative' } })}
            />
            {errors.basePrice && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
          </div>

          {/* Labor */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Labor Hours</label>
              <input
                type="number"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('laborHours', { min: 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Labor Rate ($/hr)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('laborRate', { min: 0 })}
              />
            </div>
          </div>

          {/* Materials */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Materials</label>
              <button
                type="button"
                onClick={() => append({ description: '', cost: 0 })}
                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
              >
                <Plus className="h-4 w-4" /> Add Material
              </button>
            </div>
            <div className="space-y-2">
              {fields.map((field, idx) => (
                <div key={field.id} className="flex gap-2 items-center">
                  <input
                    placeholder="Description"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register(`materials.${idx}.description`)}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Cost"
                    className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register(`materials.${idx}.cost`, { min: 0 })}
                  />
                  <button type="button" onClick={() => remove(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Travel */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Distance (km)</label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('travelDistance', { min: 0 })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Cost ($)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('travelCost', { min: 0 })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe your approach, experience, and why you're the best fit..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          {/* Timeline & Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeline</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('timeline')}
              >
                <option value="">Select...</option>
                <option value="Same day">Same day</option>
                <option value="Next day">Next day</option>
                <option value="This week">This week</option>
                <option value="Next week">Next week</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Availability</label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                {...register('availability')}
              >
                <option value="">Select...</option>
                <option value="Available now">Available now</option>
                <option value="Available tomorrow">Available tomorrow</option>
                <option value="Available this week">Available this week</option>
                <option value="Check my schedule">Check my schedule</option>
              </select>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Special Conditions / Notes</label>
            <textarea
              rows={2}
              placeholder="Any special requirements, exclusions, or notes..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              {...register('conditions')}
            />
          </div>

          {/* Attachments */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Attach Photos / Documents
                <span className="ml-1 text-xs text-gray-400">({attachments.length}/{MAX_FILES})</span>
              </label>
              {attachments.length < MAX_FILES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Paperclip className="h-4 w-4" /> Add File
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group">
                    {att.preview ? (
                      <div className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={att.preview} alt={att.file.name} className="w-full h-full object-cover" />
                        {att.progress < 100 && !att.error && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-white text-xs font-medium">{att.progress}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex flex-col items-center justify-center gap-1 px-1">
                        <FileText className="h-6 w-6 text-gray-400" />
                        <span className="text-xs text-gray-500 text-center truncate w-full px-1">{att.file.name}</span>
                        {att.progress < 100 && !att.error && (
                          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1">
                            <div className="bg-primary-500 h-1 rounded-full" style={{ width: `${att.progress}%` }} />
                          </div>
                        )}
                      </div>
                    )}
                    {att.error && (
                      <span className="absolute -bottom-5 left-0 text-xs text-red-500 whitespace-nowrap">Upload failed</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Up to {MAX_FILES} files, 10 MB each. Images or PDFs.
            </p>
          </div>

          {/* Portfolio Photos — Examples of my work */}
          {portfolioPhotos.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Attach Portfolio Examples
                  <span className="ml-1 text-xs text-gray-400">({selectedPortfolioIds.size}/{MAX_PORTFOLIO_ATTACH})</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPortfolioPicker((v) => !v)}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Camera className="h-4 w-4" />
                  {showPortfolioPicker ? 'Hide' : 'Choose photos'}
                </button>
              </div>
              {showPortfolioPicker && (
                <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Select up to {MAX_PORTFOLIO_ATTACH} photos from your portfolio to show as examples of your work.
                  </p>
                  {loadingPortfolio ? (
                    <div className="text-xs text-gray-400">Loading…</div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {portfolioPhotos.map((photo) => {
                        const selected = selectedPortfolioIds.has(photo.id)
                        const disabled = !selected && selectedPortfolioIds.size >= MAX_PORTFOLIO_ATTACH
                        return (
                          <button
                            key={photo.id}
                            type="button"
                            disabled={disabled}
                            onClick={() => togglePortfolioPhoto(photo.id)}
                            className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                              selected
                                ? 'border-primary-500 opacity-100'
                                : disabled
                                ? 'border-gray-200 dark:border-gray-700 opacity-40 cursor-not-allowed'
                                : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 opacity-80 hover:opacity-100'
                            }`}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo.url} alt={photo.title} className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 flex items-end ${selected ? 'bg-primary-500/20' : ''}`}>
                              <div className="w-full bg-gradient-to-t from-black/60 to-transparent p-1.5">
                                <p className="text-white text-xs truncate leading-tight">{photo.title}</p>
                              </div>
                            </div>
                            <div className="absolute top-1 right-1">
                              {selected
                                ? <CheckSquare className="h-4 w-4 text-white drop-shadow" />
                                : <Square className="h-4 w-4 text-white/70 drop-shadow" />
                              }
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              {selectedPortfolioIds.size > 0 && !showPortfolioPicker && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {portfolioPhotos
                    .filter((p) => selectedPortfolioIds.has(p.id))
                    .map((p) => (
                      <div key={p.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-primary-300 dark:border-primary-700">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => togglePortfolioPhoto(p.id)}
                          className="absolute top-0.5 right-0.5 bg-red-500 rounded-full p-0.5 text-white"
                        >
                          <X className="h-2.5 w-2.5" />
                        </button>
                      </div>
                    ))}
                  <p className="self-center text-xs text-gray-500 dark:text-gray-400">
                    {selectedPortfolioIds.size} example{selectedPortfolioIds.size !== 1 ? 's' : ''} of my work attached
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Show homeowners examples of your best work to increase your chances of winning this job.
              </p>
            </div>
          )}

          {/* Total Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-gray-900 dark:text-white text-sm">Quote Summary</h4>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
              <span>Base price</span>
              <span>{formatCurrency(Number(values.basePrice) || 0)}</span>
            </div>
            {laborTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Labor ({values.laborHours}h × ${values.laborRate}/hr)</span>
                <span>{formatCurrency(laborTotal)}</span>
              </div>
            )}
            {materialsTotal > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Materials</span>
                <span>{formatCurrency(materialsTotal)}</span>
              </div>
            )}
            {travelCost > 0 && (
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Travel</span>
                <span>{formatCurrency(travelCost)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between font-semibold text-gray-900 dark:text-white">
              <span>Total</span>
              <span>{formatCurrency(totalPrice)}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            This quote is valid for 7 days. The employer will be notified and can accept or reject your quote.
          </p>

          <div className="flex gap-3">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            )}
            <Button type="submit" loading={submitting} className="flex-1">
              Submit Quote ({formatCurrency(totalPrice)})
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>

      {/* Template picker modal */}
      {showTemplatePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowTemplatePicker(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Load Quote Template</h2>
              <button
                onClick={() => setShowTemplatePicker(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              {loadingTemplates && (
                <p className="text-sm text-gray-400 text-center py-4">Loading templates…</p>
              )}
              {!loadingTemplates && templates.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No templates saved yet.</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                    Save templates from{' '}
                    <a
                      href="/dashboard/worker/quote-templates"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      Quote Templates
                    </a>.
                  </p>
                </div>
              )}
              {!loadingTemplates && templates.length > 0 && (
                <ul className="space-y-2">
                  {templates.map((t) => {
                    const total = t.basePrice + t.laborHours * t.laborRate + (t.materials ?? []).reduce((s, m) => s + m.cost, 0) + t.travelCost
                    return (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => applyTemplate(t)}
                          className="w-full text-left px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</span>
                            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                              ${total.toLocaleString('en-NZ')}
                            </span>
                          </div>
                          {t.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{t.description}</p>
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

