'use client'
import Link from 'next/link'
import { TrendingUp, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function QuickInsightsPanel({ growthScore, churnRisk, lifecycle }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Growth Score Card */}
      <Card className="bg-[#0f172a] border-slate-800 breathing-glow shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="inline-flex p-2 rounded-lg mb-3 bg-[#b822e4]/10">
            <TrendingUp className="h-5 w-5 text-[#b822e4]" />
          </div>
          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Growth Score</p>
          <p className="text-3xl font-bold text-white mt-1">{growthScore?.score || 0}</p>
          <p className="text-xs text-[#08d9d6] mt-1 font-semibold uppercase tracking-wider">
            {growthScore?.trend || 'stable'} trend
          </p>
        </CardContent>
      </Card>

      {/* Churn Risk Card - Linked to Trust & Mediation */}
      <Link href="/growth/trust" className="block">
        <Card className="bg-[#0f172a] border-slate-800 shadow-glow transition-all duration-300 hover:scale-[1.02] cursor-pointer">
          <CardContent className="p-6">
            <div className="inline-flex p-2 rounded-lg mb-3 bg-[#e97be4]/10">
              <Shield className="h-5 w-5 text-[#e97be4]" />
            </div>
            <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Churn Risk</p>
            <p className="text-3xl font-bold text-white mt-1 capitalize">{churnRisk?.level || 'Low'}</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Fairness Mediation Available</p>
          </CardContent>
        </Card>
      </Link>

      {/* Lifecycle Stage Card */}
      <Card className="bg-[#0f172a] border-slate-800 shadow-2xl transition-all duration-300 hover:scale-[1.02]">
        <CardContent className="p-6">
          <div className="inline-flex p-2 rounded-lg mb-3 bg-[#08d9d6]/10">
            <Star className="h-5 w-5 text-[#08d9d6]" />
          </div>
          <p className="text-sm text-slate-400 font-medium tracking-wide uppercase">Lifecycle Stage</p>
          <p className="text-3xl font-bold text-white mt-1">{lifecycle?.label || 'Active'}</p>
          <p className="text-xs text-slate-400 mt-1 font-medium">{lifecycle?.progressToNext || 0}% to next level</p>
        </CardContent>
      </Card>
    </div>
  )
}
