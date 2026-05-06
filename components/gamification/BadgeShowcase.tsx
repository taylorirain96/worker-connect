interface BadgeDef {
  label: string
  emoji: string
  description: string
  color: string
}

const BADGE_DEFS: Record<string, BadgeDef> = {
  top_rated:        { label: 'Top Rated',      emoji: '⭐', description: 'Maintained 4.8+ rating for 3+ reviews',          color: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700/50 text-yellow-700 dark:text-yellow-400' },
  verified:         { label: 'Verified ID',    emoji: '✅', description: 'Identity verified by QuickTrade',                 color: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700/50 text-green-700 dark:text-green-400' },
  fast_responder:   { label: 'Fast Responder', emoji: '⚡', description: 'Responds to quotes within 2 hours',               color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700/50 text-blue-700 dark:text-blue-400' },
  jobs_10:          { label: '10 Jobs Done',   emoji: '🔨', description: 'Completed 10+ jobs on QuickTrade',                color: 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-700/50 text-indigo-700 dark:text-indigo-400' },
  jobs_50:          { label: '50 Jobs Done',   emoji: '🏆', description: 'Completed 50+ jobs on QuickTrade',                color: 'bg-violet-50 dark:bg-violet-900/30 border-violet-200 dark:border-violet-700/50 text-violet-700 dark:text-violet-400' },
  repeat_hire:      { label: 'Repeat Hire',    emoji: '🤝', description: 'Rehired by the same homeowner',                   color: 'bg-pink-50 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700/50 text-pink-700 dark:text-pink-400' },
  background_clear: { label: 'Police Checked', emoji: '🛡️', description: 'Clear NZ Police vetting certificate',             color: 'bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700/50 text-sky-700 dark:text-sky-400' },
  licensed:         { label: 'Licensed Pro',   emoji: '📋', description: 'Trade licence verified by QuickTrade',            color: 'bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700/50 text-orange-700 dark:text-orange-400' },
  worksafe:         { label: 'WorkSafe',        emoji: '🦺', description: 'Completed WorkSafe NZ compliance checklist',     color: 'bg-lime-50 dark:bg-lime-900/30 border-lime-200 dark:border-lime-700/50 text-lime-700 dark:text-lime-400' },
  site_safe:        { label: 'Site Safe',       emoji: '⛑️', description: 'Holds Site Safe certificate',                    color: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700/50 text-amber-700 dark:text-amber-400' },
}

interface BadgeShowcaseProps {
  /** Array of badge IDs earned by the worker */
  badges: string[]
  /** Compact mode: smaller pills, max 6, no descriptions */
  compact?: boolean
}

export default function BadgeShowcase({ badges, compact = false }: BadgeShowcaseProps) {
  const earned = badges
    .filter((b) => b in BADGE_DEFS)
    .slice(0, compact ? 6 : undefined)

  if (earned.length === 0) {
    return (
      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No badges earned yet.</p>
    )
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {earned.map((id) => {
          const def = BADGE_DEFS[id]
          return (
            <span
              key={id}
              title={def.description}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${def.color}`}
            >
              <span>{def.emoji}</span>
              {def.label}
            </span>
          )
        })}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {earned.map((id) => {
        const def = BADGE_DEFS[id]
        return (
          <div
            key={id}
            className={`flex flex-col items-center text-center p-4 rounded-xl border ${def.color}`}
          >
            <span className="text-3xl mb-2" role="img" aria-label={def.label}>{def.emoji}</span>
            <span className="text-sm font-semibold leading-tight">{def.label}</span>
            <span className="text-xs opacity-75 mt-1 leading-snug">{def.description}</span>
          </div>
        )
      })}
    </div>
  )
}
