'use client'
import { useState, useEffect, useRef } from 'react'
import { Sparkles, Upload, FileText, Eye, RefreshCw, Save, Printer, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import type { UserProfile } from '@/types'
import { getCV, saveCV, uploadCVFile } from '@/lib/cv'
import AIAddonPrompt from '@/components/ui/AIAddonPrompt'

interface CVSectionProps {
  userId: string
  profile: UserProfile
  hasAI: boolean
}

type Tab = 'upload' | 'ai'
type AIStep = 1 | 2 | 3 | 4

const YEARS_OPTIONS = ['1-2 years', '3-5 years', '5-10 years', '10+ years']
const EMPLOYMENT_OPTIONS = ['Gig work', 'Full-time', 'Part-time', 'Either']

export default function CVSection({ userId, profile, hasAI }: CVSectionProps) {
  const [activeTab, setActiveTab] = useState<Tab>('upload')
  const [existingCV, setExistingCV] = useState<{ fileName: string; fileUrl: string; visibility: 'private' | 'public' } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [visibility, setVisibility] = useState<'private' | 'public'>('private')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI builder state
  const [aiStep, setAIStep] = useState<AIStep>(1)
  const [aiLoading, setAILoading] = useState(false)
  const [aiInputs, setAIInputs] = useState({
    name: profile.displayName ?? '',
    trade: '',
    years: '3-5 years',
    location: profile.location ?? '',
    strengths: '',
    skills: profile.skills?.join(', ') ?? '',
    employmentType: 'Either',
  })
  const [generatedCV, setGeneratedCV] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getCV(userId).then((cv) => {
      if (cv) {
        setExistingCV({ fileName: cv.fileName, fileUrl: cv.fileUrl, visibility: cv.visibility })
        setVisibility(cv.visibility)
      }
    }).catch(() => {/* silent */})
  }, [userId])

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5 MB')
      return
    }
    setUploading(true)
    try {
      const url = await uploadCVFile(userId, file)
      await saveCV(userId, {
        fileName: file.name,
        fileUrl: url,
        fileSize: file.size,
        source: 'upload',
        visibility,
      })
      setExistingCV({ fileName: file.name, fileUrl: url, visibility })
      toast.success('CV uploaded successfully!')
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const handleVisibilityChange = async (newVisibility: 'private' | 'public') => {
    setVisibility(newVisibility)
    if (existingCV) {
      try {
        await saveCV(userId, {
          fileName: existingCV.fileName,
          fileUrl: existingCV.fileUrl,
          source: 'upload',
          visibility: newVisibility,
        })
        setExistingCV(prev => prev ? { ...prev, visibility: newVisibility } : null)
        toast.success('Visibility updated')
      } catch {
        toast.error('Failed to update visibility')
      }
    }
  }

  const handleGenerateCV = async () => {
    setAILoading(true)
    setAIStep(3)
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
      const data = await res.json() as { text?: string; error?: string }
      if (!res.ok || !data.text) {
        toast.error(data.error ?? 'Generation failed')
        setAIStep(2)
        return
      }
      setGeneratedCV(data.text)
      setAIStep(4)
    } catch {
      toast.error('Failed to generate CV')
      setAIStep(2)
    } finally {
      setAILoading(false)
    }
  }

  const handleSaveGeneratedCV = async () => {
    setSaving(true)
    try {
      const blob = new Blob([generatedCV], { type: 'text/plain' })
      const file = new File([blob], `${aiInputs.name.replace(/\s+/g, '_')}_CV.txt`, { type: 'text/plain' })
      const url = await uploadCVFile(userId, file)
      await saveCV(userId, {
        fileName: file.name,
        fileUrl: url,
        fileSize: blob.size,
        source: 'ai_generated',
        visibility,
      })
      setExistingCV({ fileName: file.name, fileUrl: url, visibility })
      toast.success('CV saved to profile!')
      setAIStep(1)
      setActiveTab('upload')
    } catch {
      toast.error('Failed to save CV')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          CV / Résumé
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tab bar */}
        <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'upload' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            📄 Upload CV
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'ai' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> Build with AI
          </button>
        </div>

        {/* Upload tab */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            {existingCV ? (
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">{existingCV.fileName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={existingCV.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </a>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 rounded px-2 py-1"
                  >
                    Replace
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file) handleFileUpload(file)
                }}
                className="flex flex-col items-center justify-center gap-2 p-8 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 cursor-pointer hover:border-primary-400 transition-colors"
              >
                {uploading ? (
                  <div className="h-6 w-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click or drag to upload</p>
                    <p className="text-xs text-gray-500">PDF only, max 5 MB</p>
                  </>
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />

            {/* Visibility toggle */}
            <div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">CV Visibility</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('private')}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors ${visibility === 'private' ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-primary-400'}`}
                >
                  🔒 Private — sent when you apply
                </button>
                <button
                  type="button"
                  onClick={() => handleVisibilityChange('public')}
                  disabled={!hasAI}
                  className={`flex-1 text-xs py-2 rounded-lg border transition-colors relative ${visibility === 'public' ? 'bg-primary-600 border-primary-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'} ${!hasAI ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary-400'}`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {!hasAI && <Lock className="h-3 w-3" />}
                    🌐 Public profile
                    {!hasAI && <span className="text-indigo-600 dark:text-indigo-400 ml-1">Pro</span>}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI builder tab */}
        {activeTab === 'ai' && !hasAI && (
          <div className="space-y-3">
            <AIAddonPrompt role="worker" context="cv" onClose={() => setActiveTab('upload')} />
          </div>
        )}

        {activeTab === 'ai' && hasAI && (
          <div className="space-y-4">
            {/* Step 1 — About you */}
            {aiStep === 1 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Step 1 — About you</p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Full name</label>
                  <input
                    type="text"
                    value={aiInputs.name}
                    onChange={(e) => setAIInputs(p => ({ ...p, name: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Trade / job title</label>
                  <input
                    type="text"
                    value={aiInputs.trade}
                    onChange={(e) => setAIInputs(p => ({ ...p, trade: e.target.value }))}
                    placeholder="e.g. Licensed Plumber, Electrician, Carpenter"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Years of experience</label>
                  <select
                    value={aiInputs.years}
                    onChange={(e) => setAIInputs(p => ({ ...p, years: e.target.value }))}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500"
                  >
                    {YEARS_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={aiInputs.location}
                    onChange={(e) => setAIInputs(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Auckland, New Zealand"
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

            {/* Step 2 — Your work */}
            {aiStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Step 2 — Your work</p>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">What are you best known for or most proud of?</label>
                  <p className="text-xs text-gray-500 mb-1">Just write naturally — we'll make it sound professional</p>
                  <textarea
                    rows={3}
                    value={aiInputs.strengths}
                    onChange={(e) => setAIInputs(p => ({ ...p, strengths: e.target.value }))}
                    placeholder="e.g. I always show up on time, clean up after myself and my bathroom renovations always get 5 star reviews"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Key skills</label>
                  <input
                    type="text"
                    value={aiInputs.skills}
                    onChange={(e) => setAIInputs(p => ({ ...p, skills: e.target.value }))}
                    placeholder="e.g. Plumbing, Hot water systems, Drain unblocking"
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Looking for</label>
                  <div className="flex flex-wrap gap-2">
                    {EMPLOYMENT_OPTIONS.map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setAIInputs(p => ({ ...p, employmentType: opt }))}
                        className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${aiInputs.employmentType === opt ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-indigo-400'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAIStep(1)}
                    className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:border-gray-400 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    type="button"
                    disabled={!aiInputs.strengths.trim()}
                    onClick={handleGenerateCV}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="h-4 w-4" /> Generate my CV
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 — Generating */}
            {aiStep === 3 && (
              <div className="flex flex-col items-center justify-center py-10 gap-4">
                <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {aiLoading ? 'Writing your CV...' : 'Almost there...'}
                </p>
              </div>
            )}

            {/* Step 4 — Review & save */}
            {aiStep === 4 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Step 4 — Review & save</p>
                <div className="cv-print-area">
                  <style>{`@media print { body > * { display: none; } .cv-print-area { display: block !important; } }`}</style>
                  <textarea
                    rows={12}
                    value={generatedCV}
                    onChange={(e) => setGeneratedCV(e.target.value)}
                    className="w-full text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 font-mono focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAIStep(3)
                      handleGenerateCV()
                    }}
                    className="flex-1 py-2 rounded-lg border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveGeneratedCV}
                    disabled={saving}
                    className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    {saving ? <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="h-4 w-4" />}
                    Save to Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium flex items-center justify-center gap-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Printer className="h-4 w-4" /> Print / Save as PDF
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
