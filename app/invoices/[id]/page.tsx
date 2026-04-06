'use client'
import { use } from 'react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Invoice } from '@/types'
import { ArrowLeft, Download, FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react'

// ─── Mock invoice lookup (replace with Firestore call) ────────────────────────
const MOCK_INVOICES: Record<string, Invoice> = {
  'inv_mock_001': {
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
  'inv_mock_002': {
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
  'inv_mock_003': {
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
}

const STATUS_CONFIG: Record<Invoice['status'], { label: string; icon: React.ReactNode; className: string }> = {
  draft: {
    label: 'Draft',
    icon: <FileText className="h-4 w-4" />,
    className: 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400',
  },
  sent: {
    label: 'Sent — Awaiting Payment',
    icon: <Clock className="h-4 w-4" />,
    className: 'text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-300',
  },
  paid: {
    label: 'Paid',
    icon: <CheckCircle className="h-4 w-4" />,
    className: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300',
  },
  overdue: {
    label: 'Overdue',
    icon: <AlertCircle className="h-4 w-4" />,
    className: 'text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300',
  },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function InvoiceDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const invoice = MOCK_INVOICES[id]

  const handleDownload = () => {
    if (!invoice) return
    const invoiceNumber = `INV-${invoice.id.slice(-6).toUpperCase()}`
    const lines = [
      '═══════════════════════════════════════',
      `         INVOICE ${invoiceNumber}`,
      '═══════════════════════════════════════',
      '',
      `Job:        ${invoice.jobTitle}`,
      `Worker:     ${invoice.workerName}`,
      `Date:       ${formatDate(invoice.createdAt)}`,
      `Due Date:   ${formatDate(invoice.dueDate)}`,
      '',
      '───────────────────────────────────────',
      `Services                   $${invoice.amount.toFixed(2)}`,
      `Tax (8%)                   $${invoice.tax.toFixed(2)}`,
      '───────────────────────────────────────',
      `TOTAL                      $${invoice.total.toFixed(2)}`,
      '═══════════════════════════════════════',
      '',
      `Status: ${invoice.status.toUpperCase()}`,
      invoice.paidAt ? `Paid on: ${formatDate(invoice.paidAt)}` : '',
    ]
      .filter((l) => l !== undefined)
      .join('\n')

    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoiceNumber}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!invoice) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p className="text-lg font-medium">Invoice not found</p>
            <Link href="/invoices" className="mt-4 inline-block text-primary-600 hover:underline text-sm">
              Back to Invoices
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[invoice.status]
  const invoiceNumber = `INV-${invoice.id.slice(-6).toUpperCase()}`

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

          {/* Back link */}
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Invoices
          </Link>

          {/* Status banner */}
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${statusCfg.className}`}>
            {statusCfg.icon}
            <span className="font-medium text-sm">{statusCfg.label}</span>
          </div>

          {/* Invoice card */}
          <Card>
            <CardContent>
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Invoice</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoiceNumber}</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>

              {/* Job info */}
              <div className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Job</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.jobTitle}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Worker</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{invoice.workerName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Invoice Date</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(invoice.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Due Date</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{formatDate(invoice.dueDate)}</p>
                </div>
                {invoice.paidAt && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Paid On</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400">{formatDate(invoice.paidAt)}</p>
                  </div>
                )}
              </div>

              {/* Line items */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden mb-4">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  <div className="flex justify-between items-center px-4 py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{invoice.jobTitle}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(invoice.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center px-4 py-3 text-gray-500">
                    <span className="text-sm">Tax (8%)</span>
                    <span className="text-sm">{formatCurrency(invoice.tax)}</span>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center px-4 py-3 bg-gray-900 dark:bg-gray-700 rounded-xl">
                <span className="text-base font-bold text-white">Total</span>
                <span className="text-xl font-bold text-white">{formatCurrency(invoice.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
