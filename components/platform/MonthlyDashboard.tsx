'use client'
import { useState, useEffect } from 'react'
import type { PlatformFinancials } from '@/types'

export default function MonthlyDashboard() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [data, setData] = useState<PlatformFinancials | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/platform/financials/monthly/${year}/${month}`)
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [year, month])

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          {months.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading && <p className="text-gray-500 text-sm">Loading...</p>}
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Platform Revenue" value={`NZ$${data.netPlatformRevenue.toFixed(2)}`} sub={`${data.totalJobsCompleted} jobs · ${data.platformCommissionPercentage}% commission`} color="blue" />
          <StatCard label="Commission Earned" value={`NZ$${data.platformCommission.toFixed(2)}`} sub={`Stripe fees: NZ$${data.stripeProcessingFee.toFixed(2)}`} color="green" />
          <StatCard label="Operating Expenses" value={`NZ$${data.totalExpenses.toFixed(2)}`} sub={`GST: NZ$${data.totalExpenseGST.toFixed(2)}`} color="orange" />
          <StatCard
            label="Net Profit"
            value={`NZ$${(data.netProfitAfterGST ?? data.netProfit).toFixed(2)}`}
            sub={data.gst.isRegistered ? 'After GST' : 'Pre-GST registration'}
            color={data.netProfit >= 0 ? 'green' : 'red'}
          />
          {data.gst.isRegistered ? (
            <>
              <StatCard label="GST Collected" value={`NZ$${(data.gst.gstOnPlatformCommission || 0).toFixed(2)}`} sub="On platform commission" color="purple" />
              <StatCard label="GST Owed to IRD" value={`NZ$${(data.gst.netGSTOwedToIRD || 0).toFixed(2)}`} sub="Net after claimable" color="red" />
            </>
          ) : (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-4 sm:col-span-2">
              <p className="text-yellow-800 text-sm font-medium">GST Not Registered</p>
              <p className="text-yellow-700 text-xs mt-1">
                Progress to NZ$60k threshold: {data.gst.thresholdProgress.toFixed(1)}%
              </p>
              <div className="mt-2 h-2 bg-yellow-200 rounded-full">
                <div
                  className="h-2 bg-yellow-500 rounded-full transition-all"
                  style={{ width: `${Math.min(data.gst.thresholdProgress, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    green: 'bg-green-50 border-green-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    purple: 'bg-purple-50 border-purple-200',
  }
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || 'bg-gray-50 border-gray-200'}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{sub}</p>
    </div>
  )
}
