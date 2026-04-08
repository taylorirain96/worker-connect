import { formatCurrency, formatDate } from '@/lib/utils'
import PaymentStatusBadge from './PaymentStatusBadge'
import type { Payment } from '@/types'
import { Briefcase } from 'lucide-react'

interface PaymentCardProps {
  payment: Payment
  onClick?: () => void
}

export default function PaymentCard({ payment, onClick }: PaymentCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : ''}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
        <Briefcase className="h-5 w-5 text-primary-600 dark:text-primary-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {payment.jobTitle}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {formatDate(payment.createdAt)}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(payment.amount)}
        </span>
        <PaymentStatusBadge status={payment.status} />
      </div>
    </div>
  )
}
