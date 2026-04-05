import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'
import {
  Shield,
  Star,
  MapPin,
  Users,
  Briefcase,
  CheckCircle,
  Globe,
  Award,
  TrendingUp,
  Clock,
  MessageSquare,
  Building2,
  ExternalLink,
  Linkedin,
  Facebook,
  BarChart2,
} from 'lucide-react'
import type { BusinessProfile, BusinessReview } from '@/types'
import { TrustBadgeList, TrustScoreBar } from '@/components/business/TrustBadge'

// Mock data — replace with Firestore fetch once DB is connected
const MOCK_BUSINESSES: Record<string, BusinessProfile> = {
  'apex-general-contracting': {
    id: 'b1',
    userId: 'u1',
    companyName: 'Apex General Contracting',
    slug: 'apex-general-contracting',
    industry: 'General Contractor',
    companySize: '11-50',
    yearsInBusiness: 12,
    serviceAreas: ['New York, NY', 'Newark, NJ', 'Jersey City, NJ', 'Hoboken, NJ'],
    website: 'https://apexgc.example.com',
    linkedIn: 'https://linkedin.com/company/apexgc',
    description:
      'Apex General Contracting has been delivering high-quality construction and renovation projects across the tri-state area for over 12 years. We specialize in commercial renovations, multi-family residential builds, and facility management for enterprise clients.',
    missionStatement:
      'Building lasting relationships through quality craftsmanship, on-time delivery, and transparent communication.',
    licenseNumber: 'GC-445821-NY',
    licenseVerified: true,
    hasGeneralLiability: true,
    hasWorkersComp: true,
    backgroundCheckStatus: 'clear',
    bbbRating: 'A+',
    googleRating: 4.8,
    certifications: ['OSHA 30', 'EPA Lead-Safe', 'LEED Green Associate'],
    subscriptionTier: 'enterprise',
    isVerifiedContractor: true,
    isEnterprisePartner: true,
    totalJobsPosted: 134,
    workersHiredYTD: 47,
    avgJobValue: 8500,
    successRate: 97,
    avgTimeToFill: 2.3,
    repeatHireRate: 68,
    overallRating: 4.8,
    reviewCount: 89,
    ratingBreakdown: {
      communication: 4.9,
      quality: 4.8,
      timeliness: 4.7,
      fairPay: 4.8,
    },
    responseRate: 94,
    profileCompletionPct: 95,
    createdAt: new Date(Date.now() - 365 * 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
}

const MOCK_REVIEWS: BusinessReview[] = [
  {
    id: 'r1',
    businessId: 'b1',
    workerId: 'w1',
    workerName: 'Mike Johnson',
    jobTitle: 'Commercial Bathroom Renovation',
    rating: 5,
    communication: 5,
    quality: 5,
    timeliness: 5,
    fairPay: 5,
    comment:
      'Apex is one of the best contractors I have worked for. Clear scope, fair pay, and they always have materials ready on-site. Will definitely work with them again.',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r2',
    businessId: 'b1',
    workerId: 'w2',
    workerName: 'Sarah Chen',
    jobTitle: 'Office Building Electrical Upgrade',
    rating: 5,
    communication: 5,
    quality: 5,
    timeliness: 4,
    fairPay: 5,
    comment:
      'Professional team, paid on time, and communicated every step of the way. Highly recommend to any electrician looking for steady commercial work.',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'r3',
    businessId: 'b1',
    workerId: 'w3',
    workerName: 'Carlos Rivera',
    jobTitle: 'HVAC Installation – 40-Unit Apartment Complex',
    rating: 4,
    communication: 4,
    quality: 5,
    timeliness: 4,
    fairPay: 4,
    comment:
      'Great project to work on. Organized crew and project manager was responsive. A few timeline shifts, but overall a solid employer.',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Compute trust verification count and score from BusinessProfile fields
function computeProfileVerification(biz: BusinessProfile): { verifiedCount: number; trustScore: number } {
  let verifiedCount = 0
  if (biz.licenseVerified) verifiedCount++
  if (biz.hasGeneralLiability || biz.hasWorkersComp) verifiedCount++
  if (biz.backgroundCheckStatus === 'clear') verifiedCount++
  if (biz.bbbRating || biz.googleRating) verifiedCount++
  if (biz.certifications && biz.certifications.length > 0) verifiedCount++
  return { verifiedCount, trustScore: verifiedCount * 20 }
}

function StarRating({ value, size = 'sm' }: { value: number; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${cls} ${star <= Math.round(value) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
        />
      ))}
    </div>
  )
}

function RatingBar({ label, value }: { label: string; value: number }) {
  const pct = (value / 5) * 100
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 dark:text-gray-400 w-32 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

function SubscriptionBadge({ tier, isEnterprise }: { tier: string; isEnterprise: boolean }) {
  if (isEnterprise) {
    return (
      <span className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-full text-xs font-semibold">
        <Award className="h-3.5 w-3.5" />
        Enterprise Partner
      </span>
    )
  }
  const colors: Record<string, string> = {
    premium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    professional: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${colors[tier] ?? 'bg-gray-100 text-gray-600'}`}
    >
      <Award className="h-3.5 w-3.5" />
      {tier.charAt(0).toUpperCase() + tier.slice(1)} Plan
    </span>
  )
}

const companySizeLabels: Record<string, string> = {
  solo: 'Solo Operator',
  '2-10': '2–10 Employees',
  '11-50': '11–50 Employees',
  '50+': '50+ Employees',
}

export default function BusinessProfilePage({ params }: { params: { slug: string } }) {
  const biz = MOCK_BUSINESSES[params.slug]
  const { verifiedCount, trustScore } = biz ? computeProfileVerification(biz) : { verifiedCount: 0, trustScore: 0 }

  if (!biz) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center px-4">
            <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Business Not Found</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              No business profile found for <strong>@{params.slug}</strong>.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
            >
              Back to QuickTrade
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
        {/* Cover / Hero */}
        <div className="relative bg-gradient-to-r from-primary-900 to-primary-700 h-40 md:h-52">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile header */}
          <div className="relative -mt-12 md:-mt-16 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Logo placeholder */}
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="h-12 w-12 md:h-16 md:w-16 text-primary-600" />
              </div>

              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    {biz.companyName}
                  </h1>
                  {biz.licenseVerified && (
                    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-semibold">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  <SubscriptionBadge tier={biz.subscriptionTier} isEnterprise={biz.isEnterprisePartner} />
                </div>

                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{biz.industry}</p>

                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <TrustBadgeList verifiedCount={verifiedCount} />
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {companySizeLabels[biz.companySize]}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {biz.yearsInBusiness} years in business
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {biz.overallRating} ({biz.reviewCount} reviews)
                  </span>
                  {biz.responseRate && (
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      {biz.responseRate}% response rate
                    </span>
                  )}
                </div>
              </div>

              {/* Social links & CTA */}
              <div className="flex items-center gap-2 pb-2">
                {biz.website && (
                  <a
                    href={biz.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {biz.linkedIn && (
                  <a
                    href={biz.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {biz.facebook && (
                  <a
                    href={biz.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-gray-500 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                )}
                <Link
                  href="/jobs"
                  className="ml-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  View Open Jobs
                </Link>
              </div>
            </div>
          </div>

          {/* Service Areas */}
          <div className="flex flex-wrap gap-2 mb-8">
            {biz.serviceAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs"
              >
                <MapPin className="h-3 w-3 text-primary-500" />
                {area}
              </span>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 pb-16">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <Card>
                <CardHeader>
                  <CardTitle>About {biz.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{biz.description}</p>
                  {biz.missionStatement && (
                    <blockquote className="mt-4 pl-4 border-l-4 border-primary-500 text-sm italic text-gray-500 dark:text-gray-400">
                      &ldquo;{biz.missionStatement}&rdquo;
                    </blockquote>
                  )}
                </CardContent>
              </Card>

              {/* Ratings & Reviews */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Ratings & Reviews</CardTitle>
                    <span className="text-sm text-gray-500">{biz.reviewCount} total reviews</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Overall */}
                  <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">{biz.overallRating}</div>
                      <StarRating value={biz.overallRating} size="md" />
                      <p className="text-xs text-gray-500 mt-1">Overall Rating</p>
                    </div>
                    {biz.ratingBreakdown && (
                      <div className="flex-1 space-y-2">
                        <RatingBar label="Communication" value={biz.ratingBreakdown.communication} />
                        <RatingBar label="Quality" value={biz.ratingBreakdown.quality} />
                        <RatingBar label="Timeliness" value={biz.ratingBreakdown.timeliness} />
                        <RatingBar label="Fair Pay" value={biz.ratingBreakdown.fairPay} />
                      </div>
                    )}
                  </div>

                  {/* Review list */}
                  <div className="space-y-4">
                    {MOCK_REVIEWS.map((review) => (
                      <div
                        key={review.id}
                        className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{review.workerName}</p>
                            <p className="text-xs text-gray-500">{review.jobTitle}</p>
                          </div>
                          <StarRating value={review.rating} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Hiring Stats */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary-600" />
                    <CardTitle>Hiring Stats</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Briefcase className="h-4 w-4" /> Total Jobs Posted
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{biz.totalJobsPosted}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 flex items-center gap-1.5">
                        <Users className="h-4 w-4" /> Workers Hired (YTD)
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">{biz.workersHiredYTD}</span>
                    </div>
                    {biz.avgTimeToFill != null && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <Clock className="h-4 w-4" /> Avg Time to Fill
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{biz.avgTimeToFill} days</span>
                      </div>
                    )}
                    {biz.successRate != null && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <CheckCircle className="h-4 w-4" /> Success Rate
                        </span>
                        <span className="font-semibold text-green-600">{biz.successRate}%</span>
                      </div>
                    )}
                    {biz.repeatHireRate != null && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500 flex items-center gap-1.5">
                          <BarChart2 className="h-4 w-4" /> Repeat Hire Rate
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">{biz.repeatHireRate}%</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Verification & Credentials */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary-600" />
                    <CardTitle>Verification & Credentials</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Trust score */}
                  <div className="mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Trust Score</span>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">{trustScore} / 100</span>
                    </div>
                    <TrustScoreBar score={trustScore} />
                    <div className="mt-2">
                      <TrustBadgeList verifiedCount={verifiedCount} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    {biz.licenseNumber && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">License #{biz.licenseNumber}</span>
                        <Badge variant={biz.licenseVerified ? 'success' : 'warning'}>
                          {biz.licenseVerified ? 'Verified' : 'Pending'}
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">General Liability</span>
                      <Badge variant={biz.hasGeneralLiability ? 'success' : 'danger'}>
                        {biz.hasGeneralLiability ? 'Active' : 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Workers&apos; Comp</span>
                      <Badge variant={biz.hasWorkersComp ? 'success' : 'danger'}>
                        {biz.hasWorkersComp ? 'Active' : 'None'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Background Check</span>
                      <Badge variant={biz.backgroundCheckStatus === 'clear' ? 'success' : 'warning'}>
                        {biz.backgroundCheckStatus === 'clear'
                          ? 'Clear'
                          : biz.backgroundCheckStatus === 'pending'
                          ? 'Pending'
                          : 'Not Done'}
                      </Badge>
                    </div>
                    {biz.bbbRating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">BBB Rating</span>
                        <span className="font-semibold text-green-600">{biz.bbbRating}</span>
                      </div>
                    )}
                    {biz.googleRating && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Google Rating</span>
                        <span className="flex items-center gap-1 font-semibold text-gray-900 dark:text-white">
                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          {biz.googleRating}
                        </span>
                      </div>
                    )}
                  </div>

                  {biz.certifications && biz.certifications.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Certifications</p>
                      <div className="flex flex-wrap gap-1.5">
                        {biz.certifications.map((cert) => (
                          <span
                            key={cert}
                            className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 text-xs px-2 py-0.5 rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Share profile */}
              <Card padding="sm">
                <CardContent>
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Share This Profile</p>
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-600 dark:text-gray-400 flex-1 truncate">
                      quicktrade.com/business/{biz.slug}
                    </span>
                    <Link
                      href={`/business/${biz.slug}`}
                      className="p-1 text-primary-600 hover:text-primary-700"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
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
