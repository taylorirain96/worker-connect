'use client'
import { useState, useEffect, useRef } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { Sparkles, Upload, FileText, Eye, Lock, RefreshCw, Download, CheckCircle } from 'lucide-react'
import type { UserProfile } from '@/types'
import { getCV, saveCV, uploadCVFile, type WorkerCV } from '@/lib/cv'

interface CVSectionProps {
  userId: string
  profile: UserProfile
  hasAI: boolean
}

type Tab = 'upload' | 'ai'
type AIStep = 1 | 2 | 3 | 4

interface AIInputs {
  name: string
  trade: string
  years: string
  location: string
  strengths: string
  skills: string
  employmentType: string
}

export default function CVSection({ userId, profile, hasAI }: CVSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [existingCV, setExistingCV] = useState<WorkerCV | null>(null)
  const [loadingCV, setLoadingCV] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI builder state
  const [aiStep, setAIStep] = useState<AIStep>(1)
  const [aiLoading, setAILoading] = useState(false)
  const [generatedCV, setGeneratedCV] = useState('')
  const [savingCV, setSavingCV] = useState(false)
  const [aiInputs, setAIInputs] = useState<AIInputs>({
    name: profile.displayName ?? '',
    trade: '',
    years: '1-2',
    location: profile.location ?? '',
    strengths: '',
    skills: profile.skills?.join(', ') ?? '',
    employmentType: 'any',
  })

  useEffect(() => {
    getCV(userId)
      .then((cv) => setExistingCV(cv))
      .catch(() => null)
      .finally(() => setLoadingCV(false))
  }, [userId])

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB')
      return
    }
    setUploading(true)
    try {
      const fileUrl = await uploadCVFile(userId, file)
      await saveCV(userId, {
        fileName: file.name,
        fileUrl,
        fileSize: file.size,
        source: 'upload',
        visibility,
      })
      const updated = await getCV(userId)
      setExistingCV(updated)
      toast.success('CV uploaded successfully!')
    } catch {
      toast.error('Failed to upload CV. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFileUpload(file)
  }

  const handleVisibilityChange = async (newVisibility: 'private' | 'public') => {
    setVisibility(newVisibility)
    if (existingCV) {
      try {
        await saveCV(userId, { ...existingCV, visibility: newVisibility })
        setExistingCV((prev) => prev ? { ...prev, visibility: newVisibility } : prev)
        toast.success('Visibility updated')
      } catch {
        toast.error('Failed to update visibility')
      }
    }
  }

  const handleGenerateCV = async () => {
    setAILoading(true)
    try {
      const res = await fetch('/api/ai/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'cv',
          userId,
          userRole: 'worker',
          inputs: aiInputs,
        }),
      })
      const data = await res.json() as { text?: string }
      if (data.text) {
        setGeneratedCV(data.text)
        setAIStep(4)
      } else {
        toast.error('Failed to generate CV')
      }
    } catch {
      toast.error('AI generation failed')
    } finally {
      setAILoading(false)
    }
  }

  const handleSaveGeneratedCV = async () => {
    if (!generatedCV) return
    setSavingCV(true)
    try {
      const blob = new Blob([generatedCV], { type: 'text/plain' })
      const file = new File([blob], `cv_${userId}_${Date.now()}.txt`, { type: 'text/plain' })
      const storageRef = await uploadCVFile(userId, file)
      await saveCV(userId, {
        fileName: `AI Generated CV — ${new Date().toLocaleDateString('en-NZ')}`,
        fileUrl: storageRef,
        fileSize: blob.size,
        source: 'ai_generated',
        visibility,
      })
      const updated = await getCV(userId)
      setExistingCV(updated)
      toast.success('CV saved to your profile!')
      setAIStep(1)
      setActiveTab('upload')
    } catch {
      toast.error('Failed to save CV')
    } finally {
      setSavingCV(false)
    }
  }

  const handleDownloadPDF = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return
    printWindow.document.write(`
      <html>
        <head>
          <title>CV</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; white-space: pre-wrap; line-height: 1.6; }
          </style>
        </head>
        <body>${generatedCV.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
      </html>
    `)
    printWindow.document.close()
    printWindow.print()
  }

  const isProWorker = hasAI

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          Your CV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors ${activeTab === 'upload' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            Upload CV
          </button>
          {hasAI && (
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-1 text-sm py-1.5 rounded-md font-medium transition-colors flex items-center justify-center gap-1.5 ${activeTab === 'ai' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Build with AI
            </button>
          )}
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {loadingCV ? (
              <div className="h-8 flex items-center justify-center">
                <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : existingCV ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <FileText className="h-8 w-8 text-primary-600 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{existingCV.fileName}</p>
                  <p className="text-xs text-gray-500">{existingCV.source === 'ai_generated' ? 'AI Generated' : 'Uploaded'}</p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={existingCV.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    View
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 transition-colors"
              >
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Drag &amp; drop your CV here</p>
                <p className="text-xs text-gray-500 mt-1">PDF only, max 5MB</p>
                <p className="text-xs text-gray-400 mt-1">or click to browse</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
                e.target.value = ''
              }}
            />

            {uploading && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="h-4 w-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </div>
            )}

            {/* Visibility toggle */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">CV Visibility</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('private')}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${visibility === 'private' ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'}`}
                >
                  🔒 Private
                </button>
                <button
                  type="button"
                  onClick={() => isProWorker ? handleVisibilityChange('public') : null}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors flex items-center justify-center gap-1 ${!isProWorker ? 'opacity-50 cursor-not-allowed border-gray-300 dark:border-gray-600 text-gray-400' : visibility === 'public' ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                >
                  {!isProWorker && <Lock className="h-3 w-3" />}
                  Public Profile
                </button>
              </div>
              {!isProWorker && (
                <p className="text-xs text-gray-400">
                  <a href="/pricing" className="text-indigo-500 hover:underline">Upgrade to Pro</a> to show CV on your public profile
                </p>
              )}
            </div>
          </div>
        )}

        {/* AI Builder Tab */}
        {activeTab === 'ai' && hasAI && (
          <div className="space-y-4">
            {/* Step indicator */}
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4] as AIStep[]).map((step) => (
                <div key={step} className="flex items-center gap-1">
                  <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${aiStep >= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                    {aiStep > step ? <CheckCircle className="h-3.5 w-3.5" /> : step}
                  </div>
                  {step < 4 && <div className={`h-0.5 w-6 ${aiStep > step ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                </div>
              ))}
              <span className="text-xs text-gray-500 ml-1">
                {aiStep === 1 ? 'Basic Info' : aiStep === 2 ? 'About You' : aiStep === 3 ? 'Generate' : 'Review & Save'}
              </span>
            </div>

            {/* Step 1 — Basic info */}
            {aiStep === 1 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={aiInputs.name}
                    onChange={(e) => setAIInputs(p => ({ ...p, name: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Trade / Job Title</label>
                  <input
                    type="text"
                    value={aiInputs.trade}
                    onChange={(e) => setAIInputs(p => ({ ...p, trade: e.target.value }))}
                    placeholder="e.g., Licensed Plumber, Electrician, Builder"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Years of Experience</label>
                  <select
                    value={aiInputs.years}
                    onChange={(e) => setAIInputs(p => ({ ...p, years: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="1-2">1–2 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5-10">5–10 years</option>
                    <option value="10+">10+ years</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={aiInputs.location}
                    onChange={(e) => setAIInputs(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g., Auckland, NZ"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <button
                  type="button"
                  disabled={!aiInputs.name.trim() || !aiInputs.trade.trim()}
                  onClick={() => setAIStep(2)}
                  className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                >
                  Next →
                </button>
              </div>
            )}

            {/* Step 2 — About you */}
            {aiStep === 2 && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">What are you best known for / proudest work?</label>
                  <textarea
                    rows={3}
                    value={aiInputs.strengths}
                    onChange={(e) => setAIInputs(p => ({ ...p, strengths: e.target.value }))}
                    placeholder="e.g., Fast leak repairs, tidy workmanship, always on time"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key Skills</label>
                  <input
                    type="text"
                    value={aiInputs.skills}
                    onChange={(e) => setAIInputs(p => ({ ...p, skills: e.target.value }))}
                    placeholder="e.g., Pipe repair, hot water systems, drainage"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type of work looking for?</label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: 'gig', label: 'Gig Work' },
                      { value: 'full-time', label: 'Full-time' },
                      { value: 'part-time', label: 'Part-time' },
                      { value: 'any', label: 'Both' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setAIInputs(p => ({ ...p, employmentType: opt.value }))}
                        className={`text-xs py-1.5 px-3 rounded-lg border transition-colors ${aiInputs.employmentType === opt.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAIStep(1)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={!aiInputs.strengths.trim()}
                    onClick={() => setAIStep(3)}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Generate */}
            {aiStep === 3 && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                  <p className="font-semibold text-gray-900 dark:text-white">Ready to generate your CV</p>
                  <div className="text-gray-600 dark:text-gray-400 space-y-1">
                    <p><span className="font-medium">Name:</span> {aiInputs.name}</p>
                    <p><span className="font-medium">Trade:</span> {aiInputs.trade}</p>
                    <p><span className="font-medium">Experience:</span> {aiInputs.years} years</p>
                    <p><span className="font-medium">Location:</span> {aiInputs.location || 'New Zealand'}</p>
                    <p><span className="font-medium">Skills:</span> {aiInputs.skills || 'Not specified'}</p>
                    <p><span className="font-medium">Work type:</span> {aiInputs.employmentType}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setAIStep(2)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={handleGenerateCV}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {aiLoading
                      ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Generating...</>
                      : <><Sparkles className="h-4 w-4" /> Generate my CV ✨</>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Step 4 — Review & Save */}
            {aiStep === 4 && (
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">Review &amp; edit your CV</p>
                <textarea
                  rows={14}
                  value={generatedCV}
                  onChange={(e) => setGeneratedCV(e.target.value)}
                  className="w-full text-sm font-mono rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={aiLoading}
                    onClick={() => { setAIStep(3); handleGenerateCV() }}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </button>
                  <button
                    type="button"
                    disabled={savingCV}
                    onClick={handleSaveGeneratedCV}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    {savingCV
                      ? <><div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</>
                      : <><CheckCircle className="h-4 w-4" /> Save to Profile</>
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
