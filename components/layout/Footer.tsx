import Link from 'next/link'
import { Wrench, Twitter, Linkedin, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Wrench className="h-6 w-6 text-primary-600" />
              <span className="text-lg font-bold text-primary-600">
                Quick<span className="text-accent-500">Trade</span>
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-6">
              QuickTrade connects skilled trades workers with employers. Find plumbers, electricians,
              carpenters, HVAC technicians, and more.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-600 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/jobs" className="hover:text-primary-600 transition-colors">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/workers" className="hover:text-primary-600 transition-colors">
                  Find Workers
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-primary-600 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-primary-600 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-primary-600 transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
              <li>
                <Link href="/help" className="hover:text-primary-600 transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary-600 transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-primary-600 transition-colors">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/partners" className="hover:text-primary-600 transition-colors">
                  Partners
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-primary-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} QuickTrade. All rights reserved.
          </p>
          <p className="text-sm text-gray-400">
            Built with ❤️ for skilled trades workers
          </p>
        </div>
      </div>
    </footer>
  )
}
