'use client'
import { useState, useEffect } from 'react'
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
  MapPin,
  Plus,
  X,
  ChevronLeft,
} from 'lucide-react'
import SocialMark from '@/components/ui/SocialMark'
import toast from 'react-hot-toast'
import { slugify } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

const INDUSTRIES = [
  'General Contractor / Builder',
  'Plumbing & Gasfitting',
  'Electrical',
  'Carpentry & Joinery',
  'HVAC / Heat Pumps',
  'Roofing',
  'Landscaping / Garden',
  'Painting & Decorating',
  'Flooring',
  'Cleaning / Janitorial',
  'Moving & Relocation',
  'Building & Construction',
  'General Trades',
  'Property Maintenance',
  'Tiling',
  'Fencing',
  'Concreting',
  'Drainage',
  'Glazing',
  'Locksmith',
  'Pest Control',
  'Facility Management',
  'Property Management',
  'Government / Public Works',
  'Other',
]

const NZ_REGIONS = [
  'Blenheim, Marlborough',
  'Nelson',
  'Christchurch, Canterbury',
  'Wellington',
  'Auckland',
  'Hamilton, Waikato',
  'Tauranga, Bay of Plenty',
  'Dunedin, Otago',
  'Invercargill, Southland',
  'Queenstown, Otago',
  "Napier/Hastings, Hawke's Bay",
  'Palmerston North, Manawatū',
  'New Plymouth, Taranaki',
  'Rotorua, Bay of Plenty',
  'Whangarei, Northland',
]

const COMPANY_SIZES = [
  { value: 'solo', label: 'Solo Operator' },
  { value: '2-10', label: '2–10 Employees' },
  { value: '11-50', label: '11–50 Employees' },
  { value: '50+', label: '50+ Employees' },
]

const CERTIFICATIONS = [
  'Site Safe Passport',
  'Site Safe Gold Card',
  'First Aid Certificate',
  'Asbestos Awareness Certificate',
  'Height Safety Certified',
  'Electrical Practising Licence (EPL)',
  'Plumber / Gasfitter / Drainlayer Licence',
  'Licensed Building Practitioner (LBP)',
  'Master Builder Member',
  'Registered Architect (NZIA)',
  'NZ Certificate in Construction (NZQA)',
  'Health & Safety Representative (HSR)',
  'Trade Qualified (NZQA)',
  'Working at Heights (WAH) Certified',
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
  hasPublicLiability: boolean
  hasACCEmployerLevy: boolean
  isRatedTrader: boolean
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
  hasPublicLiability: false,
  hasACCEmployerLevy: false,
  isRatedTrader: false,
  certifications: [],
  serviceAreas: [],
}

