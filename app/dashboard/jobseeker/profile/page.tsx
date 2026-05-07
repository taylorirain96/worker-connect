'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import toast from 'react-hot-toast'
import {
  User, MapPin, Phone, Mail, FileText, Plus, Trash2,
  Briefcase, GraduationCap, Camera, Upload, CheckCircle,
  ToggleLeft, ToggleRight, TrendingUp, Zap, ArrowLeft,
} from 'lucide-react'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'

interface WorkHistoryEntry {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string
  current: boolean
  description: string
}

interface EducationEntry {
  id: string
  institution: string
  qualification: string
  year: string
}

interface JobseekerProfileData {
  fullName: string
  location: string
  phone: string
  email: string
  headline: string
  bio: string
  skills: string[]
  skillInput: string
  workHistory: WorkHistoryEntry[]
  education: EducationEntry[]
  cvUrl: string
  availability: string[]
  salaryMin: string
  salaryMax: string
  photoURL: string
  portfolioPhotos: string[]
  openToWork: boolean
}

const AVAILABILITY_OPTIONS = [
  { id: 'full-time', label: 'Full-time' },
  { id: 'part-time', label: 'Part-time' },
  { id: 'contract', label: 'Contract' },
  { id: 'casual', label: 'Casual' },
]

function calcProfileStrength(data: JobseekerProfileData): { pct: number; tips: Array<{ label: string; points: number }> } {
  const tips: Array<{ label: string; points: number }> = []
  let score = 20
  if (data.photoURL) { score += 15 } else { tips.push({ label: 'Add a profile photo', points: 15 }) }
  if (data.cvUrl) { score += 20 } else { tips.push({ label: 'Upload your CV', points: 20 }) }
  if (data.workHistory.length > 0) { score += 15 } else { tips.push({ label: 'Add work history', points: 15 }) }
  if (data.headline) { score += 10 } else { tips.push({ label: 'Add a professional headline', points: 10 }) }
  if (data.skills.length > 0) { score += 10 } else { tips.push({ label: 'Add your skills', points: 10 }) }
  if (data.bio) { score += 10 } else { tips.push({ label: 'Write an About Me', points: 10 }) }
  return { pct: Math.min(score, 100), tips }
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 10)
}

