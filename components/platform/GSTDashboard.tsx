'use client'
import { useState, useEffect } from 'react'
import type { GSTReturn } from '@/types'

interface ThresholdData {
  threshold: number
  current: number
  percentage: number
  status: 'not_registered' | 'approaching' | 'registered'
}

export default function GSTDashboard() {
  const [threshold, setThreshold] = useState<ThresholdData | null>(null)
  const [gstReturns, setGstReturns] = useState<GSTReturn[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState(1)

  useEffect(() => {
    fetch('/api/platform/gst/threshold')
      .then(r => r.json())
      .then(setThreshold)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const generateReturn = async () => {
    setGenerating(true)
    try {
      const year = new Date().getFullYear()
      const res = await fetch(`/api/platform/gst/return/${year}/${selectedPeriod}`)
      if (res.ok) {
        const data = await res.json()
        setGstReturns(prev => [data, ...prev])
      } else {
        const err = await res.json()
        alert(err.error || 'Failed to generate return')
      }
    } finally {
      setGenerating(false)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading GST status...</p>

  const isRegistered = threshold?.status === 'registered'
  const isApproaching = (threshold?.percentage || 0) >= 80

  return (
    <div className="space-y-6">
      <div className={`rounded-xl border p-6 ${isRegistered ? 'bg-green-50 border-green-200' : isApproaching ? 'bg-yellow-50 border-yellow-300' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              GST Status: {isRegistered ? '🟢 REGISTERED' : '🔴 NOT REGISTERED'}
            </h3>
            <p className="text-sm text-gray-600 mt-1">NZ GST Registration Threshold: NZ$60,000/year</p>
          </div>
        </div>

        {!isRegistered && threshold && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Annual run rate progress</span>
              <span className="font-medium text-gray-900">
                NZ${threshold.current.toFixed(0)} / NZ${threshold.threshold.toLocaleString()} ({threshold.percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all ${isApproaching ? 'bg-yellow-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(threshold.percentage, 100)}%` }}
              />
            </div>
            {isApproaching && (
              <p className="mt-2 text-yellow-800 text-sm font-medium">
                ⚠️ You are approaching the GST threshold. Consider registering soon.
              </p>
            )}
          </div>
        )}
      </div>

      {isRegistered && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Bimonthly GST Returns</h3>
            <div className="flex items-center gap-2">
              <select
                value={selectedPeriod}
                onChange={e => setSelectedPeriod(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
              >
                <option value={1}>Period 1 (Jan–Feb)</option>
                <option value={2}>Period 2 (Mar–Apr)</option>
                <option value={3}>Period 3 (May–Jun)</option>
                <option value={4}>Period 4 (Jul–Aug)</option>
                <option value={5}>Period 5 (Sep–Oct)</option>
                <option value={6}>Period 6 (Nov–Dec)</option>
              </select>
              <button
                onClick={generateReturn}
                disabled={generating}
                className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Return'}
              </button>
            </div>
          </div>

          {gstReturns.length === 0 ? (
            <p className="text-gray-500 text-sm">No GST returns generated yet. Select a period and click Generate.</p>
          ) : (
            <div className="space-y-3">
              {gstReturns.map(r => (
                <div key={r.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {r.startDate?.slice(0, 7)} to {r.endDate?.slice(0, 7)}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        GST Collected: NZ${r.gstCollected.toFixed(2)} · Claimable: NZ${r.gstClaimable.toFixed(2)} · <strong>Net Owed: NZ${r.netGSTOwed.toFixed(2)}</strong>
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'filed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {r.readyForIRD ? '✅ Ready for IRD' : r.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
        <p className="text-blue-900 text-sm font-medium">📋 Disclaimer</p>
        <p className="text-blue-800 text-xs mt-1">
          This system tracks your financial data for accounting purposes only. All figures should be reviewed by a qualified NZ tax accountant before filing with IRD. The platform does not provide tax advice.
        </p>
      </div>
    </div>
  )
}
