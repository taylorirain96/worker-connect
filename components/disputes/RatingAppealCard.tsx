import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import type { RatingAppeal } from '@/types'
import { Star, ArrowRight, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const STATUS_CONFIG: Record<
  RatingAppeal['status'],
  { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }
> = {
  pending: { label: 'Pending', variant: 'info' },
  under_review: { label: 'Under Review', variant: 'warning' },
  approved: { label: 'Approved', variant: 'success' },
  denied: { label: 'Denied', variant: 'danger' },
}

interface Props {
  appeal: RatingAppeal
  href?: string
}

export default function RatingAppealCard({ appeal, href }: Props) {
  const { label, variant } = STATUS_CONFIG[appeal.status] ?? { label: appeal.status, variant: 'default' }
  const ago = formatDistanceToNow(new Date(appeal.createdAt), { addSuffix: true })

  const inner = (
    <Card className="hover:shadow-md transition-shadow cursor-pointer" padding="md">
      <CardContent>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="mt-0.5 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 shrink-0">
              <Star className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {appeal.jobTitle}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Rating: {appeal.currentRating}/5
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400 dark:text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{ago}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={variant}>{label}</Badge>
            {href && <ArrowRight className="h-4 w-4 text-gray-400" />}
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {appeal.appealReason}
        </p>
        {appeal.mediatorNote && (
          <div className="mt-2 p-2 rounded bg-purple-50 dark:bg-purple-900/20 text-xs text-purple-700 dark:text-purple-300">
            <span className="font-medium">Mediator note:</span> {appeal.mediatorNote}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (href) return <Link href={href}>{inner}</Link>
  return inner
}
