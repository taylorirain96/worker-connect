'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'
import {
  Building2,
  Save,
  ExternalLink,
  CheckCircle,
  Globe,
  Linkedin,
  Facebook,
  MapPin,
  Plus,
  X,
  ChevronLeft,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'

const INDUSTRIES = [
  'General Contractor',
  'Facility Management',
  'Hospital / Healthcare',
  'Hospitality / Hotel',
  'Property Management',
  'Construction Company',
  'Electrical Contractor',
  'Plumbing Contractor',
  'HVAC Contractor',
  'Roofing Contractor',
  'Landscaping / Grounds',
  'Cleaning / Janitorial',
  'Government / Public Works',
  'Other',
]

const COMPANY_SIZES = [
  { value: 'solo', label: 'Solo Operator' },
  { value: '2-10', label: '2–10 Employees' },
  { value: '11-50', label: '11–50 Employees' },
  { value: '50+', label: '50+ Employees' },
]

const CERTIFICATIONS = [
  'OSHA 10',
  'OSHA 30',
  'EPA Lead-Safe',
  'LEED Green Associate',
  'LEED AP',
  'AIA Member',
  'NFPA Certified',
  'NABCEP Certified',
]

interface FormState {
  companyName: string
  industry: string
  companySize: string
  yearsInBusiness: string
  website: string
  linkedIn: string
  facebook: string
  description: string
  missionStatement: string
  licenseNumber: string
  hasGeneralLiability: boolean
  hasWorkersComp: boolean
  bbbRating: string
  certifications: string[]
  serviceAreas: string[]
}

const DEFAULT_FORM: FormState = {
  companyName: '',
  industry: '',
  companySize: 'solo',
  yearsInBusiness: '',
  website: '',
  linkedIn: '',
  facebook: '',
  description: '',
  missionStatement: '',
  licenseNumber: '',
  hasGeneralLiability: false,
  hasWorkersComp: false,
  bbbRating: '',
  certifications: [],
  serviceAreas: [],
}

function ProfileCompletionBar({ pct }: { pct: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600 dark:text-gray-400 font-medium">Profile Completion</span>
        <span className="font-semibold text-primary-600">{pct}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      {pct < 100 && (
        <p className="text-xs text-gray-500 mt-1">
          Complete your profile to build trust with workers and enterprises.
        </p>
      )}
    </div>
  )
}

function computeCompletion(form: FormState): number {
  const stringFields: Array<keyof FormState> = [
    'companyName', 'industry', 'companySize', 'yearsInBusiness',
    'description', 'licenseNumber',
  ]
  const optionalStringFields: Array<keyof FormState> = [
    'website', 'linkedIn', 'missionStatement',
  ]
  let score = 0
  const total = stringFields.length + optionalStringFields.length + 2 // +2 for serviceAreas & certifications
  stringFields.forEach((f) => { if (String(form[f]).trim()) score++ })
  optionalStringFields.forEach((f) => { if (String(form[f]).trim()) score++ })
  if (form.serviceAreas.length > 0) score++
  if (form.certifications.length > 0) score++
  return Math.round((score / total) * 100)
}

export default function EditBusinessProfilePage() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [newArea, setNewArea] = useState('')

  const completionPct = computeCompletion(form)

  function handleChange(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function addServiceArea() {
    const trimmed = newArea.trim()
    if (!trimmed || form.serviceAreas.includes(trimmed)) return
    setForm((prev) => ({ ...prev, serviceAreas: [...prev.serviceAreas, trimmed] }))
    setNewArea('')
  }

  function removeServiceArea(area: string) {
    setForm((prev) => ({ ...prev, serviceAreas: prev.serviceAreas.filter((a) => a !== area) }))
  }

  function toggleCertification(cert: string) {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter((c) => c !== cert)
        : [...prev.certifications, cert],
    }))
  }

  async function handleSave() {
    if (!form.companyName.trim()) {
      toast.error('Company name is required')
      return
    }
    setSaving(true)
    // TODO: save to Firestore businesses collection
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    toast.success('Business profile saved!')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link
                href="/dashboard/employer"
                className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary-600" />
                Edit Business Profile
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                This is what workers and enterprises see when they view your company.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              {form.companyName && (
                <Link
                  href={`/business/${slugify(form.companyName)}`}
                  className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                  Preview
                </Link>
              )}
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </div>

          {/* Completion bar */}
          <Card className="mb-6">
            <CardContent className="pt-4 pb-4">
              <ProfileCompletionBar pct={completionPct} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Apex General Contracting"
                      value={form.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Industry / Category
                    </label>
                    <select
                      value={form.industry}
                      onChange={(e) => handleChange('industry', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i} value={i}>{i}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Size
                    </label>
                    <select
                      value={form.companySize}
                      onChange={(e) => handleChange('companySize', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      {COMPANY_SIZES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Years in Business
                    </label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="e.g. 12"
                      value={form.yearsInBusiness}
                      onChange={(e) => handleChange('yearsInBusiness', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Number
                    </label>
                    <Input
                      placeholder="e.g. GC-445821-NY"
                      value={form.licenseNumber}
                      onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Company Description
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Describe what your company does, specializations, and key differentiators…"
                      value={form.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mission Statement
                    </label>
                    <Input
                      placeholder="Your company's core mission in one sentence…"
                      value={form.missionStatement}
                      onChange={(e) => handleChange('missionStatement', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Online Presence */}
            <Card>
              <CardHeader>
                <CardTitle>Online Presence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Input
                      placeholder="Website URL (https://…)"
                      value={form.website}
                      onChange={(e) => handleChange('website', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Input
                      placeholder="LinkedIn company page URL"
                      value={form.linkedIn}
                      onChange={(e) => handleChange('linkedIn', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Facebook className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Input
                      placeholder="Facebook page URL"
                      value={form.facebook}
                      onChange={(e) => handleChange('facebook', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Areas */}
            <Card>
              <CardHeader>
                <CardTitle>Service Areas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="City, State (e.g. New York, NY)"
                      value={newArea}
                      onChange={(e) => setNewArea(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addServiceArea() } }}
                    />
                  </div>
                  <Button variant="outline" size="sm" onClick={addServiceArea}>
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {form.serviceAreas.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {form.serviceAreas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800 px-3 py-1 rounded-full text-sm"
                      >
                        <MapPin className="h-3 w-3" />
                        {area}
                        <button
                          onClick={() => removeServiceArea(area)}
                          className="ml-1 text-primary-500 hover:text-primary-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No service areas added yet.</p>
                )}
              </CardContent>
            </Card>

            {/* Insurance & Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>Insurance & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.hasGeneralLiability}
                      onChange={(e) => handleChange('hasGeneralLiability', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        General Liability Insurance
                      </p>
                      <p className="text-xs text-gray-500">I have active general liability insurance</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.hasWorkersComp}
                      onChange={(e) => handleChange('hasWorkersComp', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        Workers&apos; Compensation Insurance
                      </p>
                      <p className="text-xs text-gray-500">I have active workers&apos; comp coverage</p>
                    </div>
                  </label>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    BBB Rating (optional)
                  </label>
                  <Input
                    placeholder="e.g. A+"
                    value={form.bbbRating}
                    onChange={(e) => handleChange('bbbRating', e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Certifications */}
            <Card>
              <CardHeader>
                <CardTitle>Certifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map((cert) => {
                    const selected = form.certifications.includes(cert)
                    return (
                      <button
                        key={cert}
                        onClick={() => toggleCertification(cert)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                          selected
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-primary-400'
                        }`}
                      >
                        {selected && <CheckCircle className="h-3.5 w-3.5" />}
                        {cert}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Save — mobile */}
            <div className="sm:hidden">
              <Button onClick={handleSave} disabled={saving} className="w-full flex items-center justify-center gap-2">
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
