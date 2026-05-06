'use client'
import { Camera, MessageSquare } from 'lucide-react'
import { formatRelativeDate } from '@/lib/utils'
import type { JobProgressUpdate } from '@/types'

interface ProgressTimelineProps {
  updates: JobProgressUpdate[]
}

export default function ProgressTimeline({ updates }: ProgressTimelineProps) {
  if (updates.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-6 text-center">
        <MessageSquare className="w-8 h-8 text-slate-500 mx-auto mb-2" />
        <p className="text-sm text-slate-400">No progress updates yet.</p>
      </div>
    )
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-white/10" />

      {updates.map((update, i) => (
        <div key={update.id} className="relative flex gap-4 pb-5 last:pb-0">
          {/* Dot */}
          <div className="relative z-10 w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
            {update.photos && update.photos.length > 0 ? (
              <Camera className="w-3.5 h-3.5 text-indigo-400" />
            ) : (
              <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-sm font-medium text-white">{update.workerName}</span>
              <span className="text-xs text-slate-500">{formatRelativeDate(update.createdAt)}</span>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{update.message}</p>

            {/* Photos */}
            {update.photos && update.photos.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {update.photos.map((url, j) => (
                  <a key={j} href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Progress photo ${j + 1}`}
                      className="w-20 h-20 object-cover rounded-lg border border-white/10 hover:opacity-80 transition-opacity"
                    />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
