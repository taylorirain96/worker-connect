'use client'

import { useState } from 'react'

interface ESignatureFormProps {
  agreementId: string
  role: 'worker' | 'employer'
  userName: string
  onSigned?: () => void
}

export default function ESignatureForm({ agreementId, role, userName, onSigned }: ESignatureFormProps) {
  const [signature, setSignature] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [signed, setSigned] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSign() {
    if (!agreed || signature.trim() !== userName) {
      setError('Please type your full name exactly as shown and check the agreement box')
      return
    }
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`/api/agreements/${agreementId}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to sign')
      setSigned(true)
      onSigned?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (signed) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h3 className="font-bold text-green-800 text-lg">Agreement Signed!</h3>
        <p className="text-green-700 text-sm mt-1">Your e-signature has been recorded at {new Date().toLocaleString()}</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div>
        <h3 className="text-lg font-bold text-gray-900">E-Signature Required</h3>
        <p className="text-sm text-gray-500 mt-1">Signing as: {role === 'worker' ? 'Worker' : 'Employer'}</p>
      </div>
      {error && <p className="text-red-600 text-sm">{error}</p>}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
        By signing, you agree to all terms outlined in this agreement. Your electronic signature is legally binding.
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type your full name to sign: <span className="font-bold">{userName}</span>
        </label>
        <input
          type="text"
          value={signature}
          onChange={e => setSignature(e.target.value)}
          placeholder={`Type "${userName}" to sign`}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={e => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-gray-700">
          I have read and agree to all terms in this agreement and understand this is a legally binding e-signature.
        </span>
      </label>
      <button
        onClick={handleSign}
        disabled={loading || !agreed || signature.trim() !== userName}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-lg px-4 py-2 text-sm transition-colors"
      >
        {loading ? 'Signing...' : 'Sign Agreement'}
      </button>
    </div>
  )
}
