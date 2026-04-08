'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import PhotoUploadForm from '@/components/jobs/PhotoUploadForm'
import PhotoGallery from '@/components/jobs/PhotoGallery'
import Button from '@/components/ui/Button'
import type { JobPhoto } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Camera, Info } from 'lucide-react'

export default function UploadPhotosPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const jobId = params.id as string
  const [uploadedPhotos, setUploadedPhotos] = useState<JobPhoto[]>([])

  if (!user || profile?.role !== 'worker') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Camera className="h-12 w-12 text-gray-300 mx-auto" />
            <p className="text-gray-500">Please sign in as a worker to upload photos.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Link>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <Camera className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Job Photos</h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Document your work quality with before &amp; after photos. Upload at least 2 photos to earn +25 points.
            </p>
          </div>

          {/* Gamification info banner */}
          <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800 dark:text-amber-300 space-y-0.5">
              <p className="font-semibold">Earn Points &amp; Badges for Photo Documentation</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700 dark:text-amber-400">
                <li>+25 points for uploading 2+ photos per job</li>
                <li>1.5× multiplier if uploaded within 24 hours of completion</li>
                <li>📸 <strong>Photo Master</strong> badge at 50+ total photos</li>
                <li>🔍 <strong>Detail Oriented</strong> badge for 5+ photos per job average</li>
              </ul>
            </div>
          </div>

          {/* Upload form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <PhotoUploadForm
              jobId={jobId}
              workerId={user.uid}
              workerName={user.displayName ?? 'Worker'}
              onComplete={(photos) => {
                setUploadedPhotos(photos)
              }}
            />
          </div>

          {/* Preview of just-uploaded photos */}
          {uploadedPhotos.length > 0 && (
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Uploaded Photos</h2>
              <PhotoGallery photos={uploadedPhotos} />
              <div className="mt-4 flex gap-3">
                <Link href={`/jobs/${jobId}`} className="flex-1">
                  <Button variant="outline" className="w-full">Back to Job</Button>
                </Link>
                <Link href="/dashboard/worker" className="flex-1">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
