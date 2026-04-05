'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Link from 'next/link'
import {
  Shield,
  FileText,
  UserCheck,
  Star,
  Award,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Plus,
  Trash2,
} from 'lucide-react'
import toast from 'react-hot-toast'
import TrustBadge, { TrustScoreBar, VerificationStatusBadge } from '@/components/business/TrustBadge'
import type {
  LicenseDetails,
  InsuranceDetails,
  BackgroundCheckDetails,
  ExternalRatingDetails,
  CertificationRecord,
  BusinessVerification,
} from '@/types'

// ─── Mock initial state (replace with API fetch) ──────────────────────────────
const MOCK_VERIFICATION: BusinessVerification = {
  id: 'v1',
  businessId: 'b1',
  license: null,
  insurance: null,
  backgroundCheck: { status: 'not_started' },
  externalRatings: {},
  certifications: [],
  trustScore: 0,
  verifiedCount: 0,
  updatedAt: new Date().toISOString(),
}

const LICENSE_TYPES = [
  'General Contractor',
  'Electrical Contractor',
  'Plumbing Contractor',
  'HVAC Contractor',
  'Roofing Contractor',
  'Mechanical Contractor',
  'Specialty Contractor',
  'Other',
]

const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
  'Washington D.C.','Puerto Rico','U.S. Virgin Islands','Guam',
  'American Samoa','Northern Mariana Islands',
]

const CERT_SUGGESTIONS = [
  'OSHA 10', 'OSHA 30', 'EPA Lead-Safe', 'LEED Green Associate', 'LEED AP',
  'NFPA Certified', 'NABCEP Certified', 'AIA Member', 'AGC Member',
  'NCCER Certification', 'EPA 608 (HVAC)', 'NATE Certified', 'Other',
]

// ─── helpers ─────────────────────────────────────────────────────────────────

function computeTrustScore(v: BusinessVerification): number {
  let score = 0
  if (v.license?.verified) score += 20
  if (v.insurance?.verified) score += 20
  if (v.backgroundCheck.status === 'clear') score += 20
  const hasExternalRating = Boolean(v.externalRatings.bbbRating || v.externalRatings.googleRating)
  if (hasExternalRating) score += 20
  if (v.certifications.some((c) => c.verified)) score += 20
  return score
}

function computeVerifiedCount(v: BusinessVerification): number {
  let count = 0
  if (v.license?.verified) count++
  if (v.insurance?.verified) count++
  if (v.backgroundCheck.status === 'clear') count++
  if (v.externalRatings.bbbRating || v.externalRatings.googleRating) count++
  if (v.certifications.some((c) => c.verified)) count++
  return count
}

// ─── Sub-forms ───────────────────────────────────────────────────────────────

