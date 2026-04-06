'use client'
import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/components/providers/AuthProvider'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  Briefcase, DollarSign, Users, TrendingUp,
  Plus, Clock, CheckCircle, Eye, Building2, Shield, Award, Trophy, Star,
  Camera, Filter,
} from 'lucide-react'
import { formatCurrency, formatRelativeDate, STATUS_LABELS } from '@/lib/utils'

const MOCK_POSTED_JOBS = [
  { id: '1', title: 'Fix Leaking Bathroom Pipe', status: 'completed', budget: 150, budgetType: 'fixed' as const, applicants: 4, createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), hasPhotos: true, photoCount: 2 },
  { id: '2', title: 'Paint Living Room', status: 'in_progress', budget: 800, budgetType: 'fixed' as const, applicants: 9, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), hasPhotos: false, photoCount: 0 },
  { id: '3', title: 'Landscaping & Yard Cleanup', status: 'completed', budget: 350, budgetType: 'fixed' as const, applicants: 6, createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(), hasPhotos: false, photoCount: 0 },
]

const MOCK_TOP_PERFORMERS = [
  { id: 'w1', name: 'Marcus Johnson', category: 'Electrical', rank: 1, weeklyPoints: 420, rating: 4.9, jobs: 8, trend: '↑' },
  { id: 'w2', name: 'Sarah Williams', category: 'Plumbing', rank: 2, weeklyPoints: 380, rating: 4.8, jobs: 7, trend: '↑' },
  { id: 'w3', name: 'James Rodriguez', category: 'HVAC', rank: 3, weeklyPoints: 350, rating: 4.7, jobs: 6, trend: '→' },
]

export default function EmployerDashboardPage() {
  const { user } = useAuth()
  const [photoFilter, setPhotoFilter] = useState<'all' | 'with_photos' | 'no_photos'>('all')

  const filteredJobs = MOCK_POSTED_JOBS.filter((job) => {
    if (photoFilter === 'with_photos') return job.hasPhotos
    if (photoFilter === 'no_photos') return job.status === 'completed' && !job.hasPhotos
    return true
  })

  const stats = [
    { label: 'Jobs Posted', value: '6', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Jobs', value: '2', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
    { label: 'Completed', value: '3', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Spent', value: '$3,400', icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-100 dark:bg-primary-900/30' },
  ]

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Welcome back, {user?.displayName?.split(' ')[0] || 'Employer'}! 👋
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage your job postings and find the right workers
              </p>
            </div>
            <Link href="/jobs/create">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Post a Job
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <Card key={label} padding="md">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500">{label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Posted Jobs */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle>Your Job Postings</CardTitle>
                    <div className="flex items-center gap-2">
                      {/* Photo filter */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                        <Filter className="h-3.5 w-3.5 text-gray-400 ml-1" />
                        {([
                          { value: 'all', label: 'All' },
                          { value: 'with_photos', label: '📸 Has Photos' },
                          { value: 'no_photos', label: 'No Photos' },
                        ] as const).map(({ value, label }) => (
                          <button
                            key={value}
                            onClick={() => setPhotoFilter(value)}
                            className={`text-xs px-2 py-0.5 rounded transition-colors ${
                              photoFilter === value
                                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm font-medium'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <Link href="/jobs/create" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                        <Plus className="h-3.5 w-3.5" />
                        New job
                      </Link>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Camera className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 mb-1">No jobs match this filter</p>
                      <button onClick={() => setPhotoFilter('all')} className="text-sm text-primary-600 hover:underline">
                        Clear filter
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredJobs.map((job) => {
                        const status = STATUS_LABELS[job.status]
                        return (
                          <div key={job.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                <span className="text-xs text-gray-500">{formatCurrency(job.budget)}</span>
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Users className="h-3 w-3" />
                                  {job.applicants} applicants
                                </span>
                                <span className="text-xs text-gray-400">{formatRelativeDate(job.createdAt)}</span>
                                {job.hasPhotos && (
                                  <span className="flex items-center gap-0.5 text-xs text-primary-600 dark:text-primary-400">
                                    <Camera className="h-3 w-3" />
                                    {job.photoCount} photos
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={job.status === 'open' ? 'success' : job.status === 'in_progress' ? 'info' : 'default'}
                              >
                                {status?.label}
                              </Badge>
                              <Link href={`/jobs/${job.id}`}>
                                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                  <Eye className="h-4 w-4" />
                                </button>
                              </Link>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Business Profile Card */}
              <Card className="border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/10">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary-600" />
                    <CardTitle>Business Profile</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Set up your professional business profile to help workers and enterprises find and trust your company.
                  </p>
                  <div className="space-y-2">
                    <Link href="/dashboard/business/profile">
                      <Button variant="primary" size="sm" className="w-full justify-start">
                        <Building2 className="h-4 w-4" />
                        Edit Business Profile
                      </Button>
                    </Link>
                    <Link href="/dashboard/business/settings">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Award className="h-4 w-4" />
                        Subscription & Settings
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Top Performers Widget */}
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <CardTitle>Top Performers</CardTitle>
                    </div>
                    <Link href="/leaderboard" className="text-xs text-primary-600 hover:text-primary-700">
                      Full leaderboard →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MOCK_TOP_PERFORMERS.map((worker) => (
                      <div key={worker.id} className="flex items-center gap-3">
                        <span className="text-lg w-6 flex-shrink-0 text-center">
                          {worker.rank === 1 ? '🥇' : worker.rank === 2 ? '🥈' : '🥉'}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{worker.name}</p>
                          <p className="text-xs text-gray-500">{worker.category} · {worker.weeklyPoints} pts</p>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          {worker.rating}
                          <span className="ml-1 text-xs">{worker.trend}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Link href="/leaderboard">
                      <Button variant="outline" size="sm" className="w-full justify-center text-yellow-700 border-yellow-300 hover:bg-yellow-50 dark:text-yellow-400 dark:border-yellow-700 dark:hover:bg-yellow-900/20">
                        <Trophy className="h-4 w-4" />
                        Hire Top Performer
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Progress Widget */}
              <Card className="border-green-200 dark:border-green-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <CardTitle>Verification Status</CardTitle>
                    </div>
                    <span className="text-xs text-gray-500">0 / 5</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Complete verifications to earn trust badges and attract enterprise clients.
                  </p>
                  <div className="space-y-1.5 mb-3">
                    {[
                      { label: 'License Verification', done: false },
                      { label: 'Insurance Verification', done: false },
                      { label: 'Background Check', done: false },
                      { label: 'BBB / Google Ratings', done: false },
                      { label: 'Certifications', done: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center gap-2 text-xs">
                        {item.done ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                        )}
                        <span className={item.done ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500'}>
                          {item.label}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Link href="/dashboard/business/verification">
                    <Button variant="outline" size="sm" className="w-full justify-center text-green-700 border-green-300 hover:bg-green-50 dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20">
                      <Shield className="h-4 w-4" />
                      Start Verification
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <CardTitle>Spending Overview</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">This month</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(800)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last month</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(1200)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">All time</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(3400)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/jobs/create">
                      <Button variant="primary" size="sm" className="w-full justify-start">
                        <Plus className="h-4 w-4" />
                        Post New Job
                      </Button>
                    </Link>
                    <Link href="/workers">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Users className="h-4 w-4" />
                        Browse Workers
                      </Button>
                    </Link>
                    <Link href="/messages">
                      <Button variant="ghost" size="sm" className="w-full justify-start">
                        <CheckCircle className="h-4 w-4" />
                        Messages
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
