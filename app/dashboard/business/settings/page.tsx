'use client'
import type { ElementType } from 'react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import {
  Award,
  Shield,
  CheckCircle,
  Clock,
  Zap,
  Star,
  ChevronLeft,
  ExternalLink,
  Building2,
} from 'lucide-react'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '$0',
    period: '/mo',
    description: 'For solo operators just getting started',
    features: [
      'Business profile page',
      'Up to 3 job postings/mo',
      'Standard applicant visibility',
      'Email support',
    ],
    cta: 'Current Plan',
    current: true,
    highlight: false,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$29.99',
    period: '/mo',
    description: 'For growing contractors with regular hiring needs',
    features: [
      'Everything in Basic',
      'Unlimited job postings',
      'Featured listings (2/mo)',
      'Analytics dashboard',
      'Verified Contractor badge',
      'Priority applicant matching',
      'Chat support',
    ],
    cta: 'Upgrade to Premium',
    current: false,
    highlight: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: '$99',
    period: '/mo',
    description: 'For established firms with multi-project operations',
    features: [
      'Everything in Premium',
      'Unlimited featured listings',
      'Advanced analytics & ROI reports',
      'Bulk job posting tools',
      'Team member access (3 seats)',
      'Contract templates library',
      'Dedicated account manager',
    ],
    cta: 'Upgrade to Professional',
    current: false,
    highlight: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For hospitals, property managers & large enterprises',
    features: [
      'Everything in Professional',
      'Enterprise Partner badge',
      'Unlimited team seats',
      'API access & integrations',
      'Custom SLAs',
      'White-label options',
      'On-site onboarding & training',
    ],
    cta: 'Contact Sales',
    current: false,
    highlight: false,
  },
]

type VerificationStatus = 'pending' | 'not_started' | 'verified'

const VERIFICATION_STEPS: Array<{
  id: string
  label: string
  description: string
  status: VerificationStatus
  icon: ElementType
}> = [
  {
    id: 'license',
    label: 'License Verification',
    description: 'Submit your contractor license number for review',
    status: 'pending',
    icon: Shield,
  },
  {
    id: 'insurance',
    label: 'Insurance Verification',
    description: "Upload proof of general liability & workers' comp",
    status: 'not_started',
    icon: CheckCircle,
  },
  {
    id: 'background',
    label: 'Background Check',
    description: 'Complete a company background screening',
    status: 'not_started',
    icon: Star,
  },
  {
    id: 'bbb',
    label: 'BBB / Google Rating Link',
    description: 'Connect your BBB or Google Business profile',
    status: 'not_started',
    icon: Award,
  },
]

function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  if (status === 'verified') return <Badge variant="success">Verified</Badge>
  if (status === 'pending') return <Badge variant="warning">In Review</Badge>
  return <Badge variant="default">Not Started</Badge>
}

export default function BusinessSettingsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/employer"
              className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary-600" />
              Business Settings
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage your subscription, verification status, and account settings.
            </p>
          </div>

          <div className="space-y-8">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-accent-500" />
                  <CardTitle>Current Plan</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                      <Award className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">Basic Plan</p>
                      <p className="text-sm text-gray-500">Free — upgrade to unlock premium features</p>
                    </div>
                  </div>
                  <Link href="#plans">
                    <Button variant="primary" size="sm">
                      Upgrade Plan
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary-600" />
                  <CardTitle>Verification & Trust Badges</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Complete verification steps to earn trust badges displayed on your public profile.
                </p>
                <div className="space-y-3">
                  {VERIFICATION_STEPS.map(({ id, label, description, status, icon: Icon }) => (
                    <div
                      key={id}
                      className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl"
                    >
                      <div className="h-10 w-10 rounded-xl bg-white dark:bg-gray-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Icon className="h-5 w-5 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{label}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <VerificationStatusBadge status={status} />
                        {status !== 'verified' && (
                          <Button variant="outline" size="sm">
                            {status === 'pending' ? 'Check Status' : 'Start'}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Subscription Plans */}
            <div id="plans">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                Subscription Plans
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative bg-white dark:bg-gray-800 rounded-2xl border p-5 flex flex-col ${
                      plan.highlight
                        ? 'border-primary-500 shadow-lg shadow-primary-500/10'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {plan.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="bg-primary-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                          Most Popular
                        </span>
                      </div>
                    )}
                    <div className="mb-4">
                      <p className="font-bold text-gray-900 dark:text-white">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                        {plan.period && (
                          <span className="text-sm text-gray-500">{plan.period}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{plan.description}</p>
                    </div>

                    <ul className="flex-1 space-y-2 mb-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={plan.current ? 'ghost' : plan.highlight ? 'primary' : 'outline'}
                      size="sm"
                      className="w-full"
                      disabled={plan.current}
                    >
                      {plan.cta}
                      {!plan.current && plan.id !== 'enterprise' && (
                        <ExternalLink className="h-3.5 w-3.5 ml-1" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Profile link */}
            <Card padding="sm">
              <CardContent className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Edit your public profile</p>
                  <p className="text-xs text-gray-500">Update your company info, certifications, and service areas</p>
                </div>
                <Link href="/dashboard/business/profile">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
