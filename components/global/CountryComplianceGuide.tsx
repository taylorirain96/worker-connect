'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import type { ComplianceRequirement } from '@/types/global'

interface CountryComplianceGuideProps {
  countryCode: string
}

const CATEGORY_ICONS: Record<string, string> = {
  tax: '💰',
  privacy: '🔒',
  employment: '👷',
  financial: '🏦',
}

export default function CountryComplianceGuide({ countryCode }: CountryComplianceGuideProps) {
  const [requirements, setRequirements] = useState<ComplianceRequirement | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/compliance/${countryCode}`)
      .then(r => r.json())
      .then((data: { requirements: ComplianceRequirement }) => setRequirements(data.requirements))
      .catch(() => setError('Failed to load compliance requirements'))
      .finally(() => setLoading(false))
  }, [countryCode])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading compliance guide...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !requirements) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Compliance Guide — {requirements.countryName}
        </h2>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
          Last updated: {requirements.lastUpdated}
        </p>

        <div className="space-y-3">
          {requirements.requirements.map(req => (
            <div
              key={req.id}
              className="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-3">
                <span className="text-xl">{CATEGORY_ICONS[req.category] ?? '📋'}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{req.title}</p>
                    {req.mandatory && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                        Mandatory
                      </span>
                    )}
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {req.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{req.description}</p>
                  {req.deadline && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      📅 Deadline: {req.deadline}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
