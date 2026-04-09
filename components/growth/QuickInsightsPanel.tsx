'use client'
import Link from 'next/link'
import { TrendingUp, Shield, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export default function QuickInsightsPanel({ growthScore, churnRisk, lifecycle }: any) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1: Growth */}
      <Card className="bg-[#0f172a] border-slate-800 breathing-glow shadow-2xl">
        <CardContent className="p-6">
          <TrendingUp className="h-5 w-5 text-[#b822e4] mb-3" />
          <p className="text-sm text-slate-400 font-medium uppercase">Growth Score</p>
          <p className="text-3xl font-bold text-white mt-1">{growthScore?.score || 85}</p>
        </CardContent>
      </Card>

      {/* Card 2: Churn - THE DOOR TO TRUST */}
      <Link href="/growth/trust" className="block">
        <Card className="bg-[#0f172a] border-slate-800 shadow-glow cursor-pointer hover:scale-[1.02] transition-all">
          <CardContent className="p-6">
            <Shield className="h-5 w-5 text-[#e97be4] mb-3" />
            <p className="text-sm text-slate-400 font-medium uppercase">Churn Risk</p>
            <p className="text-3xl font-bold text-white mt-1">{churnRisk?.level || 'Medium'}</p>
          </CardContent>
        </Card>
      </Link>

      {/* Card 3: Lifecycle */}
      <Card className="bg-[#0f172a] border-slate-800 shadow-2xl">
        <CardContent className="p-6">
          <Star className="h-5 w-5 text-[#08d9d6] mb-3" />
          <p className="text-sm text-slate-400 font-medium uppercase">Lifecycle</p>
          <p className="text-3xl font-bold text-white mt-1">{lifecycle?.label || 'Pro'}</p>
        </CardContent>
      </Card>
    </div>
  )
}
