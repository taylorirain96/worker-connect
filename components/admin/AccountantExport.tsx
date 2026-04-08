'use client'
import { useState } from 'react'

export default function AccountantExport() {
  const [year, setYear] = useState(new Date().getFullYear())
  const [exporting, setExporting] = useState(false)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch(`/api/platform/export/accountant/${year}`)
      const text = await res.text()
      const blob = new Blob([text], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `platform-financials-${year}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error(e)
      alert('Export failed. Please try again.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Export for Accountant</h3>
      <p className="text-sm text-gray-600 mb-4">
        Download a complete CSV with all monthly revenue, expenses, GST, and profit/loss data. Send this to your NZ tax accountant.
      </p>
      <div className="flex items-center gap-3">
        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
        >
          {exporting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Generating...
            </>
          ) : (
            <>📥 Download CSV</>
          )}
        </button>
      </div>
      <p className="mt-3 text-xs text-gray-500">
        Includes: Monthly breakdown · Expense categories · GST collected/claimable · Net profit · Accountant notes
      </p>
    </div>
  )
}
