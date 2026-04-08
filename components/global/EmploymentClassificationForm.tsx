'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'

interface EmploymentClassificationFormProps {
  workerId: string
  countryCode: string
  onResult?: (result: unknown) => void
}

const FACTORS: Array<{ key: string; label: string; options: Array<{ value: string; label: string }> }> = [
  {
    key: 'control',
    label: 'Who controls how and when you work?',
    options: [
      { value: 'worker', label: 'I decide (worker)' },
      { value: 'company', label: 'The client decides (company)' },
    ],
  },
  {
    key: 'equipment',
    label: 'Who provides your work equipment?',
    options: [
      { value: 'worker', label: 'I provide my own' },
      { value: 'company', label: 'The company provides it' },
    ],
  },
  {
    key: 'exclusivity',
    label: 'Can you work for multiple clients?',
    options: [
      { value: 'worker', label: 'Yes, multiple clients' },
      { value: 'company', label: 'No, exclusive to one company' },
    ],
  },
  {
    key: 'financial_risk',
    label: 'Who bears the financial risk?',
    options: [
      { value: 'worker', label: 'I bear the risk' },
      { value: 'company', label: 'The company bears the risk' },
    ],
  },
  {
    key: 'substitution',
    label: 'Can you send a substitute to do your work?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  {
    key: 'benefits',
    label: 'Do you receive employee benefits (leave, insurance)?',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
]

export default function EmploymentClassificationForm({
  workerId,
  countryCode,
  onResult,
}: EmploymentClassificationFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<unknown>(null)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/compliance/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workerId },
        body: JSON.stringify({ countryCode, factors: answers }),
      })
      const data = await res.json() as unknown
      if (!res.ok) throw new Error('Classification failed')
      setResult(data)
      onResult?.(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const allAnswered = FACTORS.every(f => answers[f.key])

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Employment Classification
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Answer the following questions to determine your employment classification in {countryCode}.
        </p>

        <div className="space-y-5">
          {FACTORS.map(({ key, label, options }) => (
            <div key={key}>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</p>
              <div className="flex gap-3 flex-wrap">
                {options.map(opt => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-2 cursor-pointer px-3 py-2 rounded-lg border text-sm transition-colors ${
                      answers[key] === opt.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name={key}
                      value={opt.value}
                      checked={answers[key] === opt.value}
                      onChange={() => setAnswers(a => ({ ...a, [key]: opt.value }))}
                      className="sr-only"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={!allAnswered}
          className="mt-6"
        >
          Determine Classification
        </Button>

        {Boolean(result) && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Classification complete — review your compliance status above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
