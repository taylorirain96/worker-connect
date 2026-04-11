'use client'
import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { EarningsRecord, YearlyEarnings } from '@/types'
import { Download, TrendingUp, DollarSign, Briefcase } from 'lucide-react'

interface EarningsStatementProps {
  workerId: string
  year?: number
}

function exportCSV(records: EarningsRecord[], filename: string) {
  const header = 'Date,Job Title,Gross,Platform Fee,Net,Status'
  const rows = records.map((r) =>
    [
      new Date(r.recordedDate).toLocaleDateString(),
      `"${r.jobTitle}"`,
      r.grossAmount.toFixed(2),
      r.platformFee.toFixed(2),
      r.netAmount.toFixed(2),
      r.status,
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function EarningsStatement({ workerId, year }: EarningsStatementProps) {
  const currentYear = year ?? new Date().getFullYear()
  const [statement, setStatement] = useState<YearlyEarnings | null>(null)
  const [records, setRecords] = useState<EarningsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [activeTab, setActiveTab] = useState<'overview' | 'records'>('overview')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [stmtRes, recordsRes] = await Promise.all([
          fetch(`/api/tax/statements/${workerId}/${selectedYear}`, {
            headers: { 'x-user-id': workerId },
          }),
          fetch(`/api/tax/earnings/${workerId}?from=${selectedYear}-01-01&to=${selectedYear}-12-31`, {
            headers: { 'x-user-id': workerId },
          }),
        ])
        if (!stmtRes.ok || !recordsRes.ok) throw new Error('Failed to fetch earnings data')
        const [stmt, rec] = await Promise.all([stmtRes.json(), recordsRes.json()])
        setStatement(stmt)
        setRecords(rec.records ?? [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load earnings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [workerId, selectedYear])

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Earnings Statement</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your complete earnings history on QuickTrade</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => exportCSV(records, `earnings-${selectedYear}.csv`)}
            disabled={records.length === 0}
          >
            <Download className="h-4 w-4 mr-1" /> Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-sm p-4">{error}</div>
      ) : statement ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Net Earnings {selectedYear}</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(statement.totalEarnings)}</p>
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
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{statement.totalJobs}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Avg per Job</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {statement.totalJobs > 0 ? formatCurrency(statement.totalEarnings / statement.totalJobs) : '$0'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {(['overview', 'records'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition-colors ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'overview' ? 'Quarterly Overview' : 'All Records'}
              </button>
            ))}
          </div>

          {activeTab === 'overview' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {statement.byQuarter.map((q) => (
                <Card key={q.quarter}>
                  <CardHeader>
                    <CardTitle className="text-base">Q{q.quarter} {q.year}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Net earnings</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(q.totalEarnings)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Jobs</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{q.totalJobs}</span>
                      </div>
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-2 space-y-1">
                        {q.monthBreakdown.map((m) => (
                          <div key={m.month} className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{m.month}</span>
                            <span>{formatCurrency(m.earnings)} ({m.jobs} jobs)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              {records.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No earnings records for {selectedYear}.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 pr-4 text-gray-600 dark:text-gray-400 font-medium">Date</th>
                      <th className="text-left py-2 pr-4 text-gray-600 dark:text-gray-400 font-medium">Job</th>
                      <th className="text-right py-2 pr-4 text-gray-600 dark:text-gray-400 font-medium">Gross</th>
                      <th className="text-right py-2 pr-4 text-gray-600 dark:text-gray-400 font-medium">Fee</th>
                      <th className="text-right py-2 text-gray-600 dark:text-gray-400 font-medium">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {records.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2 pr-4 text-gray-500 dark:text-gray-400">
                          {new Date(r.recordedDate).toLocaleDateString()}
                        </td>
                        <td className="py-2 pr-4 text-gray-900 dark:text-white truncate max-w-[160px]">{r.jobTitle}</td>
                        <td className="py-2 pr-4 text-right text-gray-600 dark:text-gray-400">{formatCurrency(r.grossAmount)}</td>
                        <td className="py-2 pr-4 text-right text-red-500">-{formatCurrency(r.platformFee)}</td>
                        <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(r.netAmount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-xs text-yellow-800 dark:text-yellow-300">
              <strong>Tax Disclaimer:</strong> These earnings statements are provided for informational purposes only.
              You are solely responsible for filing your own taxes, paying self-employment tax, and consulting with a
              qualified CPA. QuickTrade does not provide tax advice.
            </p>
          </div>
        </>
      ) : null}
    </div>
  )
}
