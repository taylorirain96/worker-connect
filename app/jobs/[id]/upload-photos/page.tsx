'use client'
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import PhotoUploadForm from '@/components/jobs/PhotoUploadForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Camera } from 'lucide-react'
import toast from 'react-hot-toast'

export default function UploadPhotosPage() {
  const params = useParams()
  const router = useRouter()
  const { user, profile } = useAuth()
  const [done, setDone] = useState(false)
  const [uploadedCount, setUploadedCount] = useState(0)

  const jobId = params.id as string

  if (!user || profile?.role !== 'worker') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 mb-4">You must be signed in as a worker to upload photos.</p>
            <Link href="/auth/login">
              <Button>Sign In</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const handleUploadComplete = async (count: number) => {
    setUploadedCount(count)
    setDone(true)

    // Award gamification points
    try {
      const { awardPhotoUploadPoints, checkAndAwardPhotoMasterBadge, checkAndAwardDetailOrientedBadge } =
        await import('@/lib/photos/gamificationLogic')
      const { getWorkerPhotoStats } = await import('@/lib/photos/firebase')

      const jobCompletedAt = new Date().toISOString() // TODO: fetch actual completion timestamp from Firestore job document
      await awardPhotoUploadPoints(user.uid, jobCompletedAt, count)

      const stats = await getWorkerPhotoStats(user.uid)
      await checkAndAwardPhotoMasterBadge(user.uid, stats.totalPhotos)
      await checkAndAwardDetailOrientedBadge(user.uid, stats.totalPhotos, stats.jobsWithPhotos)
    } catch {
      // gamification errors are non-critical
    }

    toast.success(`${count} photo${count !== 1 ? 's' : ''} uploaded successfully! +25 pts 🎉`)
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

          {done ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Photos Uploaded!
                </h2>
                <p className="text-gray-500 mb-2">
                  {uploadedCount} photo{uploadedCount !== 1 ? 's' : ''} submitted for this job.
                </p>
                <p className="text-sm text-primary-600 font-medium mb-6">
                  🏆 +25 points awarded to your profile!
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href={`/jobs/${jobId}`}>
                    <Button variant="outline">View Job</Button>
                  </Link>
                  <Button onClick={() => router.push('/dashboard/worker')}>
                    Go to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-primary-600" />
                  <CardTitle>Upload Job Photos</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                  Document your completed work with before &amp; after photos. Upload at least 2 photos to earn bonus points and help build your reputation.
                </p>
                <PhotoUploadForm
                  jobId={jobId}
                  workerId={user.uid}
                  workerName={user.displayName ?? 'Worker'}
                  onUploadComplete={handleUploadComplete}
                  onCancel={() => router.push(`/jobs/${jobId}`)}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
