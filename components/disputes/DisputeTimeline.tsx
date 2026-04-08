import { formatDistanceToNow } from 'date-fns'
import { FileText, Image, MessageSquare, Paperclip, Shield } from 'lucide-react'
import type { DisputeMessage, DisputeEvidence, DisputeResolution } from '@/types'
import { DISPUTE_DECISION_LABELS } from '@/lib/services/disputeService'

type TimelineItem =
  | { kind: 'message'; data: DisputeMessage }
  | { kind: 'evidence'; data: DisputeEvidence }
  | { kind: 'resolution'; data: DisputeResolution }

function sortTime(item: TimelineItem): number {
  const raw =
    item.kind === 'message' ? item.data.timestamp :
    item.kind === 'evidence' ? item.data.timestamp :
    item.data.timestamp
  return new Date(raw).getTime()
}

const EVIDENCE_ICONS = {
  photo: Image,
  document: FileText,
  message_history: MessageSquare,
  other: Paperclip,
}

interface Props {
  messages: DisputeMessage[]
  evidence: DisputeEvidence[]
  resolution: DisputeResolution | null
  currentUserId?: string
}

export default function DisputeTimeline({ messages, evidence, resolution, currentUserId }: Props) {
  const items: TimelineItem[] = [
    ...messages.map((m): TimelineItem => ({ kind: 'message', data: m })),
    ...evidence.map((e): TimelineItem => ({ kind: 'evidence', data: e })),
    ...(resolution ? [{ kind: 'resolution' as const, data: resolution }] : []),
  ].sort((a, b) => sortTime(a) - sortTime(b))

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 dark:text-gray-600 py-8">
        No activity yet.
      </p>
    )
  }

  return (
    <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3 space-y-6">
      {items.map((item, i) => {
        const ago = formatDistanceToNow(new Date(sortTime(item)), { addSuffix: true })

        if (item.kind === 'message') {
          const msg = item.data
          const isOwn = msg.senderId === currentUserId
          const isMediator = msg.senderRole === 'mediator' || msg.senderRole === 'admin'
          return (
            <li key={`msg-${i}`} className="ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <MessageSquare className="h-3 w-3 text-blue-500" />
              </span>
              <div
                className={`rounded-lg p-3 text-sm ${
                  isMediator
                    ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700'
                    : isOwn
                    ? 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700'
                    : 'bg-gray-50 dark:bg-gray-700/40 border border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">
                    {msg.senderName}
                  </span>
                  {isMediator && (
                    <span className="text-xs text-purple-600 dark:text-purple-400">(Mediator)</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{ago}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{msg.message}</p>
              </div>
            </li>
          )
        }

        if (item.kind === 'evidence') {
          const ev = item.data
          const Icon = EVIDENCE_ICONS[ev.type] ?? Paperclip
          return (
            <li key={`ev-${i}`} className="ml-6">
              <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <Paperclip className="h-3 w-3 text-amber-500" />
              </span>
              <div className="rounded-lg p-3 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="h-3 w-3 text-amber-600" />
                  <span className="font-semibold text-gray-900 dark:text-white text-xs">
                    Evidence uploaded by {ev.uploaderName}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto">{ago}</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{ev.description}</p>
                {ev.fileUrl && (
                  <a
                    href={ev.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400 hover:underline"
                  >
                    <Paperclip className="h-3 w-3" />
                    {ev.fileName ?? 'View file'}
                  </a>
                )}
              </div>
            </li>
          )
        }

        // resolution
        const res = item.data
        return (
          <li key={`res-${i}`} className="ml-6">
            <span className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <Shield className="h-3 w-3 text-green-500" />
            </span>
            <div className="rounded-lg p-3 text-sm bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-semibold text-gray-900 dark:text-white text-xs">
                  Dispute Resolved — {DISPUTE_DECISION_LABELS[res.decision] ?? res.decision}
                </span>
                <span className="text-xs text-gray-400 ml-auto">{ago}</span>
              </div>
              <p className="text-gray-700 dark:text-gray-300">{res.reasoning}</p>
              {res.refundAmount > 0 && (
                <p className="mt-1 text-xs font-medium text-green-700 dark:text-green-400">
                  Refund: ${res.refundAmount.toFixed(2)}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
