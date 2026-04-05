'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'
import { User, MapPin, DollarSign, FileText } from 'lucide-react'

const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  bio: z.string().max(500, 'Bio must be under 500 characters').optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  hourlyRate: z.coerce.number().min(0).optional(),
  skills: z.string().optional(),
  availability: z.enum(['available', 'busy', 'unavailable']).optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      bio: profile?.bio || '',
      location: profile?.location || '',
      phone: profile?.phone || '',
      website: profile?.website || '',
      hourlyRate: profile?.hourlyRate || undefined,
      skills: profile?.skills?.join(', ') || '',
      availability: profile?.availability || 'available',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return
    setSaving(true)
    try {
      const { updateProfile } = await import('firebase/auth')
      const { doc, updateDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase')

      await updateProfile(user, { displayName: data.displayName })

      if (db) {
        const updates: Record<string, unknown> = {
          displayName: data.displayName,
          bio: data.bio || '',
          location: data.location || '',
          phone: data.phone || '',
          website: data.website || '',
          skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
          availability: data.availability || 'available',
          profileComplete: true,
          updatedAt: new Date().toISOString(),
        }

        if (profile?.role === 'worker' && data.hourlyRate !== undefined) {
          updates.hourlyRate = data.hourlyRate
        }

        await updateDoc(doc(db, 'users', user.uid), updates)
      }
      toast.success('Profile updated successfully!')
    } catch {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="h-6 w-6 text-primary-600" />
              Edit Profile
            </h1>
            <p className="text-gray-500 mt-1">Keep your profile up to date to attract more opportunities</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
                    {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
                    <p className="text-xs text-gray-500 capitalize">Role: {profile?.role || 'worker'}</p>
                  </div>
                </div>

                <Input
                  label="Full Name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.displayName?.message}
                  required
                  {...register('displayName')}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Bio
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Tell employers or workers about yourself, your experience, and what you can offer..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    {...register('bio')}
                  />
                  {errors.bio && <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Location"
                    placeholder="e.g., New York, NY"
                    leftIcon={<MapPin className="h-4 w-4" />}
                    {...register('location')}
                  />
                  <Input
                    label="Phone"
                    placeholder="e.g., +1 (555) 000-0000"
                    type="tel"
                    {...register('phone')}
                  />
                </div>

                <Input
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  type="url"
                  error={errors.website?.message}
                  {...register('website')}
                />
              </CardContent>
            </Card>

            {profile?.role === 'worker' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary-600" />
                    Worker Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Hourly Rate ($)"
                    type="number"
                    min="0"
                    placeholder="e.g., 75"
                    leftIcon={<DollarSign className="h-4 w-4" />}
                    helperText="Your rate per hour"
                    error={errors.hourlyRate?.message}
                    {...register('hourlyRate')}
                  />

                  <Input
                    label="Skills (comma-separated)"
                    placeholder="e.g., Plumbing, Pipe Repair, Water Heaters"
                    helperText="List your main skills"
                    {...register('skills')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Availability
                    </label>
                    <select
                      className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      {...register('availability')}
                    >
                      <option value="available">✅ Available - Open to new jobs</option>
                      <option value="busy">🟡 Busy - Limited availability</option>
                      <option value="unavailable">🔴 Unavailable - Not taking jobs</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            )}

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
                loading={saving}
                disabled={!isDirty}
                className="flex-1"
                size="lg"
              >
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
