'use client'
import { useState } from 'react'
import { CheckCircle, Clock, AlertCircle, ChevronDown, ChevronUp, Camera, MessageSquare } from 'lucide-react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'
import type { JobMilestone, MilestoneStatus } from '@/types'

const STATUS_CONFIG: Record<MilestoneStatus, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'info'; icon: React.ComponentType<{ className?: string }> }> = {
  pending:     { label: 'Pending',    variant: 'default',  icon: Clock },
  in_progress: { label: 'In Progress', variant: 'info',    icon: Clock },
  submitted:   { label: 'In Review',  variant: 'warning',  icon: AlertCircle },
  approved:    { label: 'Approved',   variant: 'success',  icon: CheckCircle },
  rejected:    { label: 'Changes Needed', variant: 'danger', icon: AlertCircle },
}

interface MilestoneCardProps {
  milestone: JobMilestone
  /** Whether the current viewer is the employer (can approve/reject) */
  isEmployer: boolean
  /** Whether the current viewer is the assigned worker */
  isWorker: boolean
  onSubmit?: (milestoneId: string) => void
  onApprove?: (milestoneId: string) => void
  onReject?: (milestoneId: string) => void
}

function MilestoneCard({ milestone, isEmployer, isWorker, onSubmit, onApprove, onReject }: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[milestone.status]
  const StatusIcon = cfg.icon

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-white/5 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <StatusIcon className={`w-5 h-5 shrink-0 ${milestone.status === 'approved' ? 'text-indigo-400' : milestone.status === 'submitted' ? 'text-yellow-400' : milestone.status === 'rejected' ? 'text-red-400' : 'text-slate-400'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{milestone.title}</p>
          {milestone.dueDate && (
            <p className="text-xs text-slate-400 mt-0.5">Due {formatRelativeDate(milestone.dueDate)}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-sm font-semibold text-indigo-300">{formatCurrency(milestone.amount)}</span>
          <Badge variant={cfg.variant} size="sm">{cfg.label}</Badge>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
          {milestone.description && (
            <p className="text-sm text-slate-300">{milestone.description}</p>
          )}

          {/* Submission note */}
          {milestone.submissionNote && (
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
              <p className="text-xs font-medium text-indigo-300 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" /> Worker&apos;s note
              </p>
              <p className="text-sm text-slate-300">{milestone.submissionNote}</p>
            </div>
          )}

          {/* Submission photos */}
          {milestone.submissionPhotos && milestone.submissionPhotos.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-400 mb-2 flex items-center gap-1">
                <Camera className="w-3 h-3" /> Completion photos
              </p>
              <div className="flex gap-2 flex-wrap">
                {milestone.submissionPhotos.map((url, i) => (
                  <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt={`Milestone photo ${i + 1}`} className="w-20 h-20 object-cover rounded-lg border border-white/10 hover:opacity-80 transition-opacity" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Review note */}
          {milestone.reviewNote && (
            <div className="rounded-lg bg-slate-700/40 border border-white/10 p-3">
              <p className="text-xs font-medium text-slate-400 mb-1">Employer feedback</p>
              <p className="text-sm text-slate-300">{milestone.reviewNote}</p>
            </div>
          )}

          {/* Timestamps */}
          {milestone.approvedAt && (
            <p className="text-xs text-slate-500">Approved {formatRelativeDate(milestone.approvedAt)}</p>
          )}
          {milestone.submittedAt && milestone.status !== 'approved' && (
            <p className="text-xs text-slate-500">Submitted {formatRelativeDate(milestone.submittedAt)}</p>
          )}

          {/* Worker actions */}
          {isWorker && ['pending', 'in_progress', 'rejected'].includes(milestone.status) && onSubmit && (
            <Button size="sm" onClick={() => onSubmit(milestone.id)}>
              Submit for Review
            </Button>
          )}

          {/* Employer actions */}
          {isEmployer && milestone.status === 'submitted' && (
            <div className="flex gap-2">
              {onApprove && (
                <Button size="sm" onClick={() => onApprove(milestone.id)}>
                  Approve & Pay {formatCurrency(milestone.amount)}
                </Button>
              )}
              {onReject && (
                <Button size="sm" variant="secondary" onClick={() => onReject(milestone.id)}>
                  Request Changes
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface MilestoneListProps {
  milestones: JobMilestone[]
  isEmployer: boolean
  isWorker: boolean
  totalBudget?: number
  onSubmit?: (milestoneId: string) => void
  onApprove?: (milestoneId: string) => void
  onReject?: (milestoneId: string) => void
}

export default function MilestoneList({
  milestones,
  isEmployer,
  isWorker,
  totalBudget,
  onSubmit,
  onApprove,
  onReject,
}: MilestoneListProps) {
  if (milestones.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
        <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No milestones set for this job yet.</p>
        {isEmployer && (
          <p className="text-xs text-slate-500 mt-1">Add milestones to break the job into paid stages.</p>
        )}
      </div>
    )
  }

  const approvedTotal = milestones
    .filter((m) => m.status === 'approved')
    .reduce((sum, m) => sum + m.amount, 0)

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0)
  const progressPct = totalMilestoneAmount > 0 ? Math.round((approvedTotal / totalMilestoneAmount) * 100) : 0

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>{progressPct}% complete</span>
          <span>{formatCurrency(approvedTotal)} / {formatCurrency(totalBudget ?? totalMilestoneAmount)} paid</span>
        </div>
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Milestone cards */}
      <div className="space-y-2">
        {milestones.map((m) => (
          <MilestoneCard
            key={m.id}
            milestone={m}
            isEmployer={isEmployer}
            isWorker={isWorker}
            onSubmit={onSubmit}
            onApprove={onApprove}
            onReject={onReject}
          />
        ))}
      </div>
    </div>
  )
}
