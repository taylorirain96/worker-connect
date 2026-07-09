import { Briefcase, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { formatCurrency } from '@/lib/utils'
import type { UserProfile } from '@/types'

interface RecentApplication {
  id: string
  status: string
}

interface Props {
  applications: RecentApplication[]
  profile: UserProfile | null
}

export default function WorkerStatsOverview({ applications, profile }: Props) {
  const totalApplied = applications.length
  const activeJobs = applications.filter((a) => a.status === 'accepted').length
  const completedJobs = profile?.completedJobs ?? 0
  const totalEarned = profile?.totalEarnings ?? 0

  const stats = [
    { label: 'Jobs Applied', value: String(totalApplied), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: String(activeJobs), icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Completed', value: String(completedJobs), icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Earned', value: formatCurrency(totalEarned), icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} padding="md">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
