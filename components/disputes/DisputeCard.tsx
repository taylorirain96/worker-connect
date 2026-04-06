import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import DisputeStatusBadge from './DisputeStatusBadge'
import { DISPUTE_REASON_LABELS } from '@/lib/services/disputeService'
import type { Dispute } from '@/types'
import { AlertTriangle, Calendar, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Props {
  dispute: Dispute
  href?: string
}

export default function DisputeCard({ dispute, href }: Props) {
  const label = DISPUTE_REASON_LABELS[dispute.reason] ?? dispute.reason
  const ago = formatDistanceToNow(new Date(dispute.createdAt), { addSuffix: true })

  const inner = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" padding="md">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 p-2 rounded-lg bg-red-50 dark:bg-red-900/20 shrink-0">
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {dispute.jobTitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{ago}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DisputeStatusBadge status={dispute.status} />
            {href && <ArrowRight className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
        {dispute.description && (
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {dispute.description}
          </p>
        )}
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{inner}</Link>
  }
  return inner
}
