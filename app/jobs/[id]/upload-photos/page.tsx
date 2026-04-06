'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import PhotoUploadForm from '@/components/jobs/PhotoUploadForm'
import { useAuth } from '@/components/providers/AuthProvider'
import { ArrowLeft, Camera, CheckCircle2, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadPhotosPage() {
  const params = useParams()
  const { user, profile } = useAuth()
  const jobId = params.id as string

  const [done, setDone] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)

  const handleComplete = (count: number, points: number) => {
    setUploadedCount(count)
    setPointsEarned(points)
    setDone(true)
    if (count > 0) {
      toast.success(`${count} photo${count !== 1 ? 's' : ''} uploaded!${points > 0 ? ` +${points} points earned! 🏆` : ''}`)
    }
  }

  if (!user || profile?.role !== 'worker') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center px-4">
            <Camera className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Workers Only
            </h1>
            <p className="text-gray-500 mb-4">You must be signed in as a worker to upload photos.</p>
            <Link
              href="/auth/login"
              className="text-primary-600 dark:text-primary-400 hover:underline text-sm"
            >
              Sign in →
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
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href={`/jobs/${jobId}`}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Job
          </Link>

          {done ? (
            /* ─── Success state ─────────────────────────────────── */
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
              <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Photos Uploaded!
              </h1>
              <p className="text-gray-500 mb-4">
                {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} successfully attached to this job.
              </p>

              {pointsEarned > 0 && (
                <div className="inline-flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg px-4 py-2 mb-6">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">
                    +{pointsEarned} points earned!
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href={`/jobs/${jobId}`}
                  className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white px-5 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                >
                  View Job
                </Link>
                <Link
                  href="/dashboard/worker"
                  className="inline-flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 px-5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  My Dashboard
                </Link>
              </div>
            </div>
          ) : (
            /* ─── Upload form ───────────────────────────────────── */
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Camera className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-white">Upload Job Photos</h1>
                  <p className="text-sm text-gray-500">Job #{jobId} · Document your work quality</p>
                </div>
              </div>

              {/* Incentive banner */}
              <div className="mb-5 p-3 bg-gradient-to-r from-primary-50 to-purple-50 dark:from-primary-900/20 dark:to-purple-900/20 border border-primary-200 dark:border-primary-800 rounded-lg">
                <p className="text-sm font-medium text-primary-700 dark:text-primary-400 mb-1">
                  🏆 Photo Rewards
                </p>
                <ul className="text-xs text-primary-600 dark:text-primary-500 space-y-0.5">
                  <li>• Upload 2+ photos → <strong>+25 points</strong></li>
                  <li>• Upload within 24 hours → <strong>1.5× point bonus</strong></li>
                  <li>• 50+ total photos → <strong>📸 Photo Master badge</strong></li>
                </ul>
              </div>

              <PhotoUploadForm
                jobId={jobId}
                workerId={user.uid}
                workerName={profile?.displayName ?? 'Worker'}
                onComplete={handleComplete}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
