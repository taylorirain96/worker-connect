'use client'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { TaxForm1099NEC } from '@/types'
import { FileText, Send, CheckCircle, Archive } from 'lucide-react'

interface TaxFormsPortalProps {
  workerId: string
  workerName: string
  workerEmail: string
  workerAddress: string
}

const STATUS_CONFIG = {
  generated: { label: 'Ready', color: 'text-blue-600 dark:text-blue-400', icon: FileText },
  sent: { label: 'Sent', color: 'text-green-600 dark:text-green-400', icon: CheckCircle },
  archived: { label: 'Archived', color: 'text-gray-500 dark:text-gray-400', icon: Archive },
}

export default function TaxFormsPortal({ workerId, workerName, workerEmail, workerAddress }: TaxFormsPortalProps) {
  const [forms, setForms] = useState<TaxForm1099NEC[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState<string | null>(null)
  const currentYear = new Date().getFullYear()

  const fetchForms = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch for the last 5 years
      const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 - i)
      const results = await Promise.all(
        years.map((y) =>
          fetch(
            `/api/tax/1099/${workerId}/${y}?name=${encodeURIComponent(workerName)}&email=${encodeURIComponent(workerEmail)}&address=${encodeURIComponent(workerAddress)}`,
            { headers: { 'x-user-id': workerId } }
          ).then((r) => (r.ok ? r.json() : null))
        )
      )
      const valid = results.filter(Boolean) as TaxForm1099NEC[]
      // Only show forms with earnings >= $600 (IRS threshold)
      setForms(valid.filter((f) => f.boxNC2 >= 600))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load tax forms')
    } finally {
      setLoading(false)
    }
  }, [workerId, workerName, workerEmail, workerAddress, currentYear])

  useEffect(() => {
    fetchForms()
  }, [fetchForms])

  const handleSend = async (formId: string) => {
    setSending(formId)
    try {
      const res = await fetch('/api/tax/1099/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workerId },
        body: JSON.stringify({ form1099Id: formId }),
      })
      if (!res.ok) throw new Error('Failed to send form')
      await fetchForms()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send')
    } finally {
      setSending(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tax Forms (1099-NEC)</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Your annual 1099-NEC forms for tax filing. Share with your accountant or tax software.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-28 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-3 text-gray-400" />
            <p>No 1099-NEC forms available yet.</p>
            <p className="text-xs mt-1">Forms are generated after the end of each calendar year for earnings ≥ $600.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {forms.map((form) => {
            const status = STATUS_CONFIG[form.status]
            const StatusIcon = status.icon
            return (
              <Card key={form.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          1099-NEC — Tax Year {form.year}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Nonemployee Compensation: <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(form.boxNC2)}</span>
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <StatusIcon className={`h-3.5 w-3.5 ${status.color}`} />
                          <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                          {form.sentAt && (
                            <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                              Sent {new Date(form.sentAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {form.status === 'generated' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSend(form.id)}
                          loading={sending === form.id}
                        >
                          <Send className="h-3.5 w-3.5 mr-1" /> Send to Email
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 grid grid-cols-2 gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Issued By</p>
                      <p>{form.businessName}</p>
                      <p>EIN: {form.businessEIN}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Issued To</p>
                      <p>{form.workerName}</p>
                      <p>{form.workerEmail}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Form ID</p>
                      <p className="font-mono">{form.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-300 mb-0.5">Generated</p>
                      <p>{new Date(form.generatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-300 space-y-1">
        <p className="font-semibold">What to do with your 1099-NEC:</p>
        <ol className="list-decimal list-inside space-y-0.5">
          <li>Download or receive via email</li>
          <li>Share with your accountant or tax software (TurboTax, H&R Block, etc.)</li>
          <li>Include in your annual tax return as nonemployee compensation</li>
        </ol>
        <p className="mt-2">
          You are responsible for filing your own taxes, paying self-employment tax, and tracking business deductions.
          Consult a CPA if you need guidance.
        </p>
      </div>
    </div>
  )
}
