'use client'

import { useState } from 'react'
import { ExternalLink, CheckCircle } from 'lucide-react'

interface Props {
  workerId: string
  onComplete: () => void
}

export function BBBIntegration({ workerId: _workerId, onComplete }: Props) {
  const [bbbUrl, setBbbUrl] = useState('')
  const [googleUrl, setGoogleUrl] = useState('')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!bbbUrl && !googleUrl) return
    setSubmitted(true)
    setTimeout(onComplete, 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-green-600">
        <CheckCircle className="w-12 h-12" />
        <p className="font-medium">Business profiles submitted for review</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Link your BBB or Google Business profile to boost trust. At least one is required.
      </p>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          BBB Business Profile URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={bbbUrl}
            onChange={(e) => setBbbUrl(e.target.value)}
            placeholder="https://www.bbb.org/..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {bbbUrl && (
            <a href={bbbUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
            </a>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Google Business Profile URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={googleUrl}
            onChange={(e) => setGoogleUrl(e.target.value)}
            placeholder="https://g.page/..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          {googleUrl && (
            <a href={googleUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 text-gray-400 hover:text-indigo-600" />
            </a>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!bbbUrl && !googleUrl}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        Link Profiles
      </button>
    </form>
  )
}
