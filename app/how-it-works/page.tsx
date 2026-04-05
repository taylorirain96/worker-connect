import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { CheckCircle, Shield, Star, ArrowRight, Wrench } from 'lucide-react'

const STEPS_EMPLOYER = [
  {
    step: 1,
    title: 'Create an Account',
    description: 'Sign up as an employer in under 2 minutes. No credit card required to get started.',
  },
  {
    step: 2,
    title: 'Post Your Job',
    description: 'Describe the work needed, set your budget, location, and timeline. Be specific to attract the right workers.',
  },
  {
    step: 3,
    title: 'Review Applications',
    description: 'Workers will apply to your job. Review their profiles, ratings, and proposed rates.',
  },
  {
    step: 4,
    title: 'Hire with Confidence',
    description: 'Accept your preferred worker. Funds are held in escrow until the work is completed to your satisfaction.',
  },
  {
    step: 5,
    title: 'Rate & Review',
    description: 'Once the job is done, release payment and leave a review to help the community.',
  },
]

const STEPS_WORKER = [
  {
    step: 1,
    title: 'Build Your Profile',
    description: 'Create a compelling profile with your skills, certifications, experience, and portfolio.',
  },
  {
    step: 2,
    title: 'Get Verified',
    description: 'Complete our verification process to earn the trusted badge and stand out from the competition.',
  },
  {
    step: 3,
    title: 'Browse Jobs',
    description: 'Search and filter available jobs by category, location, budget, and urgency.',
  },
  {
    step: 4,
    title: 'Submit Proposals',
    description: 'Apply to jobs with a personalized cover letter and your proposed rate.',
  },
  {
    step: 5,
    title: 'Get Paid Securely',
    description: 'Complete the work and receive payment through our secure escrow system.',
  },
]

export default function HowItWorksPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary-900 to-primary-700 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-4">
              <Wrench className="h-4 w-4 text-accent-500" />
              Simple. Secure. Trusted.
            </div>
            <h1 className="text-4xl font-bold mb-4">How WorkerConnect Works</h1>
            <p className="text-primary-100 text-lg max-w-2xl mx-auto">
              Whether you need work done or looking for work, our platform makes it easy and safe for
              everyone.
            </p>
          </div>
        </section>

        {/* How It Works - Employers */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-4 py-1.5 rounded-full text-sm font-medium">
                For Employers
              </span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 mb-2">
                Find the Right Worker
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Post a job and hire skilled tradespeople in just a few steps
              </p>
            </div>

            <div className="space-y-6">
              {STEPS_EMPLOYER.map(({ step, title, description }) => (
                <div key={step} className="flex gap-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/auth/register?role=employer" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors">
                Post a Job Today <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Works - Workers */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <span className="bg-accent-500/10 text-accent-600 px-4 py-1.5 rounded-full text-sm font-medium">
                For Workers
              </span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 mb-2">
                Start Earning Today
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Join thousands of skilled tradespeople already earning on WorkerConnect
              </p>
            </div>

            <div className="space-y-6">
              {STEPS_WORKER.map(({ step, title, description }) => (
                <div key={step} className="flex gap-5 bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-accent-500 text-white flex items-center justify-center font-bold text-lg">
                    {step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link href="/auth/register?role=worker" className="inline-flex items-center gap-2 bg-accent-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-accent-600 transition-colors">
                Join as a Worker <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Trust & Safety</h2>
              <p className="text-gray-500 dark:text-gray-400">
                Your safety is our top priority
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: <Shield className="h-8 w-8 text-primary-600" />, title: 'Background Checks', description: 'All workers go through comprehensive background verification.' },
                { icon: <CheckCircle className="h-8 w-8 text-green-600" />, title: 'License Verification', description: 'We verify professional licenses and certifications.' },
                { icon: <Star className="h-8 w-8 text-yellow-500" />, title: 'Review System', description: 'Transparent ratings and reviews from verified customers.' },
              ].map(({ icon, title, description }) => (
                <div key={title} className="text-center p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="inline-flex items-center justify-center h-16 w-16 bg-gray-50 dark:bg-gray-700 rounded-2xl mb-4">
                    {icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
