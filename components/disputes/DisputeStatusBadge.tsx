import Badge from '@/components/ui/Badge'
import type { DisputeResolutionStatus } from '@/types'

const CONFIG: Record<
  DisputeResolutionStatus,
  { label: string; variant: 'default' | 'info' | 'warning' | 'danger' | 'success' }
> = {
  open: { label: 'Open', variant: 'info' },
  under_review: { label: 'Under Review', variant: 'warning' },
  awaiting_evidence: { label: 'Awaiting Evidence', variant: 'warning' },
  resolved: { label: 'Resolved', variant: 'success' },
  closed: { label: 'Closed', variant: 'default' },
  escalated: { label: 'Escalated', variant: 'danger' },
  refunded: { label: 'Refunded', variant: 'success' },
}

export default function DisputeStatusBadge({ status }: { status: DisputeResolutionStatus }) {
  const { label, variant } = CONFIG[status] ?? { label: status, variant: 'default' }
  return <Badge variant={variant}>{label}</Badge>
}
