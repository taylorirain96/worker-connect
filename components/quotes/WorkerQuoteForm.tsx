'use client'
import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import { Plus, Trash2 } from 'lucide-react'

interface WorkerQuoteFormProps {
  jobId: string
  jobTitle: string
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

export default function WorkerQuoteForm({
  jobId,
  jobTitle,
  employerId,
  workerId,
  workerName,
  workerAvatar,
  onSuccess,
  onCancel,
}: WorkerQuoteFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, control, watch, handleSubmit, formState: { errors } } = useForm<FormValues>({
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

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true)
    setError(null)
    try {
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
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to submit quote')
      }
      const result = await res.json()
      onSuccess?.(result.id)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Travel Distance (miles)</label>
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
  )
}
