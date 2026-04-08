'use client'
import { useState } from 'react'
import type { YearlyPlatformSummary } from '@/types'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function FinancialReports() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [data, setData] = useState<YearlyPlatformSummary | null>(null)
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/platform/financials/yearly/${year}`)
      setData(await res.json())
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  const exportCSV = async () => {
    const res = await fetch(`/api/platform/export/accountant/${year}`)
    const text = await res.text()
    const blob = new Blob([text], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `platform-financials-${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y}>{y}</option>)}
        </select>
        <button
          onClick={load}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Load Report'}
        </button>
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-green-700"
        >
          Export CSV
        </button>
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <SummaryCard label="Total Revenue" value={`NZ$${data.totalRevenue.toFixed(2)}`} />
            <SummaryCard label="Total Expenses" value={`NZ$${data.totalExpenses.toFixed(2)}`} />
            <SummaryCard label="Net Profit" value={`NZ$${data.netProfit.toFixed(2)}`} />
            {data.totalGSTOwed !== undefined && (
              <SummaryCard label="Total GST Owed" value={`NZ$${data.totalGSTOwed.toFixed(2)}`} />
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Month</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Revenue</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Commission</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Expenses</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Net Profit</th>
                  {data.byMonth.some(m => m.gst.isRegistered) && (
                    <th className="text-right px-4 py-3 font-medium text-gray-600">GST Owed</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.byMonth.map((m, i) => (
                  <tr key={m.month} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{MONTHS[i]} {year}</td>
                    <td className="px-4 py-3 text-right text-gray-900">NZ${m.netPlatformRevenue.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-gray-600">NZ${m.platformCommission.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-red-600">NZ${m.totalExpenses.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-medium ${m.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      NZ${m.netProfit.toFixed(2)}
                    </td>
                    {data.byMonth.some(m2 => m2.gst.isRegistered) && (
                      <td className="px-4 py-3 text-right text-orange-600">
                        NZ${(m.gst.netGSTOwedToIRD || 0).toFixed(2)}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
