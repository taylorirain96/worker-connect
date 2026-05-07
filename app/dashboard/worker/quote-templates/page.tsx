'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Plus, Trash2, FileText, ChevronDown, ChevronUp, DollarSign, Clock } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import type { QuoteTemplate } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtNZD(n: number) {
  return new Intl.NumberFormat('en-NZ', { style: 'currency', currency: 'NZD', maximumFractionDigits: 0 }).format(n)
}

function calcTotal(t: QuoteTemplate) {
  const labour = t.laborHours * t.laborRate
  const mats = (t.materials ?? []).reduce((s, m) => s + m.cost, 0)
  return t.basePrice + labour + mats + t.travelCost
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

interface TemplateFormData {
  name: string
  basePrice: number
  laborHours: number
  laborRate: number
  travelCost: number
  description: string
  timeline: string
  conditions: string
}

const BLANK_FORM: TemplateFormData = {
  name: '',
  basePrice: 0,
  laborHours: 0,
  laborRate: 65,
  travelCost: 0,
  description: '',
  timeline: '',
  conditions: '',
}

interface CreateModalProps {
  workerId: string
  onCreated: (t: QuoteTemplate) => void
  onClose: () => void
}

function CreateModal({ workerId, onCreated, onClose }: CreateModalProps) {
  const [form, setForm] = useState<TemplateFormData>(BLANK_FORM)
  const [saving, setSaving] = useState(false)

  const set = (field: keyof TemplateFormData, value: string | number) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Template name is required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/quote-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': workerId },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to save template')
      }
      const data = await res.json() as { template: QuoteTemplate }
      toast.success('Template saved!')
      onCreated(data.template)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save template')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-gray-400'
  const labelCls = 'block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">New Quote Template</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className={labelCls}>Template Name *</label>
            <input
              className={inputCls}
              placeholder="e.g. Standard plumbing callout"
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Base Price (NZD)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.basePrice}
                onChange={(e) => set('basePrice', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className={labelCls}>Travel Cost (NZD)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.travelCost}
                onChange={(e) => set('travelCost', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Labour Hours</label>
              <input
                type="number"
                min={0}
                step={0.5}
                className={inputCls}
                value={form.laborHours}
                onChange={(e) => set('laborHours', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label className={labelCls}>Labour Rate (NZD/hr)</label>
              <input
                type="number"
                min={0}
                className={inputCls}
                value={form.laborRate}
                onChange={(e) => set('laborRate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Scope / Description</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              placeholder="Describe what's included in this quote..."
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Timeline</label>
              <input
                className={inputCls}
                placeholder="e.g. 1–2 days"
                value={form.timeline}
                onChange={(e) => set('timeline', e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Conditions</label>
              <input
                className={inputCls}
                placeholder="e.g. Excludes materials"
                value={form.conditions}
                onChange={(e) => set('conditions', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={() => void handleSave()} disabled={saving}>
            {saving ? 'Saving…' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Template Card ────────────────────────────────────────────────────────────

interface TemplateCardProps {
  template: QuoteTemplate
  onDelete: (id: string) => void
}

function TemplateCard({ template, onDelete }: TemplateCardProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-indigo-500 shrink-0" />
            <p className="font-medium text-gray-900 dark:text-white truncate">{template.name}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmtNZD(calcTotal(template))}</span>
            <button
              onClick={() => setExpanded((v) => !v)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
            <button
              onClick={() => onDelete(template.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              aria-label="Delete template"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {expanded && (
          <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex flex-wrap gap-4">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5" />
                Base: {fmtNZD(template.basePrice)}
              </span>
              {template.laborHours > 0 && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Labour: {template.laborHours}h × {fmtNZD(template.laborRate)}/hr
                </span>
              )}
              {template.travelCost > 0 && (
                <span>Travel: {fmtNZD(template.travelCost)}</span>
              )}
            </div>
            {template.description && (
              <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{template.description}</p>
            )}
            {(template.timeline || template.conditions) && (
              <div className="flex flex-wrap gap-3 text-xs">
                {template.timeline && <span>⏱ {template.timeline}</span>}
                {template.conditions && <span>📋 {template.conditions}</span>}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function QuoteTemplatesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [templates, setTemplates] = useState<QuoteTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login')
  }, [user, authLoading, router])

  const fetchTemplates = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const res = await fetch('/api/quote-templates', {
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Failed to load templates')
      const data = await res.json() as { templates: QuoteTemplate[] }
      setTemplates(data.templates)
    } catch {
      toast.error('Could not load templates. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) void fetchTemplates()
  }, [user, fetchTemplates])

  const handleDelete = async (templateId: string) => {
    if (!user) return
    if (!confirm('Delete this template?')) return
    setDeletingId(templateId)
    try {
      const res = await fetch(`/api/quote-templates?templateId=${templateId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': user.uid },
      })
      if (!res.ok) throw new Error('Delete failed')
      setTemplates((prev) => prev.filter((t) => t.id !== templateId))
      toast.success('Template deleted')
    } catch {
      toast.error('Could not delete template. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/worker"
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Quote Templates</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Save reusable quote structures to speed up your bidding
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              disabled={templates.length >= 20}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              New Template
            </Button>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <LoadingSpinner />
            </div>
          )}

          {!loading && templates.length === 0 && (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600">
              <FileText className="h-10 w-10 mx-auto mb-3 opacity-50" />
              <p className="font-medium text-gray-600 dark:text-gray-400">No templates yet</p>
              <p className="text-sm mt-1">Save a quote template to pre-fill your next quote in seconds.</p>
              <Button size="sm" className="mt-4" onClick={() => setShowCreate(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Create your first template
              </Button>
            </div>
          )}

          {!loading && templates.length > 0 && (
            <div className="space-y-3">
              {templates.map((t) => (
                <TemplateCard
                  key={t.id}
                  template={t}
                  onDelete={deletingId ? () => {} : handleDelete}
                />
              ))}
              <p className="text-xs text-gray-400 dark:text-gray-600 text-center pt-2">
                {templates.length} / 20 templates used
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showCreate && user && (
        <CreateModal
          workerId={user.uid}
          onCreated={(t) => {
            setTemplates((prev) => [t, ...prev])
            setShowCreate(false)
          }}
          onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  )
}
