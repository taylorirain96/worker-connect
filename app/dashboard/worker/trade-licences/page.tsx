'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/components/providers/AuthProvider'
import { TRADE_LICENCE_LABELS, type TradeLicenceType, type WorkerTradeLicence } from '@/types'
import {
  Shield, ArrowLeft, Plus, Trash2, AlertCircle, CheckCircle, Calendar,
} from 'lucide-react'
import toast from 'react-hot-toast'

const MAX_LICENCES = 20

function formatExpiry(dateStr: string): { label: string; isExpired: boolean; isExpiringSoon: boolean } {
  const expiry = new Date(dateStr)
  const now = new Date()
  const diffMs = expiry.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const isExpired = diffDays < 0
  const isExpiringSoon = !isExpired && diffDays <= 30
  return {
    label: expiry.toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' }),
    isExpired,
    isExpiringSoon,
  }
}

export default function TradeLicencesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  const [licences, setLicences] = useState<WorkerTradeLicence[]>([])
  const [fetching, setFetching] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Form state
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    licenceType: '' as TradeLicenceType | '',
    licenceNumber: '',
    issuer: '',
    expiryDate: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  const fetchLicences = useCallback(async () => {
    if (!user?.uid) return
    setFetching(true)
    try {
      const res = await fetch(`/api/worker-trade-licences?uid=${user.uid}`)
      const data = await res.json() as { licences?: WorkerTradeLicence[] }
      setLicences(data.licences ?? [])
    } catch {
      toast.error('Could not load trade licences')
    } finally {
      setFetching(false)
    }
  }, [user?.uid])

  useEffect(() => {
    fetchLicences()
  }, [fetchLicences])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !form.licenceType) return

    setSubmitting(true)
    try {
      const res = await fetch('/api/worker-trade-licences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          licenceType: form.licenceType,
          licenceNumber: form.licenceNumber || undefined,
          issuer: form.issuer || undefined,
          expiryDate: form.expiryDate || undefined,
        }),
      })
      const data = await res.json() as { error?: string; licence?: WorkerTradeLicence }
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to add licence')
        return
      }
      toast.success('Licence added successfully')
      setForm({ licenceType: '', licenceNumber: '', issuer: '', expiryDate: '' })
      setShowForm(false)
      await fetchLicences()
    } catch {
      toast.error('Failed to add licence')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (licenceId: string) => {
    if (!user) return
    setDeleting(licenceId)
    try {
      const res = await fetch(`/api/worker-trade-licences?licenceId=${licenceId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        toast.error(data.error ?? 'Failed to delete licence')
        return
      }
      toast.success('Licence removed')
      setLicences((prev) => prev.filter((l) => l.id !== licenceId))
    } catch {
      toast.error('Failed to delete licence')
    } finally {
      setDeleting(null)
    }
  }

  const LICENCE_TYPE_OPTIONS = Object.entries(TRADE_LICENCE_LABELS) as [TradeLicenceType, string][]

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-gray-400">Loading…</div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trade Licences</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {licences.length}/{MAX_LICENCES} licences added
                </p>
              </div>
            </div>
            {!showForm && licences.length < MAX_LICENCES && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Licence
              </Button>
            )}
          </div>

          {/* Add form */}
          {showForm && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Add Trade Licence</h2>
                <form onSubmit={handleAdd} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Licence Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={form.licenceType}
                      onChange={(e) => setForm((f) => ({ ...f, licenceType: e.target.value as TradeLicenceType }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select licence type</option>
                      {LICENCE_TYPE_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Licence / Certificate Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LBP-123456"
                      value={form.licenceNumber}
                      onChange={(e) => setForm((f) => ({ ...f, licenceNumber: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Issuing Body
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Licensed Building Practitioners Board"
                      value={form.issuer}
                      onChange={(e) => setForm((f) => ({ ...f, issuer: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={submitting}>
                      Save Licence
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Licences list */}
          {fetching ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-24 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-pulse" />
              ))}
            </div>
          ) : licences.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Shield className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 font-medium mb-1">No licences added yet</p>
              <p className="text-sm text-gray-400">
                Add your trade licences and certifications so employers can see your qualifications.
              </p>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} className="mt-4 gap-2">
                  <Plus className="h-4 w-4" />
                  Add Your First Licence
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {licences.map((licence) => {
                const expiryInfo = licence.expiryDate ? formatExpiry(licence.expiryDate) : null
                return (
                  <div
                    key={licence.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`mt-0.5 h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        expiryInfo?.isExpired
                          ? 'bg-red-100 dark:bg-red-900/30'
                          : expiryInfo?.isExpiringSoon
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-green-100 dark:bg-green-900/30'
                      }`}>
                        {expiryInfo?.isExpired ? (
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {TRADE_LICENCE_LABELS[licence.licenceType]}
                        </p>
                        {licence.licenceNumber && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                            #{licence.licenceNumber}
                          </p>
                        )}
                        {licence.issuer && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {licence.issuer}
                          </p>
                        )}
                        {expiryInfo && (
                          <div className={`inline-flex items-center gap-1 mt-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                            expiryInfo.isExpired
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                              : expiryInfo.isExpiringSoon
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {expiryInfo.isExpired ? 'Expired' : expiryInfo.isExpiringSoon ? 'Expiring soon' : 'Expires'}&nbsp;{expiryInfo.label}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(licence.id)}
                      disabled={deleting === licence.id}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0 p-1"
                      aria-label="Remove licence"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
