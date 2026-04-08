'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import type { WorkerTaxProfile } from '@/types/global'

interface TaxSummaryDashboardProps {
  workerId: string
}

function maskTaxId(taxId: string): string {
  if (taxId.length <= 4) return '****'
  return '*'.repeat(taxId.length - 4) + taxId.slice(-4)
}

export default function TaxSummaryDashboard({ workerId }: TaxSummaryDashboardProps) {
  const [profile, setProfile] = useState<WorkerTaxProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/worker/tax-profile', { headers: { 'x-user-id': workerId } })
      .then(r => r.json())
      .then((data: { profile: WorkerTaxProfile | null }) => setProfile(data.profile))
      .catch(() => setError('Failed to load tax profile'))
      .finally(() => setLoading(false))
  }, [workerId])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax profile...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No tax profile found. Please complete your tax profile setup.
          </p>
        </CardContent>
      </Card>
    )
  }

  const fields = [
    { label: 'Country', value: profile.countryCode },
    { label: 'Classification', value: profile.classification.replace('_', ' ') },
    { label: 'Tax ID', value: maskTaxId(profile.taxId) },
    { label: 'Currency', value: profile.currency },
    { label: 'Tax Year', value: String(profile.taxYear) },
    { label: 'Residency', value: profile.residencyStatus },
  ]

  const consents = [
    { label: 'GDPR', accepted: Boolean(profile.acceptedTerms?.gdprConsent) },
    { label: 'CCPA', accepted: Boolean(profile.acceptedTerms?.ccpaConsent) },
    { label: 'Privacy Act', accepted: Boolean(profile.acceptedTerms?.privacyActConsent) },
  ]

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Tax Profile Summary
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {fields.map(({ label, value }) => (
            <div key={label} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Consent Status
          </p>
          <div className="flex gap-3 flex-wrap">
            {consents.map(({ label, accepted }) => (
              <span
                key={label}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  accepted
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                }`}
              >
                {accepted ? '✓' : '✗'} {label}
              </span>
            ))}
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">
          Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  )
}
