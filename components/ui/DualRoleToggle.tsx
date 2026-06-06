'use client'

import { Briefcase, HardHat } from 'lucide-react'
import { useRole, type Hat } from '@/context/RoleContext'

interface DualRoleToggleProps {
  className?: string
  /** Show a small hint under labels ("Take jobs" / "Post jobs"). Default true on lg+. */
  showHint?: boolean
}

export default function DualRoleToggle({ className = '', showHint = false }: DualRoleToggleProps) {
  const { activeHat, setActiveHat } = useRole()

  const hats: { value: Hat; label: string; hint: string; Icon: typeof Briefcase }[] = [
    { value: 'tradie', label: 'Tradie', hint: 'Take jobs', Icon: HardHat },
    { value: 'client', label: 'Client', hint: 'Post jobs', Icon: Briefcase },
  ]

  return (
    <div
      className={`flex items-center bg-slate-800/80 border border-slate-700 rounded-full p-0.5 gap-0.5 ${className}`}
      role="group"
      aria-label="Switch between Tradie (take jobs) and Client (post jobs)"
    >
      {hats.map(({ value, label, hint, Icon }) => {
        const isActive = activeHat === value
        return (
          <button
            key={value}
            onClick={() => setActiveHat(value)}
            aria-pressed={isActive}
            title={`Switch to ${label} mode — ${hint}`}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${
                isActive
                  ? value === 'tradie'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                    : 'bg-violet-600 text-white shadow-sm shadow-violet-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }
            `}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
            {showHint && (
              <span className="hidden lg:inline text-[10px] font-normal opacity-80">· {hint}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
