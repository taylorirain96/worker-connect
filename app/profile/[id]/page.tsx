import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Star, CheckCircle, MapPin, Briefcase, MessageSquare } from 'lucide-react'
import { getInitials } from '@/lib/utils'

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
        </div>
      </main>
      <Footer />
    </div>
  )
}
