import { Users, BadgeCheck, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TrustSignalBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 px-4 sm:px-8 py-3.5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-sm">
      {/* Social proof — left (F-pattern primary) */}
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-gold-400 flex-shrink-0" />
        <span className="text-white font-bold text-sm">12,847+</span>
        <span className="text-slate-400 text-sm hidden sm:inline">Happy Clients</span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-slate-700" />

      {/* Trust badges */}
      <div className="flex items-center gap-2">
        <BadgeCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        <span className="text-slate-300 text-sm">Verified Pros</span>
      </div>

      <div className="hidden sm:block w-px h-4 bg-slate-700" />

      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-400 flex-shrink-0" />
        <span className="text-slate-300 text-sm">Insured &amp; Bonded</span>
      </div>

      {/* CTA — right (action zone) */}
      <Link
        href="/jobs/create"
        className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold text-sm px-5 py-2 rounded-lg shadow-gold-glow hover:shadow-gold-glow-lg hover:scale-105 transition-all duration-300 animate-pulse-gold-slow flex-shrink-0"
      >
        Post a Job
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
