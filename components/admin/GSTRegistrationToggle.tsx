'use client'
import { useState, useEffect } from 'react'

export default function GSTRegistrationToggle() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [registeredDate, setRegisteredDate] = useState('')
  const [inputDate, setInputDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    fetch('/api/platform/gst/threshold')
      .then(r => r.json())
      .then(d => {
        setIsRegistered(d.status === 'registered')
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleRegister = async () => {
    if (!inputDate) return
    setSaving(true)
    try {
      const res = await fetch('/api/platform/gst/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationDate: inputDate }),
      })
      if (res.ok) {
        setIsRegistered(true)
        setRegisteredDate(inputDate)
        setShowConfirm(false)
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-gray-500 text-sm">Loading GST registration status...</p>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">GST Registration (NZ)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Register for GST when your annual turnover exceeds NZ$60,000. Once registered, the system will automatically track and calculate 15% GST on platform commissions.
      </p>

      {isRegistered ? (
        <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-medium text-green-800">GST Registered</p>
            {registeredDate && <p className="text-sm text-green-700">Registered as of {registeredDate}</p>}
          </div>
        </div>
      ) : showConfirm ? (
        <div className="space-y-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-yellow-800 text-sm font-medium">⚠️ Confirm GST Registration</p>
          <p className="text-yellow-700 text-xs">
            This will unlock GST features across the system. Platform commissions will have 15% GST charged going forward.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Registration Date</label>
            <input
              type="date"
              value={inputDate}
              onChange={e => setInputDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-48"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRegister}
              disabled={!inputDate || saving}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Confirm Registration'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowConfirm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Register for GST
        </button>
      )}
    </div>
  )
}
