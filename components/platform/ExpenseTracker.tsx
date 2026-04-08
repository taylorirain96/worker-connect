'use client'
import { useState, useEffect, useCallback } from 'react'
import type { ExpenseRecord } from '@/types'

const CATEGORIES = [
  { value: 'hosting', label: 'Server/Hosting' },
  { value: 'software', label: 'Software' },
  { value: 'officeSupplies', label: 'Office Supplies' },
  { value: 'professionalServices', label: 'Professional Services' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'other', label: 'Other' },
]

export default function ExpenseTracker() {
  const [expenses, setExpenses] = useState<ExpenseRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    category: 'hosting' as ExpenseRecord['category'],
    description: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  })
  const [filterCategory, setFilterCategory] = useState('')

  const fetchExpenses = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCategory) params.set('category', filterCategory)
      const res = await fetch(`/api/platform/expenses?${params}`)
      const data = await res.json()
      setExpenses(data.expenses || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [filterCategory])

  useEffect(() => { fetchExpenses() }, [fetchExpenses])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/platform/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
      })
      if (res.ok) {
        setForm({ category: 'hosting', description: '', amount: '', date: new Date().toISOString().slice(0, 10) })
        fetchExpenses()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleApprove = async (id: string) => {
    await fetch(`/api/platform/expenses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approve: true }),
    })
    fetchExpenses()
  }

  const gstAmount = form.amount ? (parseFloat(form.amount) * 0.15).toFixed(2) : '0.00'
  const totalAmount = form.amount ? (parseFloat(form.amount) * 1.15).toFixed(2) : '0.00'

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Log New Expense</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({ ...form, category: e.target.value as ExpenseRecord['category'] })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm({ ...form, date: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. AWS hosting for May"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount (pre-GST, NZD)</label>
            <input
              type="number"
              value={form.amount}
              onChange={e => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="bg-gray-50 rounded-lg p-3 flex flex-col justify-center">
            <p className="text-xs text-gray-500">GST (15%): <span className="font-semibold text-gray-700">NZ${gstAmount}</span></p>
            <p className="text-xs text-gray-500">Total inc. GST: <span className="font-semibold text-gray-700">NZ${totalAmount}</span></p>
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Log Expense'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        {loading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : expenses.length === 0 ? (
          <p className="text-gray-500 text-sm">No expenses recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Date</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Description</th>
                  <th className="text-left py-2 pr-4 font-medium text-gray-600">Category</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Amount</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">GST</th>
                  <th className="text-right py-2 pr-4 font-medium text-gray-600">Total</th>
                  <th className="text-left py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-2 pr-4 text-gray-600">{e.date?.slice(0, 10)}</td>
                    <td className="py-2 pr-4 text-gray-900">{e.description}</td>
                    <td className="py-2 pr-4 text-gray-600 capitalize">{e.category}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">NZ${e.amount?.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right text-gray-600">NZ${e.gst?.toFixed(2)}</td>
                    <td className="py-2 pr-4 text-right text-gray-900">NZ${e.totalCost?.toFixed(2)}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                          e.status === 'approved' ? 'bg-green-100 text-green-700' :
                          e.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {e.status}
                        </span>
                        {e.status === 'pending' && (
                          <button
                            onClick={() => handleApprove(e.id)}
                            className="text-xs text-blue-600 hover:text-blue-800"
                          >
                            Approve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
