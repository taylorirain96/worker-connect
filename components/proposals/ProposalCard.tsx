'use client'

import type { Proposal } from '@/types'

interface ProposalCardProps {
  proposal: Proposal
  currentUserId: string
  onAccept?: (proposalId: string) => void
  onReject?: (proposalId: string) => void
  onCounter?: (proposalId: string) => void
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  negotiating: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
}

export default function ProposalCard({
  proposal,
  currentUserId,
  onAccept,
  onReject,
  onCounter,
}: ProposalCardProps) {
  const isEmployer = currentUserId === proposal.employerId
  const canAct = isEmployer && (proposal.status === 'pending' || proposal.status === 'negotiating')

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-gray-900">{proposal.workerName ?? 'Worker'}</p>
          <p className="text-xs text-gray-500">Submitted {new Date(proposal.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[proposal.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-gray-500 text-xs">Rate</p>
          <p className="font-bold text-gray-900">${proposal.proposedTerms.rate}/hr</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-gray-500 text-xs">Hours</p>
          <p className="font-bold text-gray-900">{proposal.proposedTerms.hours}h</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2 text-center">
          <p className="text-gray-500 text-xs">Duration</p>
          <p className="font-bold text-gray-900">{proposal.proposedTerms.duration}</p>
        </div>
      </div>

      {proposal.proposedTerms.specialRequests && (
        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
          {proposal.proposedTerms.specialRequests}
        </p>
      )}

      {proposal.counterOffers.length > 0 && (
        <div className="border-t pt-2">
          <p className="text-xs font-medium text-gray-500 mb-1">Counter offers ({proposal.counterOffers.length})</p>
          {proposal.counterOffers.slice(-1).map(co => (
            <div key={co.id} className="bg-blue-50 rounded-lg p-2 text-sm">
              <p className="text-blue-800">{co.proposedBy === 'employer' ? 'Employer' : 'Worker'} countered: ${co.rate}/hr · {co.hours}h · {co.duration}</p>
              {co.message && <p className="text-blue-600 mt-1 text-xs">{co.message}</p>}
            </div>
          ))}
        </div>
      )}

      {canAct && (
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onAccept?.(proposal.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Accept
          </button>
          <button
            onClick={() => onCounter?.(proposal.id)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Counter
          </button>
          <button
            onClick={() => onReject?.(proposal.id)}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg px-3 py-1.5 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
