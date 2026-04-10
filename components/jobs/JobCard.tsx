import Link from 'next/link'
import { MapPin, Clock, DollarSign, Users, Wrench } from 'lucide-react'
import type { Job } from '@/types'
import { formatCurrency, formatRelativeDate, JOB_CATEGORIES, STATUS_LABELS, URGENCY_LABELS, CATEGORY_ICONS } from '@/lib/utils'
import Badge from '@/components/ui/Badge'

interface JobCardProps {
  job: Job
}

export default function JobCard({ job }: JobCardProps) {
  const category = JOB_CATEGORIES.find((c) => c.id === job.category)
  const status = STATUS_LABELS[job.status]
  const isUrgent = job.urgency === 'high' || job.urgency === 'emergency'
  const urgencyLabel = URGENCY_LABELS[job.urgency]
  const CategoryIcon = (category ? CATEGORY_ICONS[category.id] : null) ?? Wrench

  return (
    <Link href={`/jobs/${job.id}`}>
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-all cursor-pointer group ${
          isUrgent
            ? 'border-indigo-500/40 dark:border-indigo-500/40'
            : 'border-slate-700/50 dark:border-slate-700/50'
        }`}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-indigo-500/20">
              <CategoryIcon className="h-4 w-4 text-indigo-400" />
            </div>
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
            {isUrgent && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border border-indigo-500/40 text-indigo-300 bg-indigo-500/10">
                {urgencyLabel?.label}
              </span>
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
            <DollarSign className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {formatCurrency(job.budget)}{job.budgetType === 'hourly' ? '/hr' : ''}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-indigo-400" />
            <span className="truncate">{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{job.applicantsCount} applicant{job.applicantsCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-indigo-400" />
            <span>{formatRelativeDate(job.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
