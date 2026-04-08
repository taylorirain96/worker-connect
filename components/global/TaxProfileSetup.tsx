'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CountrySelector from './CountrySelector'
import CurrencySelector from './CurrencySelector'
import type { EmploymentClassification } from '@/types/global'

interface TaxProfileSetupProps {
  workerId: string
  onComplete?: () => void
}

interface FormData {
  countryCode: string
  taxId: string
  classification: EmploymentClassification
  currency: string
  gdprConsent: boolean
  ccpaConsent: boolean
  privacyActConsent: boolean
}

export default function TaxProfileSetup({ workerId, onComplete }: TaxProfileSetupProps) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>({
    countryCode: '',
    taxId: '',
    classification: 'contractor',
    currency: 'USD',
    gdprConsent: false,
    ccpaConsent: false,
    privacyActConsent: false,
  })
  const [taxIdStatus, setTaxIdStatus] = useState<{ valid: boolean; message: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyTaxId = async () => {
    if (!form.taxId || !form.countryCode) return
    setLoading(true)
    try {
      const res = await fetch('/api/worker/verify-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode: form.countryCode, taxId: form.taxId }),
      })
      const data = await res.json() as { valid: boolean; message: string }
      setTaxIdStatus(data)
    } catch {
      setTaxIdStatus({ valid: false, message: 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/worker/tax-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': workerId,
        },
        body: JSON.stringify({
          countryCode: form.countryCode,
          taxId: form.taxId,
          classification: form.classification,
          currency: form.currency,
          acceptedTerms: {
            gdprConsent: form.gdprConsent,
            ccpaConsent: form.ccpaConsent,
            privacyActConsent: form.privacyActConsent,
            acceptedAt: new Date().toISOString(),
          },
        }),
      })
      if (!res.ok) throw new Error('Failed to save profile')
      onComplete?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Country', 'Tax ID', 'Classification', 'Currency', 'Consent']

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Tax Profile Setup
        </h2>

        <div className="flex gap-1 mb-6">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full ${
                i + 1 <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Step {step} of {steps.length}: {steps[step - 1]}
        </p>

        <div className="space-y-4">
          {step === 1 && (
            <CountrySelector
              value={form.countryCode}
              onChange={v => setForm(f => ({ ...f, countryCode: v }))}
              label="Your Country"
            />
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tax ID / SSN / IRD Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.taxId}
                    onChange={e => {
                      setForm(f => ({ ...f, taxId: e.target.value }))
                      setTaxIdStatus(null)
                    }}
                    placeholder="Enter your tax ID"
                    className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Button variant="outline" onClick={verifyTaxId} loading={loading} size="sm">
                    Verify
                  </Button>
                </div>
              </div>
              {taxIdStatus && (
                <p
                  className={`text-sm ${
                    taxIdStatus.valid
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {taxIdStatus.valid ? '✓ ' : '✗ '}
                  {taxIdStatus.message}
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Employment Classification
              </label>
              <select
                value={form.classification}
                onChange={e =>
                  setForm(f => ({ ...f, classification: e.target.value as EmploymentClassification }))
                }
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="contractor">Independent Contractor</option>
                <option value="employee">Employee</option>
                <option value="self_employed">Self Employed</option>
              </select>
            </div>
          )}

          {step === 4 && (
            <CurrencySelector
              value={form.currency}
              onChange={v => setForm(f => ({ ...f, currency: v }))}
              label="Preferred Currency"
            />
          )}

          {step === 5 && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please review and accept the following agreements:
              </p>
              {[
                { key: 'gdprConsent', label: 'GDPR - General Data Protection Regulation' },
                { key: 'ccpaConsent', label: 'CCPA - California Consumer Privacy Act' },
                { key: 'privacyActConsent', label: 'Privacy Act (NZ/AU)' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form[key as keyof FormData] as boolean}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I agree to the {label}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        <div className="flex justify-between mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          <div className="ml-auto">
            {step < steps.length ? (
              <Button
                onClick={() => setStep(s => s + 1)}
                disabled={step === 1 && !form.countryCode}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={loading}>
                Save Profile
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
