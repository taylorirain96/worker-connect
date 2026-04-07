'use client'

import { Briefcase, Grid, Star } from 'lucide-react'
import type { PortfolioProject } from '@/types/reputation'

interface Props {
  projects: PortfolioProject[]
}

export function PortfolioStats({ projects }: Props) {
  const total = projects.length
  const categories = new Set(projects.map((p) => p.category)).size
  const featured = projects.filter((p) => p.featured).length

  const stats = [
    { label: 'Projects', value: total, icon: <Briefcase className="w-5 h-5 text-indigo-500" /> },
    { label: 'Categories', value: categories, icon: <Grid className="w-5 h-5 text-purple-500" /> },
    { label: 'Featured', value: featured, icon: <Star className="w-5 h-5 text-amber-500" /> },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map(({ label, value, icon }) => (
        <div
          key={label}
          className="bg-white rounded-2xl shadow-sm p-4 flex flex-col items-center gap-1"
        >
          {icon}
          <span className="text-2xl font-bold text-gray-900">{value}</span>
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      ))}
    </div>
  )
}
