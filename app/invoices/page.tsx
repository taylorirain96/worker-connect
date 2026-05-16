'use client'
import { useState, useEffect } from 'react'
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

type StatusFilter = 'all' | Invoice['status']

export default function InvoicesPage() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    fetch(`/api/invoices?workerId=${encodeURIComponent(user.uid)}`)
      .then((r) => r.json())
      .then((data: { invoices?: Invoice[] }) => {
        setInvoices(Array.isArray(data.invoices) ? data.invoices : [])
      })
      .catch(() => setInvoices([]))
      .finally(() => setLoading(false))
  }, [user])

  const filtered = filter === 'all' ? invoices : invoices.filter((i) => i.status === filter)
  const totalPaid = invoices.filter((i) => i.status === 'paid' || i.status === 'completed').reduce((s, i) => s + i.total, 0)
  const totalOutstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((s, i) => s + i.total, 0)

  const handleDownload = (invoice: Invoice) => {
    const content = [
      `INVOICE — ${invoice.invoiceNumber ?? `INV-${invoice.id.slice(-6).toUpperCase()}`}`,
      ``,
      `Job: ${invoice.jobTitle ?? ''}`,
      `Worker: ${invoice.workerName ?? ''}`,
      ``,
      `Subtotal: $${(invoice.amount ?? invoice.subtotal ?? 0).toFixed(2)}`,
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
              {loading ? (
                <div className="py-12 text-center">
                  <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : filtered.length === 0 ? (
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
