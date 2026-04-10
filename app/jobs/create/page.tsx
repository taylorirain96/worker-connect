'use client'
import { useRouter } from 'next/navigation'
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
import { Briefcase } from 'lucide-react'

const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000),
  category: z.string().min(1, 'Please select a category'),
  location: z.string().min(3, 'Please enter a location'),
  budget: z.coerce.number().min(1, 'Budget must be greater than 0'),
  budgetType: z.enum(['fixed', 'hourly']),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  skills: z.string().optional(),
  deadline: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

export default function CreateJobPage() {
  const { user, profile } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: { budgetType: 'fixed', urgency: 'medium' },
  })

  const budgetType = watch('budgetType')

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
      const jobId = await saveJob({
        title: data.title,
        description: data.description,
        category: data.category as import('@/types').JobCategory,
        location: data.location,
        budget: data.budget,
        budgetType: data.budgetType,
        urgency: data.urgency,
        skills: data.skills ? data.skills.split(',').map((s) => s.trim()).filter(Boolean) : [],
        employerId: user.uid,
        employerName: user.displayName || user.email || 'Employer',
        status: 'open',
        ...(data.deadline ? { deadline: data.deadline } : {}),
      })
      toast.success('Job posted successfully!')
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
                <textarea
                  rows={5}
                  placeholder="Describe the job in detail - what needs to be done, any special requirements, tools needed, etc."
                  className={`w-full rounded-lg border ${errors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors`}
                  {...register('description')}
                />
                {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>}
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
                      <option key={cat.id} value={cat.id}>{cat.icon} {cat.label}</option>
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

                <Input
                  label={budgetType === 'hourly' ? 'Hourly Rate ($)' : 'Budget ($)'}
                  type="number"
                  min="1"
                  placeholder="0"
                  error={errors.budget?.message}
                  required
                  {...register('budget')}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Urgency <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    {...register('urgency')}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="emergency">🚨 Emergency</option>
                  </select>
                </div>

                <Input
                  label="Deadline (Optional)"
                  type="date"
                  {...register('deadline')}
                />
              </div>
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
                loading={isSubmitting}
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
