'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface TaxFormDownloadProps {
  workerId: string
  countryCode: string
}

interface FormData {
  forms: string[]
  filingDeadline: string
  currency: string
  country: { name: string; flag: string }
}

export default function TaxFormDownload({ workerId: _workerId, countryCode }: TaxFormDownloadProps) {
  const [data, setData] = useState<FormData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/tax/${countryCode}/forms`, { method: 'POST' })
      .then(r => r.json())
      .then((res: FormData & { error?: string }) => {
        if (res.error) throw new Error(res.error)
        setData(res)
      })
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load forms'))
      .finally(() => setLoading(false))
  }, [countryCode])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading tax forms...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !data) {
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
          Required Tax Forms — {data.country.flag} {data.country.name}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Filing deadline: {data.filingDeadline} · Currency: {data.currency}
        </p>

        <div className="space-y-2">
          {data.forms.map((form, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{form}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tax form for {data.country.name}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `https://www.google.com/search?q=${encodeURIComponent(`${form} ${data.country.name} tax form download`)}`
                  window.open(url, '_blank', 'noopener,noreferrer')
                }}
              >
                Find Form
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