function LicenseForm({ onSave }: { onSave: (data: LicenseDetails) => void }) {
  const [form, setForm] = useState({
    licenseNumber: '', licenseType: '', state: '', expirationDate: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.licenseNumber || !form.licenseType || !form.state || !form.expirationDate) {
      toast.error('All fields are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/business/verify/license', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')
      onSave(data as LicenseDetails)
      toast.success('License submitted for verification!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error submitting license')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            License Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. GC-445821-NY"
            value={form.licenseNumber}
            onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            License Type <span className="text-red-500">*</span>
          </label>
          <select
            value={form.licenseType}
            onChange={(e) => setForm((p) => ({ ...p, licenseType: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select type…</option>
            {LICENSE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            State / Jurisdiction <span className="text-red-500">*</span>
          </label>
          <select
            value={form.state}
            onChange={(e) => setForm((p) => ({ ...p, state: e.target.value }))}
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Select state…</option>
            {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiration Date <span className="text-red-500">*</span>
          </label>
          <Input
            type="date"
            value={form.expirationDate}
            onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
          />
        </div>
      </div>
      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Submitting…' : 'Submit License'}
      </Button>
    </form>
  )
}

function InsuranceForm({ onSave }: { onSave: (data: InsuranceDetails) => void }) {
  const [form, setForm] = useState({
    hasGeneralLiability: false,
    generalLiabilityPolicyNumber: '',
    generalLiabilityExpiration: '',
    generalLiabilityCoverage: '',
    hasWorkersComp: false,
    workersCompPolicyNumber: '',
    workersCompExpiration: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.hasGeneralLiability && !form.hasWorkersComp) {
      toast.error('Select at least one insurance type')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        generalLiabilityCoverage: form.generalLiabilityCoverage
          ? Number(form.generalLiabilityCoverage)
          : undefined,
      }
      const res = await fetch('/api/business/verify/insurance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to submit')
      onSave(data as InsuranceDetails)
      toast.success('Insurance details submitted!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error submitting insurance')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {/* General Liability */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasGeneralLiability}
            onChange={(e) => setForm((p) => ({ ...p, hasGeneralLiability: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">General Liability Insurance</span>
        </label>
        {form.hasGeneralLiability && (
          <div className="grid sm:grid-cols-3 gap-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Policy Number</label>
              <Input
                placeholder="GL-XXXXXXX"
                value={form.generalLiabilityPolicyNumber}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityPolicyNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
              <Input
                type="date"
                value={form.generalLiabilityExpiration}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityExpiration: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Coverage Amount ($)</label>
              <Input
                type="number"
                placeholder="e.g. 2000000"
                value={form.generalLiabilityCoverage}
                onChange={(e) => setForm((p) => ({ ...p, generalLiabilityCoverage: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Workers' Comp */}
      <div className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-lg space-y-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.hasWorkersComp}
            onChange={(e) => setForm((p) => ({ ...p, hasWorkersComp: e.target.checked }))}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">Workers&apos; Compensation Insurance</span>
        </label>
        {form.hasWorkersComp && (
          <div className="grid sm:grid-cols-2 gap-3 pl-7">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Policy Number</label>
              <Input
                placeholder="WC-XXXXXXX"
                value={form.workersCompPolicyNumber}
                onChange={(e) => setForm((p) => ({ ...p, workersCompPolicyNumber: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
              <Input
                type="date"
                value={form.workersCompExpiration}
                onChange={(e) => setForm((p) => ({ ...p, workersCompExpiration: e.target.value }))}
              />
            </div>
          </div>
        )}
      </div>

      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Submitting…' : 'Submit Insurance Details'}
      </Button>
    </form>
  )
}

function BackgroundCheckSection({
  details,
  onInitiate,
}: {
  details: BackgroundCheckDetails
  onInitiate: (data: BackgroundCheckDetails) => void
}) {
  const [loading, setLoading] = useState(false)

  async function handleInitiate() {
    setLoading(true)
    try {
      const res = await fetch('/api/business/verify/background-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'Checkr' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to initiate')
      onInitiate({ ...details, status: 'pending', provider: data.provider })
      toast.success('Background check initiated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error initiating background check')
    } finally {
      setLoading(false)
    }
  }

  if (details.status === 'clear') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-green-700 dark:text-green-400">
        <CheckCircle className="h-4 w-4" />
        Background check cleared
        {details.completedAt && (
          <span className="text-gray-400 ml-1">
            · {new Date(details.completedAt).toLocaleDateString()}
          </span>
        )}
      </div>
    )
  }

  if (details.status === 'pending') {
    return (
      <div className="flex items-center gap-2 mt-3 text-sm text-yellow-700 dark:text-yellow-400">
        <Clock className="h-4 w-4" />
        Background check in progress via {details.provider ?? 'provider'} — typically 1–3 business days.
      </div>
    )
  }

  return (
    <div className="mt-4 space-y-3">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        We partner with <strong>Checkr</strong> to run secure background checks. This helps enterprise
        clients trust your business. Typical turnaround: <strong>1–3 business days</strong>.
      </p>
      <Button size="sm" onClick={handleInitiate} disabled={loading}>
        {loading ? 'Initiating…' : 'Initiate Background Check via Checkr'}
      </Button>
    </div>
  )
}

function ExternalRatingsForm({
  details,
  onSave,
}: {
  details: ExternalRatingDetails
  onSave: (data: ExternalRatingDetails) => void
}) {
  const [form, setForm] = useState({
    bbbNumber: details.bbbNumber ?? '',
    bbbLink: details.bbbLink ?? '',
    googleProfileLink: details.googleProfileLink ?? '',
  })
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.bbbLink && !form.googleProfileLink) {
      toast.error('Provide at least one external profile link')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/business/sync-external-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to sync')
      onSave(data as ExternalRatingDetails)
      toast.success('External ratings synced!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error syncing ratings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          BBB Business Number
        </label>
        <Input
          placeholder="e.g. 0012345"
          value={form.bbbNumber}
          onChange={(e) => setForm((p) => ({ ...p, bbbNumber: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          BBB Profile Link
        </label>
        <Input
          placeholder="https://www.bbb.org/us/ny/…"
          value={form.bbbLink}
          onChange={(e) => setForm((p) => ({ ...p, bbbLink: e.target.value }))}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Google Business Profile Link
        </label>
        <Input
          placeholder="https://g.page/your-business"
          value={form.googleProfileLink}
          onChange={(e) => setForm((p) => ({ ...p, googleProfileLink: e.target.value }))}
        />
      </div>
      <Button type="submit" disabled={saving} size="sm">
        {saving ? 'Syncing…' : 'Sync Ratings'}
      </Button>

      {(details.bbbRating || details.googleRating) && (
        <div className="flex flex-wrap gap-3 mt-2">
          {details.bbbRating && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">BBB:</span>
              <span className="font-semibold text-green-600">{details.bbbRating}</span>
              {details.bbbReviewCount != null && (
                <span className="text-gray-400">({details.bbbReviewCount} reviews)</span>
              )}
              {details.bbbLink && (
                <a href={details.bbbLink} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
          {details.googleRating && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Google:</span>
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{details.googleRating}</span>
              {details.googleReviewCount != null && (
                <span className="text-gray-400">({details.googleReviewCount} reviews)</span>
              )}
              {details.googleProfileLink && (
                <a href={details.googleProfileLink} target="_blank" rel="noopener noreferrer" className="text-primary-600">
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>
      )}
    </form>
  )
}

function CertificationsManager({
  certs,
  onAdd,
  onRemove,
}: {
  certs: CertificationRecord[]
  onAdd: (cert: CertificationRecord) => void
  onRemove: (id: string) => void
}) {
  const [form, setForm] = useState({
    name: '', issuingOrganization: '', certificateNumber: '', issueDate: '', expirationDate: '',
  })
  const [saving, setSaving] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name) { toast.error('Certification name is required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/business/verify/certifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to add')
      onAdd(data as CertificationRecord)
      setForm({ name: '', issuingOrganization: '', certificateNumber: '', issueDate: '', expirationDate: '' })
      toast.success('Certification added!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error adding certification')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mt-4 space-y-4">
      {/* Existing certs */}
      {certs.length > 0 && (
        <div className="space-y-2">
          {certs.map((cert) => (
            <div
              key={cert.id}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/40 rounded-lg"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</p>
                {cert.issuingOrganization && (
                  <p className="text-xs text-gray-500">{cert.issuingOrganization}</p>
                )}
                {cert.expirationDate && (
                  <p className="text-xs text-gray-400">Expires {new Date(cert.expirationDate).toLocaleDateString()}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {cert.verified ? (
                  <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> Pending
                  </span>
                )}
                <button
                  onClick={() => onRemove(cert.id)}
                  className="p-1 rounded text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove certification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add new */}
      <form onSubmit={handleAdd} className="p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg space-y-3">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Add Certification
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <select
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select certification…</option>
              {CERT_SUGGESTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issuing Organization</label>
            <Input
              placeholder="e.g. OSHA, EPA"
              value={form.issuingOrganization}
              onChange={(e) => setForm((p) => ({ ...p, issuingOrganization: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Certificate Number</label>
            <Input
              placeholder="e.g. OSHA30-2023-001"
              value={form.certificateNumber}
              onChange={(e) => setForm((p) => ({ ...p, certificateNumber: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Issue Date</label>
            <Input
              type="date"
              value={form.issueDate}
              onChange={(e) => setForm((p) => ({ ...p, issueDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expiration Date</label>
            <Input
              type="date"
              value={form.expirationDate}
              onChange={(e) => setForm((p) => ({ ...p, expirationDate: e.target.value }))}
            />
          </div>
        </div>
        <Button type="submit" disabled={saving} size="sm" variant="outline">
          {saving ? 'Adding…' : 'Add Certification'}
        </Button>
      </form>
    </div>
  )
}

// ─── Verification step item ───────────────────────────────────────────────────

interface StepStatus {
  status: 'verified' | 'pending' | 'not_started'
  label: string
}

function getStepStatus(v: BusinessVerification): {
  license: StepStatus
  insurance: StepStatus
  background: StepStatus
  ratings: StepStatus
  certs: StepStatus
} {
  return {
    license: {
      status: v.license?.verified ? 'verified' : 'not_started',
      label: v.license?.verified ? 'Verified' : 'Not Started',
    },
    insurance: {
      status: v.insurance?.verified ? 'verified' : 'not_started',
      label: v.insurance?.verified ? 'Verified' : 'Not Started',
    },
    background: {
      status:
        v.backgroundCheck.status === 'clear'
          ? 'verified'
          : v.backgroundCheck.status === 'pending'
          ? 'pending'
          : 'not_started',
      label:
        v.backgroundCheck.status === 'clear'
          ? 'Clear'
          : v.backgroundCheck.status === 'pending'
          ? 'In Progress'
          : 'Not Started',
    },
    ratings: {
      status:
        v.externalRatings.bbbRating || v.externalRatings.googleRating
          ? 'verified'
          : 'not_started',
      label:
        v.externalRatings.bbbRating || v.externalRatings.googleRating
          ? 'Linked'
          : 'Not Started',
    },
    certs: {
      status: v.certifications.some((c) => c.verified) ? 'verified' : v.certifications.length > 0 ? 'pending' : 'not_started',
      label:
        v.certifications.some((c) => c.verified)
          ? `${v.certifications.filter((c) => c.verified).length} Verified`
          : v.certifications.length > 0
          ? 'Pending Review'
          : 'Not Started',
    },
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function VerificationPage() {
  const [verification, setVerification] = useState<BusinessVerification>(MOCK_VERIFICATION)
  const [openStep, setOpenStep] = useState<string | null>('license')

  function update(patch: Partial<BusinessVerification>) {
    setVerification((prev) => {
      const next = { ...prev, ...patch }
      next.trustScore = computeTrustScore(next)
      next.verifiedCount = computeVerifiedCount(next)
      return next
    })
  }

  const stepStatus = getStepStatus(verification)

  const steps = [
    {
      key: 'license',
      icon: FileText,
      title: 'License Verification',
      description: 'Verify your contractor or trade license for the state(s) you operate in.',
      estimatedTime: '2 min',
      status: stepStatus.license,
      content: (
        <LicenseForm
          onSave={(license) => update({ license })}
        />
      ),
    },
    {
      key: 'insurance',
      icon: Shield,
      title: 'Insurance Verification',
      description: 'Confirm your General Liability and / or Workers\' Compensation insurance.',
      estimatedTime: '3 min',
      status: stepStatus.insurance,
      content: (
        <InsuranceForm
          onSave={(insurance) => update({ insurance })}
        />
      ),
    },
    {
      key: 'background',
      icon: UserCheck,
      title: 'Background Check',
      description: 'Run a background check via Checkr to build enterprise-level trust.',
      estimatedTime: '1–3 business days',
      status: stepStatus.background,
      content: (
        <BackgroundCheckSection
          details={verification.backgroundCheck}
          onInitiate={(backgroundCheck) => update({ backgroundCheck })}
        />
      ),
    },
    {
      key: 'ratings',
      icon: Star,
      title: 'BBB & Google Ratings',
      description: 'Link your BBB and / or Google Business profile to auto-display ratings.',
      estimatedTime: '5 min',
      status: stepStatus.ratings,
      content: (
        <ExternalRatingsForm
          details={verification.externalRatings}
          onSave={(externalRatings) => update({ externalRatings })}
        />
      ),
    },
    {
      key: 'certs',
      icon: Award,
      title: 'Certifications',
      description: 'Add your professional certifications (OSHA, EPA, NATE, NFPA, etc.).',
      estimatedTime: '5 min',
      status: stepStatus.certs,
      content: (
        <CertificationsManager
          certs={verification.certifications}
          onAdd={(cert) => update({ certifications: [...verification.certifications, cert] })}
          onRemove={(id) =>
            update({ certifications: verification.certifications.filter((c) => c.id !== id) })
          }
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/employer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-600" />
              Verification Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Complete verifications to earn trust badges and attract enterprise clients.
            </p>
          </div>

          {/* Trust Score + Progress */}
          <Card className="mb-6">
            <CardContent className="pt-5 pb-5">
              <div className="grid sm:grid-cols-2 gap-6">
                {/* Progress */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Verification Progress
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {verification.verifiedCount}
                    </span>
                    <span className="text-gray-400 text-lg">/ 5</span>
                    <span className="text-sm text-gray-500">verified</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-2">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-700"
                      style={{ width: `${(verification.verifiedCount / 5) * 100}%` }}
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {steps.map((step) => {
                      const Icon = step.icon
                      const isVerified = step.status.status === 'verified'
                      return (
                        <span
                          key={step.key}
                          title={step.title}
                          className={`h-7 w-7 rounded-full flex items-center justify-center ${
                            isVerified
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Trust Score */}
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trust Score</p>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {verification.trustScore}
                    <span className="text-base text-gray-400 font-normal"> / 100</span>
                  </div>
                  <TrustScoreBar score={verification.trustScore} />
                  <div className="mt-3">
                    <TrustBadge
                      verifiedCount={verification.verifiedCount}
                      trustScore={verification.trustScore}
                      showScore
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges unlocked */}
          {verification.verifiedCount > 0 && (
            <Card className="mb-6 border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-900/10">
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-1.5">
                  <Award className="h-4 w-4" />
                  Badges Earned
                </p>
                <div className="flex flex-wrap gap-2">
                  {verification.verifiedCount >= 2 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700">
                      <Shield className="h-3.5 w-3.5" /> Verified Contractor
                    </span>
                  )}
                  {verification.verifiedCount >= 4 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700">
                      <Star className="h-3.5 w-3.5" /> Trusted Professional
                    </span>
                  )}
                  {verification.verifiedCount >= 5 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-300 dark:border-purple-700">
                      <Award className="h-3.5 w-3.5" /> Enterprise Certified
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step, idx) => {
              const Icon = step.icon
              const isOpen = openStep === step.key
              const isVerified = step.status.status === 'verified'
              const isPending = step.status.status === 'pending'

              return (
                <Card key={step.key} className={isVerified ? 'border-green-200 dark:border-green-800' : ''}>
                  <button
                    className="w-full text-left"
                    onClick={() => setOpenStep(isOpen ? null : step.key)}
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center gap-4 p-5">
                      {/* Step number / icon */}
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isVerified
                            ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                            : isPending
                            ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-400 dark:bg-gray-700'
                        }`}
                      >
                        {isVerified ? <CheckCircle className="h-5 w-5" /> : isPending ? <Clock className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {idx + 1}. {step.title}
                          </p>
                          <VerificationStatusBadge status={step.status.status} label={step.status.label} />
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{step.description}</p>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {!isVerified && (
                          <span className="hidden sm:flex items-center gap-1 text-xs text-gray-400">
                            <Clock className="h-3 w-3" /> {step.estimatedTime}
                          </span>
                        )}
                        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{step.description}</p>
                      {step.content}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>

          {/* Info box */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                Why complete verifications?
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1 leading-relaxed">
                Verified businesses appear higher in search results, earn trust badges visible on their public
                profile, and are eligible for enterprise-tier job postings from hospitals, property management
                companies, and government facilities. Each verification step takes only a few minutes.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
