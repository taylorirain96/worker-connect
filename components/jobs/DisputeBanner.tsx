'use client'
import { AlertTriangle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react'
import type { EscrowPayment, EscrowDisputeResolution } from '@/types'

interface DisputeBannerProps {
  escrow: Pick<
    EscrowPayment,
    | 'status'
    | 'disputeReason'
    | 'disputedAt'
    | 'disputedBy'
    | 'disputeResolution'
    | 'disputeResolvedAt'
    | 'currency'
    | 'amount'
  >
  currentUserId?: string
  /** Called when the user submits a dispute — parent handles the API call. */
  onOpenDispute?: (reason: string) => void
  /** Whether a dispute-open request is in flight */
  isSubmitting?: boolean
}

const RESOLUTION_LABELS: Record<EscrowDisputeResolution, string> = {
  release_to_worker: 'Funds released to the worker',
  refund_to_employer: 'Funds refunded to the employer',
}

export default function DisputeBanner({
  escrow,
  onOpenDispute,
  isSubmitting,
}: DisputeBannerProps) {
  const isDisputed = escrow.status === 'disputed'
  const isResolved =
    escrow.disputeResolution != null &&
    (escrow.status === 'released' || escrow.status === 'refunded')

  if (!isDisputed && !isResolved) return null

  // ── Resolved state ────────────────────────────────────────────────────────
  if (isResolved) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-semibold">Dispute resolved</p>
            <p>{RESOLUTION_LABELS[escrow.disputeResolution!]}</p>
            {escrow.disputeResolvedAt && (
              <p className="text-green-700">
                Resolved on {new Date(escrow.disputeResolvedAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── Active dispute state ───────────────────────────────────────────────────
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
    >
      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600" aria-hidden="true" />
        <div className="w-full space-y-2">
          <p className="font-semibold text-amber-900">Dispute in progress</p>

          {escrow.disputedAt && (
            <p className="flex items-center gap-1 text-amber-700">
              <Clock className="size-3.5" aria-hidden="true" />
              Opened on {new Date(escrow.disputedAt).toLocaleDateString()}
            </p>
          )}

          {escrow.disputeReason && (
            <div className="rounded border border-amber-200 bg-amber-100/60 p-2">
              <p className="font-medium text-amber-800">Reason provided:</p>
              <p className="mt-0.5 text-amber-700">{escrow.disputeReason}</p>
            </div>
          )}

          <div className="space-y-1 pt-1 text-amber-800">
            <p className="flex items-center gap-1.5 font-medium">
              <AlertTriangle className="size-4" aria-hidden="true" />
              What happens next
            </p>
            <ol className="ml-5 list-decimal space-y-1 text-amber-700">
              <li>Our mediation team has been notified and will review the dispute.</li>
              <li>Both parties may be contacted for additional information.</li>
              <li>
                An admin will issue a final decision: funds will either be released to the
                worker or refunded to the employer.
              </li>
              <li>All automated payments are frozen until the dispute is resolved.</li>
            </ol>
          </div>

          {onOpenDispute && (
            <DisputeForm onOpenDispute={onOpenDispute} isSubmitting={isSubmitting} />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Inline sub-form (shown when a dispute has not yet been opened) ────────────

interface DisputeFormProps {
  onOpenDispute: (reason: string) => void
  isSubmitting?: boolean
}

function DisputeForm({ onOpenDispute, isSubmitting }: DisputeFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        const reason = (fd.get('reason') as string | null)?.trim() ?? ''
        if (reason) onOpenDispute(reason)
      }}
      className="space-y-2 pt-2"
    >
      <label htmlFor="dispute-reason" className="font-medium text-amber-900">
        Describe the issue <span aria-hidden="true">*</span>
      </label>
      <textarea
        id="dispute-reason"
        name="reason"
        required
        minLength={20}
        maxLength={2000}
        rows={4}
        disabled={isSubmitting}
        placeholder="Please describe the dispute in detail (min. 20 characters)…"
        className="w-full rounded border border-amber-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : 'Submit dispute'}
      </button>
    </form>
  )
}
