'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import CountrySelector from './CountrySelector'
import type { TaxCalculationResult, EmploymentClassification } from '@/types/global'

interface TaxCalculatorProps {
  workerId?: string
}

export default function TaxCalculator({ workerId: _workerId }: TaxCalculatorProps) {
  const [country, setCountry] = useState('US')
  const [grossIncome, setGrossIncome] = useState('')
  const [classification, setClassification] = useState<EmploymentClassification>('contractor')
  const [state, setState] = useState('')
  const [result, setResult] = useState<TaxCalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCalculate = async () => {
    if (!grossIncome || !country) return
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        country,
        grossIncome,
        classification,
        ...(state && { state }),
      })
      const res = await fetch(`/api/tax/calculate?${params}`)
      const data = await res.json() as { result?: TaxCalculationResult; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Calculation failed')
      setResult(data.result ?? null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const fmt = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Tax Calculator</h2>

        <div className="space-y-4">
          <CountrySelector value={country} onChange={setCountry} label="Country" />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gross Annual Income
            </label>
            <input
              type="number"
              value={grossIncome}
              onChange={e => setGrossIncome(e.target.value)}
              placeholder="e.g. 75000"
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Classification
            </label>
            <select
              value={classification}
              onChange={e => setClassification(e.target.value as EmploymentClassification)}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="contractor">Contractor</option>
              <option value="employee">Employee</option>
              <option value="self_employed">Self Employed</option>
            </select>
          </div>

          {country === 'US' && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                State (optional)
              </label>
              <input
                type="text"
                value={state}
                onChange={e => setState(e.target.value.toUpperCase())}
                placeholder="e.g. CA"
                maxLength={2}
                className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          )}

          <Button onClick={handleCalculate} loading={loading} disabled={!grossIncome || !country}>
            Calculate Taxes
          </Button>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>

        {result && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Tax Breakdown</h3>
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700 p-4 space-y-2">
              {result.breakdown.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {fmt(item.amount)}
                  </span>
                </div>
              ))}
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 flex justify-between text-sm font-semibold">
                <span className="text-gray-900 dark:text-white">Total Tax</span>
                <span className="text-red-600 dark:text-red-400">{fmt(result.totalTax)}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold">
                <span className="text-gray-900 dark:text-white">Net Income</span>
                <span className="text-green-600 dark:text-green-400">{fmt(result.netIncome)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Effective Rate</span>
                <span className="text-gray-900 dark:text-white">
                  {(result.effectiveRate * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
