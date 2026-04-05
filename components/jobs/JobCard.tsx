import Link from 'next/link'
import { MapPin, Clock, DollarSign, Users, AlertCircle } from 'lucide-react'
import type { Job } from '@/types'
import { formatCurrency, formatRelativeDate, JOB_CATEGORIES, URGENCY_LABELS, STATUS_LABELS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const category = JOB_CATEGORIES.find((c) => c.id === job.category)
  const urgency = URGENCY_LABELS[job.urgency]
  const status = STATUS_LABELS[job.status]

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer group">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-2xl flex-shrink-0">{category?.icon || '🛠️'}</span>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors truncate">
                {job.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.employerName}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <Badge variant={job.status === 'open' ? 'success' : job.status === 'in_progress' ? 'info' : 'default'}>
              {status?.label}
            </Badge>
            {job.urgency === 'emergency' && (
              <Badge variant="danger" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Emergency
              </Badge>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-4">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-1 mb-4">
          {job.skills.slice(0, 3).map((skill) => (
            <span key={skill} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
              {skill}
            </span>
          ))}
          {job.skills.length > 3 && (
            <span className="text-xs text-gray-400">+{job.skills.length - 3} more</span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-green-500" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-red-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-blue-400" />
            <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-orange-400" />
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
