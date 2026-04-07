'use client'
import { useState } from 'react'
import InvoiceCard from '@/components/invoices/InvoiceCard'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types'
import { FileText, Download, Search, PlusCircle } from 'lucide-react'
import toast from 'react-hot-toast'

type StatusFilter = 'all' | Invoice['status']

interface InvoiceManagerProps {
  invoices: Invoice[]
  onCreateInvoice?: () => void
}

const FILTER_TABS: StatusFilter[] = ['all', 'draft', 'sent', 'paid', 'overdue']

function downloadInvoiceText(invoice: Invoice) {
  const lines = [
    `INVOICE — INV-${invoice.id.slice(-6).toUpperCase()}`,
    ``,
    `Job: ${invoice.jobTitle}`,
    `Worker: ${invoice.workerName}`,
    ``,
    `Subtotal: ${formatCurrency(invoice.amount)}`,
    `Tax:      ${formatCurrency(invoice.tax)}`,
    `TOTAL:    ${formatCurrency(invoice.total)}`,
    ``,
    `Status:   ${invoice.status.toUpperCase()}`,
    `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
    invoice.paidAt ? `Paid:     ${new Date(invoice.paidAt).toLocaleDateString()}` : '',
  ]
    .filter((l) => l !== undefined)
    .join('\n')

  const blob = new Blob([lines], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `invoice-${invoice.id.slice(-6)}.txt`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Invoice downloaded')
}

export default function InvoiceManager({ invoices, onCreateInvoice }: InvoiceManagerProps) {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [search, setSearch] = useState('')

  const filtered = invoices.filter((inv) => {
    const matchesFilter = filter === 'all' || inv.status === filter
    const matchesSearch =
      !search ||
      inv.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      inv.workerName?.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const totalPaid = invoices
    .filter((i) => i.status === 'paid')
    .reduce((s, i) => s + i.total, 0)

  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-4 text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            Paid:{' '}
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalPaid)}
            </span>
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            Outstanding:{' '}
            <span className="font-semibold text-amber-600 dark:text-amber-400">
              {formatCurrency(totalOutstanding)}
            </span>
          </span>
        </div>
        {onCreateInvoice && (
          <Button size="sm" onClick={onCreateInvoice}>
            <PlusCircle className="h-4 w-4" />
            New Invoice
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search invoices…"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {FILTER_TABS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium capitalize whitespace-nowrap transition-colors border-b-2 -mb-px ${
              filter === f
                ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoice list */}
      <div className="divide-y divide-gray-100 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-gray-400 dark:text-gray-600">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No invoices found</p>
          </div>
        ) : (
          filtered.map((invoice) => (
            <div key={invoice.id} className="relative group">
              <InvoiceCard invoice={invoice} />
              <button
                onClick={() => downloadInvoiceText(invoice)}
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Download invoice"
                aria-label="Download invoice"
              >
                <Download className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
