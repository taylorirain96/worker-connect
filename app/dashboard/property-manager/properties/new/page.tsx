'use client'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Building2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const PROPERTY_TYPES = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'industrial', label: 'Industrial' },
]

export default function NewPropertyPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()

  const [address, setAddress] = useState('')
  const [suburb, setSuburb] = useState('')
  const [city, setCity] = useState('')
  const [postcode, setPostcode] = useState('')
  const [propertyType, setPropertyType] = useState('residential')
  const [notes, setNotes] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [tenantPhone, setTenantPhone] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return

    if (!address.trim() || !suburb.trim() || !city.trim() || !postcode.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': user.uid },
        body: JSON.stringify({
          address: address.trim(),
          suburb: suburb.trim(),
          city: city.trim(),
          postcode: postcode.trim(),
          propertyType,
          notes: notes.trim() || undefined,
          tenantName: tenantName.trim() || undefined,
          tenantPhone: tenantPhone.trim() || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json() as { error?: string }
        throw new Error(data.error ?? 'Failed to create property')
      }

      toast.success('Property added!')
      router.push('/dashboard/property-manager')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create property')
    } finally {
      setSaving(false)
    }
  }

  if (authLoading || !user) return null

  const inputCls = 'w-full rounded-xl border border-slate-700 bg-slate-800/60 text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-slate-500'
  const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5'

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-xl mx-auto w-full px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Add Property</h1>
              <p className="text-sm text-slate-400 mt-0.5">Add a property to your portfolio</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 space-y-5">
          <div>
            <label className={labelCls}>Street Address <span className="text-red-400">*</span></label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Queen Street"
              className={inputCls}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Suburb <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={suburb}
                onChange={(e) => setSuburb(e.target.value)}
                placeholder="Ponsonby"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>City <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Auckland"
                className={inputCls}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Postcode <span className="text-red-400">*</span></label>
              <input
                type="text"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="1011"
                className={inputCls}
                required
              />
            </div>
            <div>
              <label className={labelCls}>Property Type <span className="text-red-400">*</span></label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className={inputCls}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Tenant Name</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              placeholder="John Smith"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Tenant Phone</label>
            <input
              type="tel"
              value={tenantPhone}
              onChange={(e) => setTenantPhone(e.target.value)}
              placeholder="021 123 4567"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about this property…"
              rows={3}
              className={inputCls}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-600 text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Add Property'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  )
}
