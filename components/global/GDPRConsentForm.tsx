'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { UserConsent } from '@/types/global'

interface GDPRConsentFormProps {
  userId: string
  onSave?: () => void
}

const CONSENT_FIELDS: Array<{ key: keyof UserConsent; label: string; description: string }> = [
  {
    key: 'gdprConsent',
    label: 'GDPR',
    description: 'EU General Data Protection Regulation',
  },
  {
    key: 'ccpaConsent',
    label: 'CCPA',
    description: 'California Consumer Privacy Act',
  },
  {
    key: 'privacyActNZ',
    label: 'Privacy Act NZ',
    description: 'New Zealand Privacy Act 2020',
  },
  {
    key: 'privacyActAU',
    label: 'Privacy Act AU',
    description: 'Australian Privacy Act 1988',
  },
  {
    key: 'pipedeaConsent',
    label: 'PIPEDA',
    description: 'Canadian Personal Information Protection and Electronic Documents Act',
  },
  {
    key: 'marketingConsent',
    label: 'Marketing',
    description: 'Receive marketing emails and updates',
  },
]

export default function GDPRConsentForm({ userId, onSave }: GDPRConsentFormProps) {
  const [consents, setConsents] = useState<Partial<UserConsent>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/gdpr/consents', { headers: { 'x-user-id': userId } })
      .then(r => r.json())
      .then((data: { consents: UserConsent | null }) => {
        if (data.consents) setConsents(data.consents)
      })
      .catch(() => setError('Failed to load consents'))
      .finally(() => setLoading(false))
  }, [userId])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/gdpr/update-consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
        body: JSON.stringify(consents),
      })
      if (!res.ok) throw new Error('Failed to save consents')
      onSave?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading consents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Privacy Consents
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Manage your data privacy consents below.
        </p>

        <div className="space-y-4">
          {CONSENT_FIELDS.map(({ key, label, description }) => (
            <label key={key} className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(consents[key])}
                onChange={e => setConsents(c => ({ ...c, [key]: e.target.checked }))}
                className="mt-0.5 rounded border-gray-300"
              />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
              </div>
            </label>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button onClick={handleSave} loading={saving} className="mt-4">
          Save Consents
        </Button>
      </CardContent>
    </Card>
  )
}
