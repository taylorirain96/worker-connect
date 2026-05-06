'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'
import { JOB_CATEGORIES } from '@/lib/utils'
import { Briefcase, Sparkles, FileText, BookmarkPlus } from 'lucide-react'
import { hasEmployerAI } from '@/lib/subscriptions'
import AIUpgradePrompt from '@/components/ui/AIUpgradePrompt'
import { trackEvent } from '@/lib/analytics'
import Link from 'next/link'

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().min(3, 'Please enter a location'),
  budgetMin: z.coerce.number().min(0, 'Min budget must be 0 or more'),
  budgetMax: z.coerce.number().min(1, 'Max budget must be greater than 0'),
  budgetType: z.enum(['fixed', 'hourly']),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  skills: z.string().optional(),
  tags: z.string().optional(),
  deadline: z.string().optional(),
}).refine((d) => d.budgetMax >= d.budgetMin, {
  message: 'Max budget must be ≥ min budget',
  path: ['budgetMax'],
})

type JobFormData = z.infer<typeof jobSchema>

const URGENCY_OPTIONS = [
  { value: 'low',       label: '⬇️ Low',       sub: 'No rush',           ring: 'ring-gray-400',   bg: 'bg-gray-100 dark:bg-gray-700',   text: 'text-gray-700 dark:text-gray-200' },
  { value: 'medium',    label: '📅 Medium',    sub: 'Within a week',     ring: 'ring-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/30',  text: 'text-blue-700 dark:text-blue-300' },
  { value: 'high',      label: '⚡ High',      sub: 'Within 48 hours',   ring: 'ring-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/30',text: 'text-amber-700 dark:text-amber-300' },
  { value: 'emergency', label: '🚨 Emergency', sub: 'ASAP',              ring: 'ring-red-500',    bg: 'bg-red-50 dark:bg-red-900/30',   text: 'text-red-700 dark:text-red-300' },
] as const

