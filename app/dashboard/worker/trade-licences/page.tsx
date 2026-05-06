'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useAuth } from '@/components/providers/AuthProvider'
import {
  Award, Plus, Trash2, ArrowLeft, Upload, CheckCircle, FileText,
  CalendarDays, Building2, Hash, ExternalLink,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { WorkerTradeLicence, TradeLicenceType } from '@/types'
import { TRADE_LICENCE_LABELS } from '@/types'

const LICENCE_OPTIONS = (Object.keys(TRADE_LICENCE_LABELS) as TradeLicenceType[]).map((k) => ({
  value: k,
  label: TRADE_LICENCE_LABELS[k],
}))

function fmtDate(iso?: string) {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function isExpired(expiryDate?: string) {
  if (!expiryDate) return false
  return new Date(expiryDate) < new Date()
}

export default function TradeLicencesPage() {
  const router = useRouter()
  const { user, profile, loading: authLoading } = useAuth()

  const [licences, setLicences] = useState<WorkerTradeLicence[]>([])
  const [fetching, setFetching] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form state
  const [licenceType, setLicenceType] = useState<TradeLicenceType>('lbp')
  const [licenceNumber, setLicenceNumber] = useState('')
  const [issuingBody, setIssuingBody] = useState('')
  const [issueDate, setIssueDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [notes, setNotes] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docPreview, setDocPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'worker'))) {
      router.replace('/dashboard')
    }
  }, [authLoading, user, profile, router])

  const fetchLicences = useCallback(async () => {
    if (!user) return
    setFetching(true)
    try {
      const res = await fetch(`/api/worker-trade-licences?uid=${user.uid}`)
      if (res.ok) {
        const data = await res.json() as { licences: WorkerTradeLicence[] }
        setLicences(data.licences ?? [])
      }
    } catch {
      toast.error('Could not load licences')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    fetchLicences()
  }, [fetchLicences])

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File must be smaller than 20 MB')
      return
    }
    setDocFile(file)
    if (file.type.startsWith('image/')) {
      setDocPreview(URL.createObjectURL(file))
    } else {
      setDocPreview(null)
    }
  }

  function resetForm() {
    setLicenceType('lbp')
    setLicenceNumber('')
    setIssuingBody('')
    setIssueDate('')
    setExpiryDate('')
    setNotes('')
    setDocFile(null)
    setDocPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return

    setSubmitting(true)
    let documentUrl: string | undefined

    try {
      // Upload document to Firebase Storage if provided
      if (docFile) {
        setUploading(true)
        const { storage } = await import('@/lib/firebase')
        if (!storage) {
          toast.error('Storage is not configured')
          setSubmitting(false)
          setUploading(false)
          return
        }
        const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
        const ext = docFile.name.split('.').pop() ?? 'pdf'
        const storagePath = `trade-licences/${user.uid}/${Date.now()}.${ext}`
        const storageRef = ref(storage, storagePath)

        await new Promise<void>((resolve, reject) => {
          const task = uploadBytesResumable(storageRef, docFile)
          task.on('state_changed', undefined, reject, () => resolve())
        })

        documentUrl = await getDownloadURL(storageRef)
        setUploading(false)
      }

      const res = await fetch('/api/worker-trade-licences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.uid,
        },
        body: JSON.stringify({
          licenceType,
          licenceNumber: licenceNumber.trim() || undefined,
          issuingBody: issuingBody.trim() || undefined,
          issueDate: issueDate || undefined,
          expiryDate: expiryDate || undefined,
          documentUrl,
          notes: notes.trim() || undefined,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to save')

      toast.success('Licence added!')
      resetForm()
      await fetchLicences()
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Could not save licence — please try again')
      setUploading(false)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(licenceId: string) {
    if (!user) return
    setDeletingId(licenceId)
    try {
      const res = await fetch(`/api/worker-trade-licences?id=${licenceId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Delete failed')
      }
      setLicences((prev) => prev.filter((l) => l.id !== licenceId))
      toast.success('Licence removed')
    } catch (err) {
      console.error('Delete error:', err)
      toast.error('Could not remove licence')
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || fetching) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" />
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
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link
            href="/dashboard/worker"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Trade Licences &amp; Certifications</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Add your NZ trade licences to build trust and win more jobs
                </p>
              </div>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add Licence
              </Button>
            )}
          </div>

          {/* Info banner */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 mb-6 text-sm text-indigo-700 dark:text-indigo-300">
            <strong>Tip:</strong> Licences displayed on your public profile give homeowners confidence in your qualifications. Add your LBP number, electrical registration, or any other trade cert.
          </div>

          {/* Add Form */}
          {showForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4 text-indigo-500" />
                  New Licence / Certification
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Licence type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Licence Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={licenceType}
                      onChange={(e) => setLicenceType(e.target.value as TradeLicenceType)}
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      {LICENCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Licence number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Licence / Registration Number
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={licenceNumber}
                        onChange={(e) => setLicenceNumber(e.target.value)}
                        placeholder="e.g. LBP123456"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Issuing body */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Issuing Body
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        value={issuingBody}
                        onChange={(e) => setIssuingBody(e.target.value)}
                        placeholder="e.g. MBIE, Electrical Workers Registration Board"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Dates row */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Issue Date
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={issueDate}
                          onChange={(e) => setIssueDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Expiry Date
                      </label>
                      <div className="relative">
                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Class 2 Electrical Worker"
                      className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  {/* Document upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Upload Certificate (optional)
                    </label>
                    {docFile ? (
                      <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{docFile.name}</p>
                          <p className="text-xs text-gray-500">{(docFile.size / 1024).toFixed(0)} KB</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setDocFile(null); setDocPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                          className="text-xs text-red-500 hover:text-red-700 shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors py-4 flex flex-col items-center gap-2 bg-gray-50 dark:bg-gray-900"
                      >
                        <Upload className="h-6 w-6 text-gray-400" />
                        <span className="text-sm text-gray-500">
                          Click to upload PDF, JPG, or PNG (max 20 MB)
                        </span>
                      </button>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      className="sr-only"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      disabled={submitting}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitting}
                      loading={submitting}
                      className="flex-1"
                    >
                      {uploading ? 'Uploading…' : 'Save Licence'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Licences list */}
          {licences.length === 0 && !showForm ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <Award className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <p className="font-semibold text-gray-900 dark:text-white mb-1">No licences added yet</p>
              <p className="text-sm text-gray-500 mb-4">
                Add your NZ trade licences to build trust with homeowners.
              </p>
              <Button onClick={() => setShowForm(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add Your First Licence
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {licences.map((licence) => {
                const expired = isExpired(licence.expiryDate)
                return (
                  <div
                    key={licence.id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                        <Award className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {TRADE_LICENCE_LABELS[licence.licenceType] ?? licence.licenceType}
                          </p>
                          {expired ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                              Expired
                            </span>
                          ) : licence.expiryDate ? (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                              Active
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                          {licence.licenceNumber && (
                            <span className="flex items-center gap-1">
                              <Hash className="h-3 w-3" />
                              {licence.licenceNumber}
                            </span>
                          )}
                          {licence.issuingBody && (
                            <span className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              {licence.issuingBody}
                            </span>
                          )}
                          {licence.issueDate && (
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              Issued {fmtDate(licence.issueDate)}
                            </span>
                          )}
                          {licence.expiryDate && (
                            <span className={`flex items-center gap-1 ${expired ? 'text-red-500 dark:text-red-400' : ''}`}>
                              <CalendarDays className="h-3 w-3" />
                              Expires {fmtDate(licence.expiryDate)}
                            </span>
                          )}
                        </div>

                        {licence.notes && (
                          <p className="mt-1 text-xs text-gray-400 italic">{licence.notes}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {licence.documentUrl && (
                          <a
                            href={licence.documentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                            title="View certificate"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleDelete(licence.id)}
                          disabled={deletingId === licence.id}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors disabled:opacity-40"
                          title="Remove licence"
                        >
                          {deletingId === licence.id ? (
                            <LoadingSpinner size="sm" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {licences.length > 0 && !showForm && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => setShowForm(true)} className="flex items-center gap-2 mx-auto">
                <Plus className="h-4 w-4" />
                Add Another Licence
              </Button>
            </div>
          )}

          {/* Privacy note */}
          <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
            <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              Uploaded documents are stored securely. Only your licence type, number, and status are shown on your public profile.
            </span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
