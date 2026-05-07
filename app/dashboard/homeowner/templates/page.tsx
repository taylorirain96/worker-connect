'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import Button from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'
import {
  FileText, Plus, Trash2, ArrowRight, Clock, MapPin, DollarSign, Tag,
} from 'lucide-react'
import type { JobTemplate } from '@/types'

const URGENCY_LABEL: Record<string, { label: string; className: string }> = {
  low:       { label: 'Low',       className: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300' },
  medium:    { label: 'Medium',    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  high:      { label: 'High',      className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  emergency: { label: 'Emergency', className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
}

export default function JobTemplatesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<JobTemplate[]>([])
  const [fetching, setFetching] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchTemplates = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/job-templates', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json() as { templates: JobTemplate[] }
      setTemplates(data.templates)
    } catch {
      toast.error('Could not load templates. Please try again.')
    } finally {
      setFetching(false)
    }
  }, [user])

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login?redirect=/dashboard/homeowner/templates')
      return
    }
    if (user) fetchTemplates()
  }, [user, loading, router, fetchTemplates])

  const handleDelete = async (id: string) => {
    if (!user) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/job-templates/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Delete failed')
      setTemplates((prev) => prev.filter((t) => t.id !== id))
      toast.success('Template deleted')
    } catch {
      toast.error('Failed to delete template. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const handleUseTemplate = (t: JobTemplate) => {
    const params = new URLSearchParams({
      templateId: t.id,
      title: t.title,
      description: t.description,
      category: t.category,
      location: t.location,
      budgetMin: String(t.budgetMin),
      budgetMax: String(t.budgetMax),
      budgetType: t.budgetType,
      urgency: t.urgency,
      skills: t.skills,
    })
    router.push(`/jobs/create?${params.toString()}`)
  }

  if (loading || fetching) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Loading templates…</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary-500" />
                Job Templates
              </h1>
              <p className="mt-1 text-gray-500 dark:text-gray-400 text-sm">
                Save frequently used job posts to repost quickly without typing the same details again.
              </p>
            </div>
            <Link href="/jobs/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                New Job
              </Button>
            </Link>
          </div>

          {templates.length === 0 ? (
            /* Empty state */
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">No templates yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto text-sm">
                When you post a job you can save it as a template. Templates let you repost recurring work in seconds.
              </p>
              <Link href="/jobs/create">
                <Button className="inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Post a job &amp; save as template
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((t) => {
                const urgency = URGENCY_LABEL[t.urgency] ?? URGENCY_LABEL.medium
                return (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
                  >
                    {/* Name + category */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white leading-snug">{t.name}</h3>
                        <span className={`text-xs font-medium rounded-full px-2 py-0.5 whitespace-nowrap ${urgency.className}`}>
                          {urgency.label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{t.title}</p>
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                      {t.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {t.location}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Tag className="h-3.5 w-3.5" />
                        {t.category}
                      </span>
                      {(t.budgetMax > 0) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {t.budgetMin > 0
                            ? `${formatCurrency(t.budgetMin)} – ${formatCurrency(t.budgetMax)}`
                            : `Up to ${formatCurrency(t.budgetMax)}`}
                          {t.budgetType === 'hourly' ? '/hr' : ''}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Saved {new Date(t.createdAt).toLocaleDateString('en-NZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{t.description}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 mt-auto">
                      <Button
                        onClick={() => handleUseTemplate(t)}
                        className="flex-1 flex items-center justify-center gap-1.5 text-sm"
                      >
                        Use Template
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <button
                        type="button"
                        disabled={deletingId === t.id}
                        onClick={() => handleDelete(t.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        aria-label="Delete template"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
