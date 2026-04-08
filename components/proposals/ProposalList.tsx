'use client'

import { useState, useEffect } from 'react'
import type { Proposal } from '@/types'
import ProposalCard from './ProposalCard'

interface ProposalListProps {
  jobId: string
  currentUserId: string
  onAccept?: (proposalId: string) => void
  onReject?: (proposalId: string) => void
  onCounter?: (proposalId: string) => void
}

export default function ProposalList({
  jobId,
  currentUserId,
  onAccept,
  onReject,
  onCounter,
}: ProposalListProps) {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/proposals/${jobId}`)
      .then(r => r.json())
      .then(d => setProposals(d.proposals ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [jobId])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2].map(i => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    )
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p className="text-lg font-medium">No proposals yet</p>
        <p className="text-sm mt-1">Proposals from workers will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="font-semibold text-gray-900">Proposals ({proposals.length})</h2>
      {proposals.map(p => (
        <ProposalCard
          key={p.id}
          proposal={p}
          currentUserId={currentUserId}
          onAccept={onAccept}
          onReject={onReject}
          onCounter={onCounter}
        />
      ))}
    </div>
  )
}
