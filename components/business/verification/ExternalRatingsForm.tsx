'use client'

import { useState, type FormEvent } from 'react'
import { ExternalLink, Star } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import type { ExternalRatingDetails } from '@/types'

interface ExternalRatingsFormProps {
  details: ExternalRatingDetails
  onSave: (data: ExternalRatingDetails) => void
  userId: string
}

export default function ExternalRatingsForm({
  details,
  onSave,
  userId,
}: ExternalRatingsFormProps) {
  const [form, setForm] = useState({
    bbbNumber: details.bbbNumber ?? '',
    bbbLink: details.bbbLink ?? '',
    googleProfileLink: details.googleProfileLink ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.bbbLink && !form.googleProfileLink) {
      toast.error('Provide at least one external profile link')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/business/sync-external-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to sync')
      onSave(data as ExternalRatingDetails)
      toast.success('External ratings synced!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error syncing ratings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          BBB Business Number
        </label>
        <Input
          placeholder="e.g. 0012345"
          value={form.bbbNumber}
          onChange={(e) => setForm((p) => ({ ...p, bbbNumber: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Business Verification Link
        </label>
        <Input
          placeholder="https://www.google.com/maps/place/your-business"
          value={form.bbbLink}
          onChange={(e) => setForm((p) => ({ ...p, bbbLink: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Google Business Profile Link
        </label>
        <Input
          placeholder="https://g.page/your-business"
          value={form.googleProfileLink}
          onChange={(e) => setForm((p) => ({ ...p, googleProfileLink: e.target.value }))}
        />
      </div>
      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Syncing…' : 'Sync Ratings'}
      </Button>

      {(details.bbbRating || details.googleRating) && (
        <div className="flex flex-wrap gap-3 mt-2">
          {details.bbbRating && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">BBB:</span>
              <span className="font-semibold text-green-600">{details.bbbRating}</span>
              {details.bbbReviewCount != null && (
                <span className="text-gray-400">({details.bbbReviewCount} reviews)</span>
              )}
              {details.bbbLink && (
                <a href={details.bbbLink} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
          {details.googleRating && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Google:</span>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{details.googleRating}</span>
              {details.googleReviewCount != null && (
                <span className="text-gray-400">({details.googleReviewCount} reviews)</span>
              )}
              {details.googleProfileLink && (
                <a href={details.googleProfileLink} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  )
}
