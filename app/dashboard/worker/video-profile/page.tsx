'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Video } from 'lucide-react'
import Link from 'next/link'
import VideoProfileUpload from '@/components/workers/VideoProfileUpload'
import VideoProfilePlayer from '@/components/workers/VideoProfilePlayer'

export default function VideoProfilePage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login')
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen luxury-bg">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="flex flex-col min-h-screen luxury-bg">
      <Navbar />
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="mb-8">
            <Link href="/dashboard/worker" className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4 transition-colors">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Video className="h-7 w-7 text-violet-400" />
              Video Profile
            </h1>
            <p className="text-slate-400 mt-2">
              Workers with a video profile receive up to 3× more views. Introduce yourself and showcase your work.
            </p>
          </div>

          {/* Current video */}
          {profile?.videoProfileUrl && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Current Video</h2>
              <VideoProfilePlayer
                videoProfileUrl={profile.videoProfileUrl}
                workerName={profile.displayName ?? undefined}
              />
            </div>
          )}

          {/* Upload */}
          <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-6">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
              {profile?.videoProfileUrl ? 'Replace Video' : 'Upload Your Video'}
            </h2>
            <VideoProfileUpload />
          </div>

          {/* Tips */}
          <div className="mt-6 rounded-xl border border-indigo-500/20 bg-indigo-900/10 p-5">
            <p className="text-sm font-semibold text-indigo-300 mb-3">Tips for a great video profile</p>
            <ul className="space-y-1.5 text-sm text-slate-400">
              {[
                'Keep it under 2 minutes — employers have short attention spans',
                'Film in good lighting with a clean, professional background',
                'Mention your trade, years of experience, and specialisations',
                'Show examples of your past work if possible',
                'Speak clearly and smile — personality matters!',
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2">
                  <span className="text-indigo-400 mt-0.5">✓</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
