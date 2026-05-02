'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import {
  User, MapPin, Phone, Mail, Briefcase, GraduationCap,
  Tag, Star, Upload, Video, DollarSign, Save, Plus, Trash2,
  CheckCircle, CalendarDays, X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

type AvailabilityStatus = 'available' | 'open' | 'not_looking'
type WorkType = 'full-time' | 'part-time' | 'contract' | 'casual'

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

interface ReferenceEntry {
  id: string
  name: string
  contact: string
  relationship: string
}

interface JobseekerProfile {
  displayName: string
  headline: string
  photoURL: string
  bio: string
  location: string
  phone: string
  availabilityStatus: AvailabilityStatus
  skills: string[]
  workHistory: WorkHistoryEntry[]
  education: EducationEntry[]
  references: ReferenceEntry[]
  cvFileName: string
  videoFileName: string
  desiredSalaryMin: string
  desiredSalaryMax: string
  desiredWorkType: WorkType[]
  preferredLocations: string[]
}

const AVAILABILITY_OPTIONS: { value: AvailabilityStatus; label: string; color: string; dot: string }[] = [
  { value: 'available',   label: 'Available Now',   color: 'border-green-500/50 bg-green-500/10 text-green-300',  dot: 'bg-green-400' },
  { value: 'open',        label: 'Open to Offers',  color: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-300', dot: 'bg-yellow-400' },
  { value: 'not_looking', label: 'Not Looking',     color: 'border-slate-600 bg-slate-700/40 text-slate-400',      dot: 'bg-slate-500' },
]

const WORK_TYPE_OPTIONS: { value: WorkType; label: string }[] = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract',  label: 'Contract' },
  { value: 'casual',    label: 'Casual' },
]

const SKILL_SUGGESTIONS = [
  'Electrical', 'Plumbing', 'Carpentry', 'HVAC', 'Roofing', 'Landscaping',
  'Painting', 'Flooring', 'Welding', 'Tiling', 'Concreting', 'Formwork',
  'Project Management', 'Estimating', 'AutoCAD', 'First Aid',
]

function uid4() {
  return Math.random().toString(36).slice(2, 10)
}

