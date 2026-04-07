'use client'
import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import InvoiceCard from '@/components/invoices/InvoiceCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Plus, Search, FileText, Download, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Invoice } from '@/types'
import type { GenerateInvoiceRequest } from '@/types/payment'

interface InvoiceManagerProps {
  workerId: string
  workerName: string
}

type ViewMode = 'list' | 'create'

const EMPTY_FORM: Omit<GenerateInvoiceRequest, 'workerId' | 'workerName'> = {
  jobId: '',
  jobTitle: '',
  employerId: '',
  employerName: '',
  lineItems: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }],
  taxRate: 0.08,
  currency: 'usd',
  notes: '',
}

export default function InvoiceManager({ workerId, workerName }: InvoiceManagerProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('list')
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invoices?workerId=${encodeURIComponent(workerId)}`)
      if (!res.ok) throw new Error('Failed to load invoices')
      const data = await res.json() as { invoices: Invoice[] }
      setInvoices(data.invoices ?? [])
    } catch {
      toast.error('Could not load invoices')
    } finally {
      setLoading(false)
    }
  }, [workerId])

  useEffect(() => { void fetchInvoices() }, [fetchInvoices])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, workerId, workerName }),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to generate invoice')
      }
      toast.success('Invoice generated!')
      setForm(EMPTY_FORM)
      setView('list')
      void fetchInvoices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate invoice')
    } finally {
      setSubmitting(false)
    }
  }

  const updateLineItem = (idx: number, field: keyof GenerateInvoiceRequest['lineItems'][0], value: string | number) => {
    setForm((prev) => {
      const items = [...prev.lineItems]
      items[idx] = { ...items[idx], [field]: value }
      items[idx].amount = Math.round(items[idx].quantity * items[idx].unitPrice * 100) / 100
      return { ...prev, lineItems: items }
    })
  }

  const addLineItem = () => setForm((prev) => ({
    ...prev,
    lineItems: [...prev.lineItems, { description: '', quantity: 1, unitPrice: 0, amount: 0 }],
  }))

  const removeLineItem = (idx: number) => setForm((prev) => ({
    ...prev,
    lineItems: prev.lineItems.filter((_, i) => i !== idx),
  }))

  const subtotal = form.lineItems.reduce((s, i) => s + i.amount, 0)
  const tax = Math.round(subtotal * (form.taxRate ?? 0.08) * 100) / 100
  const total = subtotal + tax

  const fmt = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)

  const filtered = invoices.filter((inv) =>
    !search || inv.jobTitle.toLowerCase().includes(search.toLowerCase())
  )

  if (view === 'create') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Generate Invoice</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setView('list')}>Cancel</Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => void handleCreate(e)} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Job Title" required value={form.jobTitle}
                onChange={(e) => setForm((p) => ({ ...p, jobTitle: e.target.value }))} />
              <Input label="Job ID" required value={form.jobId}
                onChange={(e) => setForm((p) => ({ ...p, jobId: e.target.value }))} />
              <Input label="Employer Name" required value={form.employerName}
                onChange={(e) => setForm((p) => ({ ...p, employerName: e.target.value }))} />
              <Input label="Employer ID" required value={form.employerId}
                onChange={(e) => setForm((p) => ({ ...p, employerId: e.target.value }))} />
            </div>

            {/* Line items */}
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Line Items</p>
              <div className="space-y-2">
                {form.lineItems.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-5">
                      <input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateLineItem(idx, 'description', e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <input
                        type="number" min="1" placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateLineItem(idx, 'quantity', Number(e.target.value))}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="col-span-3">
                      <input
                        type="number" min="0" step="0.01" placeholder="Unit price"
                        value={item.unitPrice}
                        onChange={(e) => updateLineItem(idx, 'unitPrice', Number(e.target.value))}
                        required
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div className="col-span-1 text-right text-sm font-medium text-gray-700 dark:text-gray-300">
                      {fmt(item.amount)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      {form.lineItems.length > 1 && (
                        <button type="button" onClick={() => removeLineItem(idx)}
                          className="text-red-400 hover:text-red-600 text-xs font-medium">✕</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addLineItem} className="mt-2">
                <Plus className="h-4 w-4" /> Add line item
              </Button>
            </div>

            {/* Totals */}
            <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 p-4 space-y-1 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span><span>{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Tax ({((form.taxRate ?? 0.08) * 100).toFixed(0)}%)</span><span>{fmt(tax)}</span>
              </div>
              <div className="flex justify-between font-semibold text-gray-900 dark:text-white border-t border-gray-200 dark:border-gray-600 pt-1 mt-1">
                <span>Total</span><span>{fmt(total)}</span>
              </div>
            </div>

            <textarea
              placeholder="Notes (optional)"
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />

            <Button type="submit" loading={submitting} className="w-full">
              <FileText className="h-4 w-4" /> Generate Invoice
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Search invoices…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4" /> Send
            </Button>
            <Button size="sm" onClick={() => setView('create')}>
              <Plus className="h-4 w-4" /> New Invoice
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none">
        <CardHeader className="px-5 pt-5 pb-0">
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><LoadingSpinner /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 py-10">
              {search ? 'No invoices match your search.' : 'No invoices yet. Create your first one!'}
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((inv) => (
                <li key={inv.id}><InvoiceCard invoice={inv} /></li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
