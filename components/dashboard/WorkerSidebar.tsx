import Link from 'next/link'
import {
  Star, TrendingUp, BarChart2, FileText, CalendarCheck, Calendar,
  RefreshCw, Zap, ShieldCheck, Award, Send, Package, Plane, Video,
  Shield, HardHat, Sparkles, CheckCircle, AlertCircle,
} from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { UserProfile } from '@/types'

interface Props {
  profile: UserProfile | null
  photoURL: string | null
  uid: string
  pendingApplicationsCount: number
}

export default function WorkerSidebar({ profile, photoURL, uid, pendingApplicationsCount }: Props) {
  return (
    <div className="space-y-4">
      {/* Video Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Video className="h-4 w-4 text-violet-500" />
            <CardTitle>Video Profile</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {profile?.videoProfileUrl ? (
            <div className="space-y-3">
              <video
                src={profile.videoProfileUrl}
                controls
                className="w-full rounded-lg max-h-40 object-cover"
                aria-label="Your video profile"
              />
              <Link href="/dashboard/worker/video-profile">
                <button className="w-full text-xs text-center text-indigo-500 hover:text-indigo-400 py-1">
                  Update video →
                </button>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <Video className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">Add a video to stand out</p>
              <Link href="/dashboard/worker/video-profile">
                <button className="w-full py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors">
                  Upload Video
                </button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Profile Completion */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Strength</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { label: 'Profile Photo', done: !!photoURL },
              { label: 'Bio Added', done: !!profile?.bio },
              { label: 'Skills Listed', done: (profile?.skills?.length || 0) > 0 },
              { label: 'Hourly Rate Set', done: !!profile?.hourlyRate },
              { label: 'Location Added', done: !!profile?.location },
            ].map(({ label, done }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                {done ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-300 flex-shrink-0" />
                )}
                <span className={done ? 'text-gray-900 dark:text-white' : 'text-gray-400'}>{label}</span>
              </div>
            ))}
          </div>
          <Link href="/settings/profile">
            <Button variant="outline" size="sm" className="w-full mt-4">Complete Profile</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Rating */}
      {(profile?.rating ?? 0) > 0 && (
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
          <span>Your rating: <strong className="text-gray-900 dark:text-white">{profile?.rating?.toFixed(1)}</strong> ({profile?.reviewCount ?? 0} reviews)</span>
        </div>
      )}

      {/* Quick links */}
      <Link href="/earnings">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <TrendingUp className="h-4 w-4 text-primary-600" />
            View Earnings &amp; Withdraw
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/reviews">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
            My Reviews
            {(profile?.reviewCount ?? 0) > 0 && (
              <span className="ml-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {profile?.reviewCount}
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/analytics">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <BarChart2 className="h-4 w-4 text-indigo-500" />
            Analytics &amp; Stats
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/applications">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <FileText className="h-4 w-4 text-primary-600" />
            My Applications
            {pendingApplicationsCount > 0 && (
              <span className="ml-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                {pendingApplicationsCount} pending
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/bookings">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <CalendarCheck className="h-4 w-4 text-indigo-500" />
            Booking Requests
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/calendar">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-indigo-500" />
            My Schedule
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/recurring">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <RefreshCw className="h-4 w-4 text-indigo-500" />
            My Recurring Work
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/instant-bookings">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Zap className="h-4 w-4 text-amber-500" />
            Instant Bookings
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/availability">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Calendar className="h-4 w-4 text-teal-500" />
            My Availability
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/verify">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            {profile?.verified ? (
              <span className="flex items-center gap-1">
                Identity Verified
                <span className="text-green-600 font-semibold text-xs">✓</span>
              </span>
            ) : profile?.verificationStatus === 'pending' ? (
              <span className="flex items-center gap-1">
                Verification Pending
                <span className="ml-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  Review in progress
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                Verify Your Identity
                <span className="ml-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                  Get Verified
                </span>
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/trade-licences">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Award className="h-4 w-4 text-indigo-500" />
            Trade Licences
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/portfolio">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Send className="h-4 w-4 text-primary-600" />
            My Portfolio
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/service-packages">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Package className="h-4 w-4 text-green-600" />
            Service Packages
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      {uid && (
        <Link href={`/workers/${uid}/mover`}>
          <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Plane className="h-4 w-4 text-sky-500" />
              Mover Mode (Relocation / FIFO)
            </div>
            <span className="text-xs text-primary-600">→</span>
          </div>
        </Link>
      )}

      <Link href="/dashboard/worker/video-profile">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Video className="h-4 w-4 text-violet-500" />
            Video Profile
            {!profile?.videoProfileUrl && (
              <span className="ml-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                New
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/background-check">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Shield className="h-4 w-4 text-green-600" />
            Background Check
            {profile?.backgroundCheckStatus === 'approved' && (
              <span className="ml-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                ✓ Passed
              </span>
            )}
            {profile?.backgroundCheckStatus === 'pending' && (
              <span className="ml-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/worksafe">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <HardHat className="h-4 w-4 text-orange-500" />
            WorkSafe Compliance
            {profile?.worksafeCompliance?.completedAt && (
              <span className="ml-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium px-1.5 py-0.5 rounded-full">
                ✓ Compliant
              </span>
            )}
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/quote-templates">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <FileText className="h-4 w-4 text-sky-500" />
            Quote Templates
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>

      <Link href="/dashboard/worker/subscription">
        <div className="flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <Sparkles className="h-4 w-4 text-indigo-500" />
            My Plan
          </div>
          <span className="text-xs text-primary-600">→</span>
        </div>
      </Link>
    </div>
  )
}