export default function JobseekerProfilePage() {
  const { user, profile: authProfile, loading } = useAuth()
  const router = useRouter()
  const cvInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [profileData, setProfileData] = useState<JobseekerProfile>({
    displayName: '',
    headline: '',
    photoURL: '',
    bio: '',
    location: '',
    phone: '',
    availabilityStatus: 'available',
    skills: [],
    workHistory: [],
    education: [],
    references: [],
    cvFileName: '',
    videoFileName: '',
    desiredSalaryMin: '',
    desiredSalaryMax: '',
    desiredWorkType: [],
    preferredLocations: [],
  })

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
    if (!loading && user && authProfile?.role && authProfile.role !== 'jobseeker') router.push('/dashboard')
  }, [loading, user, authProfile, router])

  useEffect(() => {
    if (!user || !db) return
    const load = async () => {
      try {
        const snap = await getDoc(doc(db!, 'users', user.uid))
        if (snap.exists()) {
          const data = snap.data()
          setProfileData((prev) => ({
            ...prev,
            displayName: data.displayName ?? '',
            headline: data.headline ?? '',
            photoURL: data.photoURL ?? '',
            bio: data.bio ?? '',
            location: data.location ?? '',
            phone: data.phone ?? '',
            availabilityStatus: data.availabilityStatus ?? 'available',
            skills: data.skills ?? [],
            workHistory: data.workHistory ?? [],
            education: data.education ?? [],
            references: data.references ?? [],
            cvFileName: data.cvFileName ?? '',
            videoFileName: data.videoFileName ?? '',
            desiredSalaryMin: data.desiredSalaryMin ?? '',
            desiredSalaryMax: data.desiredSalaryMax ?? '',
            desiredWorkType: data.desiredWorkType ?? [],
            preferredLocations: data.preferredLocations ?? [],
          }))
        }
      } catch {
        // ignore — fall back to defaults
      }
    }
    load()
  }, [user])

  const set = <K extends keyof JobseekerProfile>(key: K, value: JobseekerProfile[K]) =>
    setProfileData((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    if (!user || !db) return
    setSaving(true)
    try {
      const skillsFilled = profileData.skills.length > 0
      const bioFilled = profileData.bio.trim().length > 0
      const locationFilled = profileData.location.trim().length > 0
      const cvFilled = profileData.cvFileName.length > 0
      const profileComplete = skillsFilled && bioFilled && locationFilled && cvFilled
      await updateDoc(doc(db, 'users', user.uid), {
        ...profileData,
        profileComplete,
        updatedAt: serverTimestamp(),
      })
      toast.success('Profile saved!')
    } catch {
      toast.error('Failed to save profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Work History helpers
  const addWorkEntry = () =>
    set('workHistory', [
      ...profileData.workHistory,
      { id: uid4(), company: '', role: '', startDate: '', endDate: '', current: false, description: '' },
    ])
  const updateWork = (id: string, key: keyof WorkHistoryEntry, value: string | boolean) =>
    set('workHistory', profileData.workHistory.map((e) => (e.id === id ? { ...e, [key]: value } : e)))
  const removeWork = (id: string) =>
    set('workHistory', profileData.workHistory.filter((e) => e.id !== id))

  // Education helpers
  const addEducation = () =>
    set('education', [...profileData.education, { id: uid4(), institution: '', qualification: '', year: '' }])
  const updateEducation = (id: string, key: keyof EducationEntry, value: string) =>
    set('education', profileData.education.map((e) => (e.id === id ? { ...e, [key]: value } : e)))
  const removeEducation = (id: string) =>
    set('education', profileData.education.filter((e) => e.id !== id))

  // Reference helpers
  const addReference = () =>
    set('references', [...profileData.references, { id: uid4(), name: '', contact: '', relationship: '' }])
  const updateReference = (id: string, key: keyof ReferenceEntry, value: string) =>
    set('references', profileData.references.map((e) => (e.id === id ? { ...e, [key]: value } : e)))
  const removeReference = (id: string) =>
    set('references', profileData.references.filter((e) => e.id !== id))

  // Skills
  const addSkill = (skill: string) => {
    const trimmed = skill.trim()
    if (trimmed && !profileData.skills.includes(trimmed)) {
      set('skills', [...profileData.skills, trimmed])
    }
    setNewSkill('')
  }
  const removeSkill = (skill: string) => set('skills', profileData.skills.filter((s) => s !== skill))

  // Preferred locations
  const addLocation = () => {
    const trimmed = newLocation.trim()
    if (trimmed && !profileData.preferredLocations.includes(trimmed)) {
      set('preferredLocations', [...profileData.preferredLocations, trimmed])
    }
    setNewLocation('')
  }
  const removeLocation = (loc: string) =>
    set('preferredLocations', profileData.preferredLocations.filter((l) => l !== loc))

  // Work type toggle
  const toggleWorkType = (type: WorkType) => {
    const current = profileData.desiredWorkType
    set('desiredWorkType', current.includes(type) ? current.filter((t) => t !== type) : [...current, type])
  }

  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') { toast.error('CV must be a PDF file'); return }
    if (file.size > 10 * 1024 * 1024) { toast.error('CV must be under 10 MB'); return }
    // In production this would upload to Firebase Storage
    set('cvFileName', file.name)
    toast.success(`CV "${file.name}" ready to save`)
  }

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('video/')) { toast.error('Please upload a video file'); return }
    if (file.size > 100 * 1024 * 1024) { toast.error('Video must be under 100 MB'); return }
    // In production this would upload to Firebase Storage
    set('videoFileName', file.name)
    toast.success(`Video intro "${file.name}" ready to save`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const currentAvailability = AVAILABILITY_OPTIONS.find((o) => o.value === profileData.availabilityStatus)

  return (
    <div className="flex flex-col min-h-screen bg-[#0a0f1e]">
      <Navbar />
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-slate-400 text-sm mt-1">Build your CV-style profile to attract employers</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>

        {/* Basic Info */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4 text-indigo-400" />Basic Info</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Your full name"
                  value={profileData.displayName}
                  onChange={(e) => set('displayName', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Headline</label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Experienced Electrician — Available Now"
                  value={profileData.headline}
                  onChange={(e) => set('headline', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Location</label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="City, Region"
                  value={profileData.location}
                  onChange={(e) => set('location', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1"><Phone className="h-3.5 w-3.5" />Phone</label>
                <input
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="+64 21 000 0000"
                  value={profileData.phone}
                  onChange={(e) => set('phone', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Bio / Summary</label>
              <textarea
                className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[90px] resize-y"
                placeholder="A short summary about yourself, your experience and what you're looking for…"
                value={profileData.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Availability */}
        <Card id="availability" className="border-slate-700/60 bg-slate-800/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><CalendarDays className="h-4 w-4 text-green-400" />Availability Status</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {AVAILABILITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set('availabilityStatus', opt.value)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    profileData.availabilityStatus === opt.value ? opt.color : 'border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${opt.dot}`} />
                    <span className="text-sm font-medium">{opt.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Tag className="h-4 w-4 text-violet-400" />Skills</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <span key={skill} className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-full text-sm text-indigo-300">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-white transition-colors"><X className="h-3 w-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                placeholder="Add a skill…"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(newSkill) } }}
              />
              <Button size="sm" onClick={() => addSkill(newSkill)} disabled={!newSkill.trim()}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SKILL_SUGGESTIONS.filter((s) => !profileData.skills.includes(s)).slice(0, 8).map((s) => (
                <button
                  key={s}
                  onClick={() => addSkill(s)}
                  className="px-2.5 py-1 text-xs rounded-full border border-slate-600 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300 transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Work History */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="h-4 w-4 text-blue-400" />Work History</CardTitle>
              <Button variant="outline" size="sm" onClick={addWorkEntry}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {profileData.workHistory.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-3">No work history added yet.</p>
            )}
            {profileData.workHistory.map((entry) => (
              <div key={entry.id} className="border border-slate-700/60 rounded-xl p-4 space-y-3 relative">
                <button
                  onClick={() => removeWork(entry.id)}
                  className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Company</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Company name" value={entry.company} onChange={(e) => updateWork(entry.id, 'company', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Role</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Job title" value={entry.role} onChange={(e) => updateWork(entry.id, 'role', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Start Date</label>
                    <input type="month" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" value={entry.startDate} onChange={(e) => updateWork(entry.id, 'startDate', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">End Date</label>
                    <input type="month" className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50" value={entry.endDate} disabled={entry.current} onChange={(e) => updateWork(entry.id, 'endDate', e.target.value)} />
                    <label className="flex items-center gap-2 mt-1 cursor-pointer">
                      <input type="checkbox" className="accent-indigo-500" checked={entry.current} onChange={(e) => updateWork(entry.id, 'current', e.target.checked)} />
                      <span className="text-xs text-slate-400">Currently working here</span>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Description</label>
                  <textarea className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[70px] resize-y" placeholder="What you did and achieved in this role…" value={entry.description} onChange={(e) => updateWork(entry.id, 'description', e.target.value)} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Education */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><GraduationCap className="h-4 w-4 text-emerald-400" />Education & Qualifications</CardTitle>
              <Button variant="outline" size="sm" onClick={addEducation}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {profileData.education.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-3">No education added yet.</p>
            )}
            {profileData.education.map((entry) => (
              <div key={entry.id} className="border border-slate-700/60 rounded-xl p-4 relative">
                <button onClick={() => removeEducation(entry.id)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Institution</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="School / Provider" value={entry.institution} onChange={(e) => updateEducation(entry.id, 'institution', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Qualification</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Degree / Certificate" value={entry.qualification} onChange={(e) => updateEducation(entry.id, 'qualification', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Year</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="2020" value={entry.year} onChange={(e) => updateEducation(entry.id, 'year', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* References */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2"><Star className="h-4 w-4 text-yellow-400" />References</CardTitle>
              <Button variant="outline" size="sm" onClick={addReference}><Plus className="h-4 w-4 mr-1" />Add</Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            {profileData.references.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-3">No references added yet.</p>
            )}
            {profileData.references.map((ref) => (
              <div key={ref.id} className="border border-slate-700/60 rounded-xl p-4 relative">
                <button onClick={() => removeReference(ref.id)} className="absolute top-3 right-3 text-slate-500 hover:text-red-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Name</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Reference name" value={ref.name} onChange={(e) => updateReference(ref.id, 'name', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Contact</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="Email or phone" value={ref.contact} onChange={(e) => updateReference(ref.id, 'contact', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Relationship</label>
                    <input className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500" placeholder="e.g. Former Manager" value={ref.relationship} onChange={(e) => updateReference(ref.id, 'relationship', e.target.value)} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Desired Role */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-4 w-4 text-amber-400" />Desired Role & Salary</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Work Type (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleWorkType(opt.value)}
                    className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                      profileData.desiredWorkType.includes(opt.value)
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300'
                        : 'border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Min Salary (NZD/yr)</label>
                <input
                  type="number"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="50000"
                  value={profileData.desiredSalaryMin}
                  onChange={(e) => set('desiredSalaryMin', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Max Salary (NZD/yr)</label>
                <input
                  type="number"
                  className="w-full bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="80000"
                  value={profileData.desiredSalaryMax}
                  onChange={(e) => set('desiredSalaryMax', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />Preferred Locations</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {profileData.preferredLocations.map((loc) => (
                  <span key={loc} className="flex items-center gap-1.5 px-3 py-1 bg-slate-700/60 border border-slate-600 rounded-full text-sm text-slate-300">
                    {loc}
                    <button onClick={() => removeLocation(loc)} className="hover:text-white transition-colors"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  className="flex-1 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Auckland, Remote"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addLocation() } }}
                />
                <Button size="sm" onClick={addLocation} disabled={!newLocation.trim()}>Add</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CV Upload */}
        <Card className="border-slate-700/60 bg-slate-800/40">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="h-4 w-4 text-blue-400" />CV / Résumé Upload</CardTitle></CardHeader>
          <CardContent className="p-4 pt-0">
            <input ref={cvInputRef} type="file" accept=".pdf" className="hidden" onChange={handleCVUpload} />
            {profileData.cvFileName ? (
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{profileData.cvFileName}</div>
                  <div className="text-xs text-slate-400">PDF uploaded</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => cvInputRef.current?.click()}>Replace</Button>
              </div>
            ) : (
              <button
                onClick={() => cvInputRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-600 hover:border-indigo-500/50 rounded-xl p-8 text-center transition-colors group"
              >
                <Upload className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 mx-auto mb-2 transition-colors" />
                <div className="text-sm font-medium text-slate-300">Upload your CV (PDF)</div>
                <div className="text-xs text-slate-500 mt-1">Max 10 MB · PDF format</div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Video Intro */}
        <Card className="border-violet-500/30 bg-violet-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Video className="h-4 w-4 text-violet-400" />
              Video Introduction
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-normal">Competitive Edge</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <p className="text-xs text-slate-400 mb-3">
              Stand out with a 60-second video intro — no competitor platform offers this. Employers can see your personality before they even contact you.
            </p>
            <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            {profileData.videoFileName ? (
              <div className="flex items-center gap-3 p-3 bg-violet-500/10 border border-violet-500/30 rounded-xl">
                <CheckCircle className="h-5 w-5 text-violet-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{profileData.videoFileName}</div>
                  <div className="text-xs text-slate-400">Video intro uploaded</div>
                </div>
                <Button variant="outline" size="sm" onClick={() => videoInputRef.current?.click()}>Replace</Button>
              </div>
            ) : (
              <button
                onClick={() => videoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-violet-600/40 hover:border-violet-500/60 rounded-xl p-8 text-center transition-colors group"
              >
                <Video className="h-8 w-8 text-slate-500 group-hover:text-violet-400 mx-auto mb-2 transition-colors" />
                <div className="text-sm font-medium text-slate-300">Upload a 60-second intro video</div>
                <div className="text-xs text-slate-500 mt-1">Max 100 MB · MP4, MOV, WebM</div>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Save button (bottom) */}
        <div className="flex justify-end pb-4">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>

      </main>
      <Footer />
    </div>
  )
}
