import Link from 'next/link'
import { formatCurrency, formatRelativeDate } from '@/lib/utils'

interface AwaitingPaymentJob {
  id: string
  title: string
  budget: number
  updatedAt: string
}

interface DisputedWorkerJob {
  id: string
  title: string
  lastModified: string
}

interface Props {
  awaitingPaymentJobs: AwaitingPaymentJob[]
  disputedJobs: DisputedWorkerJob[]
}

export default function WorkerJobAlerts({ awaitingPaymentJobs, disputedJobs }: Props) {
  return (
    <>
      {awaitingPaymentJobs.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-base font-semibold text-green-700 dark:text-green-400">💰 Awaiting Payment Release</p>
          {awaitingPaymentJobs.map((job) => (
            <div
              key={job.id}
              className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl p-4"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {formatCurrency(job.budget)} · Updated {formatRelativeDate(job.updatedAt)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/dashboard/worker/jobs/${job.id}/milestones`}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 whitespace-nowrap hover:opacity-80 transition-opacity"
                >
                  Milestones
                </Link>
                <Link
                  href={`/jobs/${job.id}`}
                  className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 whitespace-nowrap hover:opacity-80 transition-opacity"
                >
                  Request Release →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {disputedJobs.length > 0 && (
        <div className="mb-6 space-y-3">
          <p className="text-base font-semibold text-orange-700 dark:text-orange-400">⚠️ Jobs Under Dispute</p>
          {disputedJobs.map((job) => (
            <Link
              key={job.id}
              href={`/jobs/${job.id}`}
              className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-xl p-4 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{formatRelativeDate(job.lastModified)}</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 whitespace-nowrap">
                Under Review
              </span>
            </Link>
          ))}
        </div>
      )}
    </>
  )
}
