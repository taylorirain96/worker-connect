'use client'

import { CheckCircle, Clock, Circle } from 'lucide-react'
import type { VerificationRecord, VerificationStatus } from '@/types/reputation'

interface Props {
  record: VerificationRecord
}

type Stage = {
  label: string
  status: 'done' | 'active' | 'pending'
}

function getStages(status: VerificationStatus): Stage[] {
  const all: { label: string; activeAt: VerificationStatus[] }[] = [
    { label: 'Submitted', activeAt: ['pending', 'in_review', 'verified', 'rejected', 'expired'] },
    { label: 'In Review', activeAt: ['in_review', 'verified', 'rejected'] },
    { label: 'Identity Confirmed', activeAt: ['verified'] },
    { label: 'Cleared', activeAt: ['verified'] },
  ]

  const doneMap: Record<VerificationStatus, number> = {
    pending: 1,
    in_review: 2,
    verified: 4,
    rejected: 2,
    expired: 3,
  }

  const doneCount = doneMap[status] ?? 0

  return all.map((s, i) => ({
    label: s.label,
    status: i < doneCount ? 'done' : i === doneCount ? 'active' : 'pending',
  }))
}

export function BackgroundCheckStatus({ record }: Props) {
  const stages = getStages(record.status)

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Background checks are processed by our verified partner. This typically takes 3-5 business
        days.
      </p>
      <ol className="relative border-l border-gray-200 ml-3 space-y-4">
        {stages.map((stage, i) => (
          <li key={i} className="ml-4">
            <span
              className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${
                stage.status === 'done'
                  ? 'bg-green-100'
                  : stage.status === 'active'
                    ? 'bg-yellow-100'
                    : 'bg-gray-100'
              }`}
            >
              {stage.status === 'done' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : stage.status === 'active' ? (
                <Clock className="w-4 h-4 text-yellow-600" />
              ) : (
                <Circle className="w-4 h-4 text-gray-400" />
              )}
            </span>
            <p
              className={`text-sm font-medium ${
                stage.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
              }`}
            >
              {stage.label}
            </p>
          </li>
        ))}
      </ol>
      {record.notes && (
        <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">{record.notes}</p>
      )}
    </div>
  )
}
