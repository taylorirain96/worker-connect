'use client'

import { Briefcase, HardHat } from 'lucide-react'
import { useRole, type ActiveRole } from '@/context/RoleContext'

interface DualRoleToggleProps {
  className?: string
}

export default function DualRoleToggle({ className = '' }: DualRoleToggleProps) {
  const { activeRole, setActiveRole } = useRole()

  const roles: { value: ActiveRole; label: string; Icon: typeof Briefcase }[] = [
    { value: 'worker', label: 'Worker', Icon: HardHat },
    { value: 'employer', label: 'Employer', Icon: Briefcase },
  ]

  return (
    <div
      className={`flex items-center bg-slate-800/80 border border-slate-700 rounded-full p-0.5 gap-0.5 ${className}`}
      role="group"
      aria-label="Switch role view"
    >
      {roles.map(({ value, label, Icon }) => {
        const isActive = activeRole === value
        return (
          <button
            key={value}
            onClick={() => setActiveRole(value)}
            aria-pressed={isActive}
            title={`Switch to ${label} view`}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
              transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500
              ${
                isActive
                  ? value === 'worker'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-900/50'
                    : 'bg-violet-600 text-white shadow-sm shadow-violet-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
              }
            `}
          >
            <Icon className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
