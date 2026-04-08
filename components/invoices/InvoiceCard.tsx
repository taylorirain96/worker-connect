import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types'
import { FileText } from 'lucide-react'

interface InvoiceStatusBadgeProps {
  status: Invoice['status']
}

const STATUS_CONFIG: Record<Invoice['status'], { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  paid: { label: 'Paid', className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  overdue: { label: 'Overdue', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  completed: { label: 'Completed', className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  cancelled: { label: 'Cancelled', className: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400' },
}

function InvoiceStatusBadge({ status }: InvoiceStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft
  return (
    <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

interface InvoiceCardProps {
  invoice: Invoice
  onClick?: () => void
}

export default function InvoiceCard({ invoice, onClick }: InvoiceCardProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-5 py-4 ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750' : ''}`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
        <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {invoice.jobTitle}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          Due {formatDate(invoice.dueDate)} · INV-{invoice.id.slice(-6).toUpperCase()}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(invoice.total)}
        </span>
        <InvoiceStatusBadge status={invoice.status} />
      </div>
    </div>
  )
}
