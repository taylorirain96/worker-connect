import { Users, BadgeCheck, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function TrustSignalBar() {
  return (
    <div className="flex items-center gap-4 sm:gap-6 px-4 sm:px-8 py-3.5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex items-center gap-2 flex-shrink-0">
        <Users className="h-4 w-4 text-indigo-400 flex-shrink-0" />
        <span className="text-white font-bold text-sm whitespace-nowrap">12,847+</span>
        <span className="text-slate-400 text-sm whitespace-nowrap">Happy Clients</span>
      </div>
      <div className="w-px h-4 bg-slate-700 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <BadgeCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
        <span className="text-slate-300 text-sm whitespace-nowrap">Verified Pros</span>
      </div>
      <div className="w-px h-4 bg-slate-700 flex-shrink-0" />
      <div className="flex items-center gap-2 flex-shrink-0">
        <Shield className="h-4 w-4 text-sky-400 flex-shrink-0" />
        <span className="text-slate-300 text-sm whitespace-nowrap">Insured &amp; Bonded</span>
      </div>
      <Link
        href="/jobs/create"
        className="ml-auto inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-bold text-sm px-5 py-2 rounded-lg shadow-indigo-glow hover:shadow-indigo-glow-lg hover:scale-105 transition-all duration-300 animate-pulse-indigo-slow flex-shrink-0 whitespace-nowrap"
      >
        Post a Job
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}
