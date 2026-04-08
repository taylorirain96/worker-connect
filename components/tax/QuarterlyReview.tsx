'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { QuarterlyEarnings } from '@/types'
import { TrendingUp, Briefcase, Info } from 'lucide-react'

interface QuarterlyReviewProps {
  workerId: string
  year?: number
  quarter?: 1 | 2 | 3 | 4
}

function getCurrentQuarter(): 1 | 2 | 3 | 4 {
  const month = new Date().getMonth()
  if (month <= 2) return 1
  if (month <= 5) return 2
  if (month <= 8) return 3
  return 4
}

export default function QuarterlyReview({ workerId, year, quarter }: QuarterlyReviewProps) {
  const currentYear = year ?? new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [selectedQuarter, setSelectedQuarter] = useState<1 | 2 | 3 | 4>(quarter ?? getCurrentQuarter())
  const [data, setData] = useState<QuarterlyEarnings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Use the yearly statement endpoint and pick the quarter
        const res = await fetch(`/api/tax/statements/${workerId}/${selectedYear}`, {
          headers: { 'x-user-id': workerId },
        })
        if (!res.ok) throw new Error('Failed to fetch quarterly data')
        const yearly = await res.json()
        const qData = yearly.byQuarter?.find((q: QuarterlyEarnings) => q.quarter === selectedQuarter)
        setData(qData ?? null)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [workerId, selectedYear, selectedQuarter])

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quarterly Review</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Review your earnings by quarter for tax planning</p>
        </div>
        <div className="flex gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={selectedQuarter}
            onChange={(e) => setSelectedQuarter(Number(e.target.value) as 1 | 2 | 3 | 4)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            <option value={1}>Q1 (Jan–Mar)</option>
            <option value={2}>Q2 (Apr–Jun)</option>
            <option value={3}>Q3 (Jul–Sep)</option>
            <option value={4}>Q4 (Oct–Dec)</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm p-4">{error}</div>
      ) : data ? (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Q{data.quarter} {data.year} Net Earnings</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(data.totalEarnings)}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Jobs Completed</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.totalJobs}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Breakdown — Q{data.quarter} {data.year}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.monthBreakdown.map((m) => {
                  const pct = data.totalEarnings > 0 ? (m.earnings / data.totalEarnings) * 100 : 0
                  return (
                    <div key={m.month}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{m.month}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(m.earnings)} · {m.jobs} job{m.jobs !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tax Planning Note */}
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800 flex gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
              <p className="font-medium">Tax Planning Reminder</p>
              <p>
                As a self-employed worker, you may need to make estimated quarterly tax payments to the IRS.
                This is for informational purposes only — worker-connect does not calculate your tax liability.
              </p>
              <p>
                <strong>Recommendation:</strong> Consult a CPA or tax professional to understand your obligations.
              </p>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
          No earnings data for Q{selectedQuarter} {selectedYear}.
        </div>
      )}
    </div>
  )
}