export default function CreateJobPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [showAIPanel, setShowAIPanel] = useState(false)
  const [aiLoading, setAILoading] = useState(false)
  const [aiInputs, setAIInputs] = useState({ task: '', size: 'half_day', requirements: '' })
  const [saveAsTemplate, setSaveAsTemplate] = useState(false)
  const [templateName, setTemplateName] = useState('')
  const [savingTemplate, setSavingTemplate] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { budgetType: 'fixed', urgency: 'medium', budgetMin: 0 },
  })

  // Pre-fill form from URL params when loading from a saved template
  useEffect(() => {
    const title = searchParams.get('title')
    if (!title) return
    const fields: (keyof JobFormData)[] = ['title', 'description', 'category', 'location', 'skills', 'budgetType', 'urgency']
    fields.forEach((f) => {
      const val = searchParams.get(f)
      if (val) setValue(f as keyof JobFormData, val as never)
    })
    const budgetMin = searchParams.get('budgetMin')
    const budgetMax = searchParams.get('budgetMax')
    if (budgetMin) setValue('budgetMin', Number(budgetMin))
    if (budgetMax) setValue('budgetMax', Number(budgetMax))
  }, [searchParams, setValue])

  const budgetType = watch('budgetType')
  const selectedCategory = watch('category')
  const selectedUrgency = watch('urgency')

  const handleAIJobPost = async () => {
    if (!user || !aiInputs.task.trim()) return
    setAILoading(true)
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'job_post',
          userId: user.uid,
          userRole: 'employer',
          inputs: {
            task: aiInputs.task,
            size: aiInputs.size,
            requirements: aiInputs.requirements,
            category: selectedCategory || '',
          },
        }),
      })
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || !data.text) {
        toast.error(data.error ?? 'AI generation failed')
        return
      }
      setValue('description', data.text)
      setShowAIPanel(false)
      toast.success('Description generated!')
    } catch {
      toast.error('Failed to generate description')
    } finally {
      setAILoading(false)
    }
  }

  const onSubmit = async (data: JobFormData) => {
    if (!user || !profile) {
      toast.error('Please sign in to post a job')
      router.push('/auth/login')
      return
    }
    if (profile.role !== 'employer') {
      toast.error('Only employers can post jobs')
      return
    }

    try {
      const { saveJob } = await import('@/lib/services/jobService')
      const tags = data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean).slice(0, 10) : []
      const jobId = await saveJob({
        title: data.title,
        description: data.description,
        category: data.category as import('@/types').JobCategory,
        location: data.location,
        budget: data.budgetMax,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        budgetType: data.budgetType,
        urgency: data.urgency,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        tags,
        employerId: user.uid,
        employerName: user.displayName || user.email || 'Employer',
        status: 'open',
        ...(data.deadline ? { deadline: data.deadline } : {}),
      })

      // Optionally save this post as a reusable template
      if (saveAsTemplate && templateName.trim()) {
        setSavingTemplate(true)
        try {
          await fetch('/api/job-templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
            body: JSON.stringify({
              name: templateName.trim(),
              title: data.title,
              description: data.description,
              category: data.category,
              location: data.location,
              budgetMin: data.budgetMin,
              budgetMax: data.budgetMax,
              budgetType: data.budgetType,
              urgency: data.urgency,
              skills: data.skills ?? '',
            }),
          })
          toast.success('Job posted & template saved!')
        } catch {
          // Don't block navigation if template save fails
          toast.success('Job posted!')
        } finally {
          setSavingTemplate(false)
        }
      } else {
        toast.success('Job posted successfully!')
      }

      trackEvent('job_posted', { job_id: jobId, category: data.category, budget: data.budgetMax })
      router.push(`/jobs/${jobId}`)
    } catch {
      toast.error('Failed to post job. Please try again.')
    }
  }

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Briefcase className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Sign in required</h2>
            <p className="text-gray-500 mb-4">You need to sign in as an employer to post jobs.</p>
            <Button onClick={() => router.push('/auth/login')}>Sign In</Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary-600" />
              Post a New Job
            </h1>
            <p className="text-gray-500 mt-1">Describe what you need and get proposals from skilled workers</p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Template banner — shown if pre-filled from a saved template */}
          {searchParams.get('templateId') && (
            <div className="mb-5 flex items-center gap-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 px-4 py-3 text-sm text-indigo-700 dark:text-indigo-300">
              <FileText className="h-4 w-4 flex-shrink-0" />
              <span>Pre-filled from your saved template. Edit any details before posting.</span>
              <Link href="/dashboard/homeowner/templates" className="ml-auto text-xs underline underline-offset-2 whitespace-nowrap">
                View templates
              </Link>
            </div>
          )}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Job Details
              </h2>

              <Input
                label="Job Title"
                placeholder="e.g., Fix leaking bathroom pipe"
                error={errors.title?.message}
                required
                {...register('title')}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description <span className="text-red-500">*</span>
                </label>

                {hasEmployerAI(profile) && (
                  <div className="mb-3">
                    {!showAIPanel ? (
                      <button
                        type="button"
                        onClick={() => setShowAIPanel(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 border border-indigo-200 dark:border-indigo-800 rounded-lg px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 transition-colors"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Write with AI
                      </button>
                    ) : (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-700 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" /> AI Job Post Writer
                          </p>
                          <button type="button" onClick={() => setShowAIPanel(false)} aria-label="Close AI Job Post Writer" className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">What needs to be done?</label>
                          <input
                            type="text"
                            value={aiInputs.task}
                            onChange={(e) => setAIInputs(p => ({ ...p, task: e.target.value }))}
                            placeholder="e.g. Bathroom tap is dripping and needs replacing"
                            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">How big is the job?</label>
                          <div className="flex gap-2">
                            {[
                              { value: 'quick', label: '⚡ Quick (under 2hrs)' },
                              { value: 'half_day', label: '🕐 Half day' },
                              { value: 'full_day', label: '📅 Full day+' },
                            ].map(opt => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setAIInputs(p => ({ ...p, size: opt.value }))}
                                className={`flex-1 text-xs py-1.5 rounded-lg border transition-colors ${aiInputs.size === opt.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Any special requirements? <span className="text-gray-400">(optional)</span></label>
                          <input
                            type="text"
                            value={aiInputs.requirements}
                            onChange={(e) => setAIInputs(p => ({ ...p, requirements: e.target.value }))}
                            placeholder="e.g. Must be licensed, need own tools"
                            className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>
                        <button
                          type="button"
                          disabled={!aiInputs.task.trim() || aiLoading}
                          onClick={handleAIJobPost}
                          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                        >
                          {aiLoading ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</> : <><Sparkles className="h-4 w-4" /> Generate Description</>}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <textarea
                  rows={5}
                  placeholder="Describe the job in detail - what needs to be done, any special requirements, tools needed, etc."
                  className={`w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                  {...register('description')}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
                {!hasEmployerAI(profile) && profile?.role === 'employer' && (
                  <AIUpgradePrompt role="employer" />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full px-4 py-2.5 text-sm border ${errors.category ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    {...register('category')}
                  >
                    <option value="">Select a category</option>
                    {JOB_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
                </div>

                <Input
                  label="Location"
                  placeholder="e.g., Blenheim, Marlborough"
                  error={errors.location?.message}
                  required
                  {...register('location')}
                />
              </div>

              <Input
                label="Required Skills (comma-separated)"
                placeholder="e.g., Plumbing, Pipe Repair, Leak Detection"
                helperText="List specific skills you need the worker to have"
                {...register('skills')}
              />

              <Input
                label="Tags (comma-separated, optional)"
                placeholder="e.g., residential, urgent, outdoor"
                helperText="Up to 10 tags to help workers find your job"
                {...register('tags')}
              />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-3">
                Budget & Timeline
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Budget Type <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'fixed', label: 'Fixed Price' },
                      { value: 'hourly', label: 'Hourly Rate' },
                    ].map(({ value, label }) => (
                      <label key={value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={value}
                          className="text-primary-600"
                          {...register('budgetType')}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Budget range */}
                <div className="sm:col-span-1 grid grid-cols-2 gap-2">
                  <Input
                    label={budgetType === 'hourly' ? 'Min ($/hr)' : 'Min ($)'}
                    type="number"
                    min="0"
                    placeholder="0"
                    error={errors.budgetMin?.message}
                    {...register('budgetMin')}
                  />
                  <Input
                    label={budgetType === 'hourly' ? 'Max ($/hr)' : 'Max ($)'}
                    type="number"
                    min="1"
                    placeholder="0"
                    error={errors.budgetMax?.message}
                    required
                    {...register('budgetMax')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Urgency — color-coded radio buttons */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {URGENCY_OPTIONS.map((opt) => {
                      const isSelected = selectedUrgency === opt.value
                      return (
                        <label
                          key={opt.value}
                          className={`cursor-pointer rounded-lg border-2 p-2.5 transition-all ${
                            isSelected
                              ? `${opt.bg} ${opt.text} ring-2 ${opt.ring} border-transparent`
                              : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                          }`}
                        >
                          <input
                            type="radio"
                            value={opt.value}
                            className="sr-only"
                            {...register('urgency')}
                          />
                          <p className="text-xs font-semibold leading-none">{opt.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{opt.sub}</p>
                        </label>
                      )
                    })}
                  </div>
                </div>

                <Input
                  label="Deadline (Optional)"
                  type="date"
                  {...register('deadline')}
                />
              </div>
            </div>

            {/* Save as template */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveAsTemplate}
                  onChange={(e) => setSaveAsTemplate(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-1.5">
                    <BookmarkPlus className="h-4 w-4 text-primary-500" />
                    Save as a reusable template
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Repost this job with one click — great for recurring work like lawn mowing or cleaning.
                  </p>
                </div>
              </label>
              {saveAsTemplate && (
                <div className="mt-3 pl-7">
                  <Input
                    label="Template name"
                    placeholder="e.g., Monthly lawn mow"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={isSubmitting || savingTemplate}
                className="flex-1"
                size="lg"
              >
                Post Job
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
