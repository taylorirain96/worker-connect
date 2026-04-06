import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare, Camera } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import PhotoGallery from '@/components/jobs/PhotoGallery'
import type { JobPhoto } from '@/types'

// Mock photo data for profile display
const MOCK_PROFILE_PHOTOS: JobPhoto[] = [
  {
    id: 'prof-p1',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    caption: 'Bathroom pipe repair — before',
    type: 'before',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 1_234_567,
  },
  {
    id: 'prof-p2',
    jobId: 'j1',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
    caption: 'Bathroom pipe repair — after',
    type: 'after',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 987_654,
  },
  {
    id: 'prof-p3',
    jobId: 'j2',
    workerId: 'w1',
    workerName: 'User Profile',
    url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
    caption: 'Electrical panel — completed',
    type: 'after',
    approvalStatus: 'approved',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    fileSize: 2_100_000,
  },
]

export default function UserProfilePage() {

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link href="/workers" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-start gap-5">
              <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold">
                {getInitials('User Profile')}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Profile</h1>
                  <CheckCircle className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  Location not set
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">-</span>
                    <span className="text-gray-500">(0 reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Briefcase className="h-4 w-4" />
                    0 completed
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-500 italic">This user has not added a bio yet.</p>
            </div>

            <div className="mt-6 flex gap-3">
              <Link href="/messages">
                <Button>
                  <MessageSquare className="h-4 w-4" />
                  Send Message
                </Button>
              </Link>
            </div>
          </div>

          {/* Photo Stats */}
          <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Camera className="h-5 w-5 text-primary-600" />
              <h2 className="font-semibold text-gray-900 dark:text-white">Photo Documentation</h2>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[
                { label: 'Total Photos', value: MOCK_PROFILE_PHOTOS.length },
                { label: 'Jobs Documented', value: new Set(MOCK_PROFILE_PHOTOS.map((p) => p.jobId)).size },
                { label: 'Approval Rate', value: `${Math.round((MOCK_PROFILE_PHOTOS.filter((p) => p.approvalStatus === 'approved').length / MOCK_PROFILE_PHOTOS.length) * 100)}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
            <PhotoGallery photos={MOCK_PROFILE_PHOTOS} showComparisonTab />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