function ProfileCompletionBar({ pct, missing }: { pct: number; missing: string[] }) {
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
      {missing.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Still needed to complete your profile:</p>
          <ul className="flex flex-wrap gap-1">
            {missing.map((m) => (
              <li key={m} className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-full">
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function computeCompletion(form: FormState): { pct: number; missing: string[] } {
  const requiredFields: Array<{ key: keyof FormState; label: string }> = [
    { key: 'industry', label: 'Industry' },
    { key: 'companySize', label: 'Company Size' },
    { key: 'yearsInBusiness', label: 'Years in Business' },
    { key: 'description', label: 'Company Description' },
  ]
  const optionalFields: Array<{ key: keyof FormState; label: string }> = [
    { key: 'companyName', label: 'Business / Trading Name' },
    { key: 'licenseNumber', label: 'Licence Number' },
    { key: 'website', label: 'Website' },
    { key: 'linkedIn', label: 'LinkedIn' },
    { key: 'missionStatement', label: 'Mission Statement' },
  ]
  const missing: string[] = []
  let score = 0
  const total = requiredFields.length + optionalFields.length + 3 // +3 for serviceAreas, certifications, insurance

  requiredFields.forEach(({ key, label }) => {
    if (String(form[key]).trim()) {
      score++
    } else {
      missing.push(label)
    }
  })
  optionalFields.forEach(({ key, label }) => {
    if (String(form[key]).trim()) {
      score++
    } else {
      missing.push(label)
    }
  })
  if (form.serviceAreas.length > 0) {
    score++
  } else {
    missing.push('Service Areas')
  }
  if (form.certifications.length > 0) {
    score++
  } else {
    missing.push('Certifications')
  }
  if (form.hasPublicLiability || form.hasACCEmployerLevy) {
    score++
  } else {
    missing.push('Insurance')
  }

  return { pct: Math.round((score / total) * 100), missing }
}

export default function EditBusinessProfilePage() {
  const { user } = useAuth()
  const [form, setForm] = useState<FormState>(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [newArea, setNewArea] = useState('')

  const { pct: completionPct, missing: completionMissing } = computeCompletion(form)

  // Load saved profile on mount
  useEffect(() => {
    if (!user?.uid) return
    fetch('/api/business/profile', { headers: { 'x-user-id': user.uid } })
      .then((r) => r.json())
      .then((json: { profile?: Partial<FormState> | null }) => {
        if (json.profile) {
          setForm((prev) => ({ ...prev, ...json.profile }))
        }
      })
      .catch(() => toast.error('Failed to load profile'))
  }, [user?.uid])

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
    if (!user?.uid) { toast.error('Not authenticated'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/business/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Business profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
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
              {form.companyName?.trim() && (
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
              <ProfileCompletionBar pct={completionPct} missing={completionMissing} />
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
                      Business / Trading Name <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <Input
                      placeholder="e.g. Marlborough Plumbing & Gas"
                      value={form.companyName}
                      onChange={(e) => handleChange('companyName', e.target.value)}
                    />
                    <p className="text-xs text-gray-400 mt-1">Leave blank if you operate under your own name</p>
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
                      Licence Number
                    </label>
                    <Input
                      placeholder="e.g. LBP-123456"
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
                    <SocialMark platform="linkedin" className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <Input
                      placeholder="LinkedIn company page URL"
                      value={form.linkedIn}
                      onChange={(e) => handleChange('linkedIn', e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <SocialMark platform="facebook" className="h-4 w-4 text-gray-400 flex-shrink-0" />
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
                {/* Quick-add NZ regions */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">Quick-add a common NZ region:</label>
                  <select
                    value=""
                    onChange={(e) => {
                      const val = e.target.value
                      if (val && !form.serviceAreas.includes(val)) {
                        setForm((prev) => ({ ...prev, serviceAreas: [...prev.serviceAreas, val] }))
                      }
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select a region…</option>
                    {NZ_REGIONS.map((r) => (
                      <option key={r} value={r} disabled={form.serviceAreas.includes(r)}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="e.g. Blenheim, Marlborough"
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
                <div className="mb-3">
                  <select
                    value=""
                    onChange={(e) => {
                      if (!e.target.value) return
                      if (!form.serviceAreas.includes(e.target.value)) {
                        setForm((prev) => ({ ...prev, serviceAreas: [...prev.serviceAreas, e.target.value] }))
                      }
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Quick pick a NZ region…</option>
                    {NZ_REGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
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
                      checked={form.hasPublicLiability}
                      onChange={(e) => handleChange('hasPublicLiability', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        Public Liability Insurance
                      </p>
                      <p className="text-xs text-gray-500">I have active public liability insurance</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.hasACCEmployerLevy}
                      onChange={(e) => handleChange('hasACCEmployerLevy', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        ACC Employer Levy / Workplace Insurance
                      </p>
                      <p className="text-xs text-gray-500">I have ACC employer levy coverage or workplace insurance</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.isRatedTrader}
                      onChange={(e) => handleChange('isRatedTrader', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                        Rated Trader
                      </p>
                      <p className="text-xs text-gray-500">I am a Rated Trader verified member</p>
                    </div>
                  </label>
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
