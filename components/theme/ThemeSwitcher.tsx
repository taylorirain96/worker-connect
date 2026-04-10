'use client'

import { Wrench, Home, Columns2 } from 'lucide-react'
import type { RoleTheme } from '@/lib/themes'

interface ThemeSwitcherProps {
  activeTheme: RoleTheme | 'split'
  onThemeChange: (theme: RoleTheme | 'split') => void
}

export default function ThemeSwitcher({ activeTheme, onThemeChange }: ThemeSwitcherProps) {
  const buttons: { key: RoleTheme | 'split'; label: string; Icon: React.ElementType }[] = [
    { key: 'worker', label: 'Preview Worker View', Icon: Wrench },
    { key: 'employer', label: 'Preview Employer View', Icon: Home },
    { key: 'split', label: 'Compare Side-by-Side', Icon: Columns2 },
  ]

  return (
    <div className="flex flex-wrap gap-3 justify-center mb-8">
      {buttons.map(({ key, label, Icon }) => (
        <button
          key={key}
          onClick={() => onThemeChange(key)}
          className={[
            'flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200',
            activeTheme === key
              ? 'bg-[#c5a05a] text-[#0f172a] shadow-[0_0_20px_rgba(197,160,90,0.4)] scale-105'
              : 'bg-[#1e293b] text-[#cbd5e1] border border-[#334155] hover:border-[#c5a05a] hover:text-[#c5a05a]',
          ].join(' ')}
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
          {label}
        </button>
      ))}
    </div>
  )
}