export default function JobseekerProfilePage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploadingCv, setUploadingCv] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const cvInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const portfolioInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState<JobseekerProfileData>({
    fullName: '',
    location: '',
    phone: '',
    email: '',
    headline: '',
    bio: '',
    skills: [],
    skillInput: '',
    workHistory: [],
    education: [],
    cvUrl: '',
    availability: [],
    salaryMin: '',
    salaryMax: '',
    photoURL: '',
    portfolioPhotos: [],
    openToWork: false,
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [loading, user, router])

  // Load existing profile data
  useEffect(() => {
    if (!user?.uid || !db) return
    async function load() {
      try {
        const snap = await getDoc(doc(db!, 'users', user!.uid))
        if (snap.exists()) {
          const d = snap.data() as Record<string, unknown>
          setFormData((prev) => ({
            ...prev,
            fullName: (d.displayName as string) ?? '',
            location: (d.location as string) ?? '',
            phone: (d.phone as string) ?? '',
            email: (d.email as string) ?? user!.email ?? '',
            headline: (d.headline as string) ?? '',
            bio: (d.bio as string) ?? '',
            skills: Array.isArray(d.skills) ? (d.skills as string[]) : [],
            workHistory: Array.isArray(d.workHistory) ? (d.workHistory as WorkHistoryEntry[]) : [],
            education: Array.isArray(d.education) ? (d.education as EducationEntry[]) : [],
            cvUrl: (d.cvUrl as string) ?? '',
            availability: Array.isArray(d.availability) ? (d.availability as string[]) : [],
            salaryMin: (d.salaryMin as string) ?? '',
            salaryMax: (d.salaryMax as string) ?? '',
            photoURL: (d.photoURL as string) ?? '',
            portfolioPhotos: Array.isArray(d.portfolioPhotos) ? (d.portfolioPhotos as string[]) : [],
            openToWork: !!(d.openToWork),
          }))
        } else {
          setFormData((prev) => ({ ...prev, email: user!.email ?? '', fullName: user!.displayName ?? '' }))
        }
      } catch {
        // ignore
      }
    }
    load()
  }, [user])

  const set = (key: keyof JobseekerProfileData, value: unknown) =>
    setFormData((prev) => ({ ...prev, [key]: value }))

  const addSkill = () => {
    const skill = formData.skillInput.trim()
    if (!skill || formData.skills.includes(skill)) return
    set('skills', [...formData.skills, skill])
    set('skillInput', '')
  }

  const removeSkill = (skill: string) =>
    set('skills', formData.skills.filter((s) => s !== skill))

  const addWorkEntry = () =>
    set('workHistory', [...formData.workHistory, { id: randomId(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' }])

  const updateWorkEntry = (id: string, field: keyof WorkHistoryEntry, value: string | boolean) =>
    set('workHistory', formData.workHistory.map((e) => e.id === id ? { ...e, [field]: value } : e))

  const removeWorkEntry = (id: string) =>
    set('workHistory', formData.workHistory.filter((e) => e.id !== id))

  const addEducationEntry = () =>
    set('education', [...formData.education, { id: randomId(), institution: '', qualification: '', year: '' }])

  const updateEducationEntry = (id: string, field: keyof EducationEntry, value: string) =>
    set('education', formData.education.map((e) => e.id === id ? { ...e, [field]: value } : e))

  const removeEducationEntry = (id: string) =>
    set('education', formData.education.filter((e) => e.id !== id))

  const toggleAvailability = (id: string) => {
    const current = formData.availability
    set('availability', current.includes(id) ? current.filter((a) => a !== id) : [...current, id])
  }

  const handleCvUpload = async (file: File) => {
    if (!storage || !user?.uid) { toast.error('Storage not available'); return }
    setUploadingCv(true)
    try {
      const storageRef = ref(storage, `cvs/${user.uid}/${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      set('cvUrl', url)
      toast.success('CV uploaded!')
    } catch {
      toast.error('Failed to upload CV')
    } finally {
      setUploadingCv(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    if (!storage || !user?.uid) { toast.error('Storage not available'); return }
    setUploadingPhoto(true)
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/photo`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      set('photoURL', url)
      toast.success('Photo uploaded!')
    } catch {
      toast.error('Failed to upload photo')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const handlePortfolioUpload = async (files: FileList) => {
    if (!storage || !user?.uid) { toast.error('Storage not available'); return }
    const remaining = 6 - formData.portfolioPhotos.length
    if (remaining <= 0) { toast.error('Maximum 6 portfolio photos'); return }
    const toUpload = Array.from(files).slice(0, remaining)
    const urls: string[] = []
    for (const file of toUpload) {
      try {
        const storageRef = ref(storage, `profiles/${user.uid}/portfolio/${randomId()}`)
        await uploadBytes(storageRef, file)
        const url = await getDownloadURL(storageRef)
        urls.push(url)
      } catch {
        // skip failed
      }
    }
    if (urls.length > 0) {
      set('portfolioPhotos', [...formData.portfolioPhotos, ...urls])
      toast.success(`${urls.length} photo${urls.length > 1 ? 's' : ''} uploaded!`)
    }
  }

  const handleSave = async () => {
    if (!user?.uid || !db) { toast.error('Not authenticated'); return }
    setSaving(true)
    try {
      const { skillInput: _skip, ...toSave } = formData
      await setDoc(
        doc(db, 'users', user.uid),
        {
          ...toSave,
          displayName: formData.fullName || user.displayName,
          role: 'jobseeker',
          profileComplete: formData.headline !== '' && formData.skills.length > 0,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      )
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const { pct: strengthPct, tips: strengthTips } = calcProfileStrength(formData)

  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 space-y-6">

        {/* Back link */}
        <Link href="/dashboard/jobseeker" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <Button onClick={handleSave} loading={saving} variant="primary">
            Save Profile
          </Button>
        </div>

        {/* Profile strength meter */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-400" />
              Profile Strength — {strengthPct}%
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="w-full bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all ${
                  strengthPct >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-400'
                  : strengthPct >= 50 ? 'bg-gradient-to-r from-indigo-500 to-violet-500'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-500'
                }`}
                style={{ width: `${strengthPct}%` }}
              />
            </div>
            {strengthTips.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {strengthTips.slice(0, 3).map((tip) => (
                  <span key={tip.label} className="inline-flex items-center gap-1 text-xs bg-indigo-500/10 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/20">
                    <Zap className="h-3 w-3" />
                    {tip.label} +{tip.points}%
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Open to work toggle */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">Open to Work</p>
                <p className="text-xs text-gray-400 mt-0.5">Shows a green banner on your profile visible to employers</p>
              </div>
              <button
                onClick={() => set('openToWork', !formData.openToWork)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  formData.openToWork
                    ? 'bg-green-500/15 text-green-400 border border-green-500/30'
                    : 'bg-gray-800 text-gray-400 border border-gray-700'
                }`}
              >
                {formData.openToWork
                  ? <><ToggleRight className="h-5 w-5" /> On</>
                  : <><ToggleLeft className="h-5 w-5" /> Off</>
                }
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Profile photo */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Camera className="h-4 w-4 text-indigo-400" />Profile Photo</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {formData.photoURL
                  ? <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="h-8 w-8 text-gray-500" />
                }
              </div>
              <div className="flex-1">
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]) }}
                />
                <button
                  onClick={() => photoInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploadingPhoto ? <LoadingSpinner size="sm" /> : <Upload className="h-4 w-4" />}
                  {uploadingPhoto ? 'Uploading…' : 'Upload Photo'}
                </button>
                <p className="text-xs text-gray-500 mt-1">JPG or PNG, max 5MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Basic Info */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4 text-indigo-400" />Basic Information</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input
                  value={formData.fullName}
                  onChange={(e) => set('fullName', e.target.value)}
                  placeholder="e.g. James Thompson"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  <MapPin className="h-3 w-3 inline mr-1" />Location
                </label>
                <input
                  value={formData.location}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="e.g. Auckland, NZ"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  <Phone className="h-3 w-3 inline mr-1" />Phone
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  placeholder="e.g. 021 123 4567"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">
                  <Mail className="h-3 w-3 inline mr-1" />Email
                </label>
                <input
                  value={formData.email}
                  onChange={(e) => set('email', e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Headline + About */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-indigo-400" />Professional Details</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Professional Headline</label>
              <input
                value={formData.headline}
                onChange={(e) => set('headline', e.target.value)}
                placeholder="e.g. Experienced Electrician — 10 years in residential + commercial"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">About Me</label>
              <textarea
                value={formData.bio}
                onChange={(e) => set('bio', e.target.value)}
                placeholder="A short bio about your experience, strengths and what you're looking for…"
                rows={4}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4 text-indigo-400" />Skills</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-3">
            <div className="flex gap-2">
              <input
                value={formData.skillInput}
                onChange={(e) => set('skillInput', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
                placeholder="e.g. Plumbing, Electrical, Carpentry…"
                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={addSkill}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {formData.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 rounded-full text-sm">
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors ml-0.5">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Availability + Salary */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm">Availability &amp; Salary</CardTitle></CardHeader>
          <CardContent className="pt-0 space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">Availability (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => toggleAvailability(opt.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      formData.availability.includes(opt.id)
                        ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40'
                        : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Min Salary (NZD/yr)</label>
                <input
                  type="number"
                  value={formData.salaryMin}
                  onChange={(e) => set('salaryMin', e.target.value)}
                  placeholder="e.g. 60000"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Max Salary (NZD/yr)</label>
                <input
                  type="number"
                  value={formData.salaryMax}
                  onChange={(e) => set('salaryMax', e.target.value)}
                  placeholder="e.g. 90000"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-400" />CV / Résumé</CardTitle></CardHeader>
          <CardContent className="pt-0">
            <input
              ref={cvInputRef}
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleCvUpload(e.target.files[0]) }}
            />
            {formData.cvUrl ? (
              <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-green-400 font-medium">CV uploaded</p>
                  <a href={formData.cvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-400 hover:text-white underline truncate block">View CV →</a>
                </div>
                <button
                  onClick={() => cvInputRef.current?.click()}
                  className="text-xs text-gray-400 hover:text-white px-2 py-1 border border-gray-700 rounded transition-colors"
                >
                  Replace
                </button>
              </div>
            ) : (
              <button
                onClick={() => cvInputRef.current?.click()}
                disabled={uploadingCv}
                className="w-full flex flex-col items-center gap-2 p-6 border-2 border-dashed border-gray-700 hover:border-indigo-500/50 rounded-xl text-gray-400 hover:text-gray-200 transition-all disabled:opacity-50"
              >
                {uploadingCv ? <LoadingSpinner size="sm" /> : <Upload className="h-6 w-6" />}
                <span className="text-sm font-medium">{uploadingCv ? 'Uploading…' : 'Upload your CV'}</span>
                <span className="text-xs text-gray-600">PDF, DOC or DOCX — max 10MB</span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Work History */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><Briefcase className="h-4 w-4 text-indigo-400" />Work History</CardTitle>
              <button
                onClick={addWorkEntry}
                className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />Add
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {formData.workHistory.length === 0 ? (
              <button
                onClick={addWorkEntry}
                className="w-full py-6 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-indigo-500/50 hover:text-gray-300 text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />Add work experience
              </button>
            ) : (
              formData.workHistory.map((entry, i) => (
                <div key={entry.id} className="p-4 bg-gray-800 rounded-xl space-y-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Role {i + 1}</span>
                    <button onClick={() => removeWorkEntry(entry.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={entry.company} onChange={(e) => updateWorkEntry(entry.id, 'company', e.target.value)} placeholder="Employer / Company" className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500" />
                    <input value={entry.role} onChange={(e) => updateWorkEntry(entry.id, 'role', e.target.value)} placeholder="Role / Position" className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500" />
                    <input type="month" value={entry.startDate} onChange={(e) => updateWorkEntry(entry.id, 'startDate', e.target.value)} placeholder="Start date" className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                    {!entry.current && (
                      <input type="month" value={entry.endDate} onChange={(e) => updateWorkEntry(entry.id, 'endDate', e.target.value)} placeholder="End date" className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-indigo-500" />
                    )}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={entry.current} onChange={(e) => updateWorkEntry(entry.id, 'current', e.target.checked)} className="rounded" />
                    Currently working here
                  </label>
                  <textarea value={entry.description} onChange={(e) => updateWorkEntry(entry.id, 'description', e.target.value)} placeholder="Brief description of responsibilities and achievements…" rows={2} className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500 resize-none" />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Education / Certifications */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><GraduationCap className="h-4 w-4 text-indigo-400" />Education &amp; Certifications</CardTitle>
              <button onClick={addEducationEntry} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3.5 w-3.5" />Add
              </button>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
            {formData.education.length === 0 ? (
              <button
                onClick={addEducationEntry}
                className="w-full py-6 border-2 border-dashed border-gray-700 rounded-xl text-gray-500 hover:border-indigo-500/50 hover:text-gray-300 text-sm transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />Add education or certification
              </button>
            ) : (
              formData.education.map((entry, i) => (
                <div key={entry.id} className="p-4 bg-gray-800 rounded-xl space-y-3 border border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Entry {i + 1}</span>
                    <button onClick={() => removeEducationEntry(entry.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input value={entry.institution} onChange={(e) => updateEducationEntry(entry.id, 'institution', e.target.value)} placeholder="Institution / Provider" className="sm:col-span-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500" />
                    <input type="number" value={entry.year} onChange={(e) => updateEducationEntry(entry.id, 'year', e.target.value)} placeholder="Year" className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500" />
                    <input value={entry.qualification} onChange={(e) => updateEducationEntry(entry.id, 'qualification', e.target.value)} placeholder="Qualification / Certification name" className="sm:col-span-3 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-indigo-500" />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Portfolio Photos */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Camera className="h-4 w-4 text-indigo-400" />Portfolio Photos <span className="text-gray-600 font-normal">(up to 6)</span></CardTitle></CardHeader>
          <CardContent className="pt-0">
            <input
              ref={portfolioInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => { if (e.target.files) handlePortfolioUpload(e.target.files) }}
            />
            <div className="grid grid-cols-3 gap-2">
              {formData.portfolioPhotos.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 group">
                  <img src={url} alt={`Portfolio ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => set('portfolioPhotos', formData.portfolioPhotos.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {formData.portfolioPhotos.length < 6 && (
                <button
                  onClick={() => portfolioInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-gray-700 rounded-lg hover:border-indigo-500/50 text-gray-500 hover:text-gray-300 transition-all flex flex-col items-center justify-center gap-1 text-xs"
                >
                  <Plus className="h-5 w-5" />
                  Add
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save button at bottom */}
        <div className="pb-8">
          <Button onClick={handleSave} loading={saving} variant="primary" className="w-full">
            Save Profile
          </Button>
        </div>

      </main>
      <Footer />
    </div>
  )
}
