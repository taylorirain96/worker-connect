import Link from 'next/link'
import { Briefcase, Star } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, STATUS_LABELS, formatRelativeDate } from '@/lib/utils'
import QuoteStats from '@/components/quotes/QuoteStats'

interface RecentApplication {
  id: string
  title: string
  employer: string
  status: string
  appliedAt: string
  budget: number
  budgetType: 'fixed' | 'hourly'
}

interface ReviewableJob {
  id: string
  title: string
  completedAt: string
}

interface Props {
  applications: RecentApplication[]
  loadingApps: boolean
  reviewableJobs: ReviewableJob[]
  workerId: string
}

export default function WorkerRecentApplications({
  applications,
  loadingApps,
  reviewableJobs,
  workerId,
}: Props) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Applications</CardTitle>
            <Link href="/dashboard/worker/applications" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>
        </CardHeader>
        <CardContent>
          {loadingApps ? (
            <div className="text-center py-8 text-gray-400 text-sm">Loading…</div>
          ) : applications.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="mt-3">Browse Jobs</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map((app) => {
                const status = STATUS_LABELS[app.status]
                return (
                  <div key={app.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{app.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{formatCurrency(app.budget)} · {formatRelativeDate(app.appliedAt)}</p>
                    </div>
                    <Badge
                      variant={app.status === 'accepted' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}
                    >
                      {status?.label ?? app.status}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <QuoteStats workerId={workerId} />

      {reviewableJobs.length > 0 && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
              <CardTitle>Review an Employer</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Share your experience with employers on jobs you&apos;ve completed.
            </p>
            <div className="space-y-2">
              {reviewableJobs.slice(0, 3).map((job) => (
                <Link
                  key={job.id}
                  href={`/jobs/${job.id}/employer-review`}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                    <p className="text-xs text-gray-500">Completed {formatRelativeDate(job.completedAt)}</p>
                  </div>
                  <Star className="h-3.5 w-3.5 text-yellow-400 flex-shrink-0 ml-2" />
                </Link>
              ))}
              {reviewableJobs.length > 3 && (
                <p className="text-xs text-gray-500 text-center pt-1">+{reviewableJobs.length - 3} more</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
