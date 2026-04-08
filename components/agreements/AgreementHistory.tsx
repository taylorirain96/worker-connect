'use client'

import { useState, useEffect } from 'react'
import type { Agreement } from '@/types'
import AgreementPreview from './AgreementPreview'

interface AgreementHistoryProps {
  userId: string
}

export default function AgreementHistory({ userId }: AgreementHistoryProps) {
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/agreements/user?userId=${userId}`)
      .then(r => r.json())
      .then(d => setAgreements(d.agreements ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [userId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-40 animate-pulse" />
        ))}
      </div>
    )
  }

  if (agreements.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg font-medium">No agreements yet</p>
        <p className="text-sm mt-1">Your signed agreements will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900">My Agreements ({agreements.length})</h2>
      {agreements.map(a => (
        <AgreementPreview key={a.id} agreement={a} />
      ))}
    </div>
  )
}
