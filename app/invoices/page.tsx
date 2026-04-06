'use client'
import { useState } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import InvoiceCard from '@/components/invoices/InvoiceCard'
import { useAuth } from '@/components/providers/AuthProvider'
import { formatCurrency } from '@/lib/utils'
import type { Invoice } from '@/types'
import { FileText, ArrowLeft, Download, PlusCircle } from 'lucide-react'
import Button from '@/components/ui/Button'

// ─── Mock data (replace with Firestore calls via paymentService) ──────────────
const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv_mock_001',
    jobId: 'job_1',
    jobTitle: 'Plumbing Repair — Kitchen Sink',
    employerId: 'emp_1',
    workerId: 'worker_1',
    workerName: 'Alex Johnson',
    amount: 320,
    tax: 25.60,
    total: 345.60,
    status: 'paid',
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'inv_mock_002',
    jobId: 'job_2',
    jobTitle: 'Electrical Panel Upgrade',
    employerId: 'emp_2',
    workerId: 'worker_1',
    workerName: 'Alex Johnson',
    amount: 850,
    tax: 68,
    total: 918,
    status: 'sent',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv_mock_003',
    jobId: 'job_3',
    jobTitle: 'HVAC Maintenance Service',
    employerId: 'emp_1',
    workerId: 'worker_1',
    workerName: 'Alex Johnson',
    amount: 200,
    tax: 16,
    total: 216,
    status: 'overdue',
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'inv_mock_004',
    jobId: 'job_4',
    jobTitle: 'Carpentry — Deck Repair',
    employerId: 'emp_3',
    workerId: 'worker_1',
    workerName: 'Alex Johnson',
    amount: 450,
    tax: 36,
    total: 486,
    status: 'paid',
    dueDate: new Date(Date.now() - 25 * 86400000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    paidAt: new Date(Date.now() - 22 * 86400000).toISOString(),
  },
]

type StatusFilter = 'all' | Invoice['status']

export default function InvoicesPage() {
  const { user } = useAuth()
  const [filter, setFilter] = useState<StatusFilter>('all')

  const filtered = filter === 'all' ? MOCK_INVOICES : MOCK_INVOICES.filter((i) => i.status === filter)
  const totalPaid = MOCK_INVOICES.filter((i) => i.status === 'paid').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = MOCK_INVOICES
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0)

  const handleDownload = (invoice: Invoice) => {
    // In production, generate PDF via a server-side API and trigger download
    // e.g., fetch(`/api/invoices/${invoice.id}/pdf`) and create a blob URL
    const content = [
      `INVOICE — INV-${invoice.id.slice(-6).toUpperCase()}`,
      ``,
      `Job: ${invoice.jobTitle}`,
      `Worker: ${invoice.workerName}`,
      ``,
      `Subtotal: $${invoice.amount.toFixed(2)}`,
      `Tax: $${invoice.tax.toFixed(2)}`,
      `TOTAL: $${invoice.total.toFixed(2)}`,
      ``,
      `Status: ${invoice.status.toUpperCase()}`,
      `Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`,
      invoice.paidAt ? `Paid: ${new Date(invoice.paidAt).toLocaleDateString()}` : '',
    ]
      .filter(Boolean)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `invoice-${invoice.id.slice(-6)}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back link */}
          <Link
            href="/payments"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Payments
          </Link>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <FileText className="h-7 w-7 text-purple-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Invoices</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.displayName ?? 'Worker'}&apos;s invoices
                </p>
              </div>
            </div>
            <Button size="sm">
              <PlusCircle className="h-4 w-4" />
              New Invoice
            </Button>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 gap-3">
            <Card padding="sm">
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Paid</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPaid)}
                </p>
              </CardContent>
            </Card>
            <Card padding="sm">
              <CardContent>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Outstanding</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalOutstanding)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
            {(['all', 'draft', 'sent', 'paid', 'overdue'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                  filter === f
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          {/* Invoice list */}
          <Card padding="none">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.length === 0 ? (
                <div className="py-12 text-center text-gray-400 dark:text-gray-600">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  No invoices found
                </div>
              ) : (
                filtered.map((invoice) => (
                  <div key={invoice.id} className="relative group">
                    <Link href={`/invoices/${invoice.id}`}>
                      <InvoiceCard invoice={invoice} onClick={() => {}} />
                    </Link>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDownload(invoice) }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      title="Download invoice"
                    >
                      <Download className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
