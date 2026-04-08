'use client'

import type { SkillAspiration } from '@/types'

interface SkillAspirationCardProps {
  aspiration: SkillAspiration
  onDelete?: (id: string) => void
  onUpdate?: (id: string, progress: number) => void
}

const levelColors: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600',
  beginner: 'bg-yellow-100 text-yellow-700',
  intermediate: 'bg-blue-100 text-blue-700',
  advanced: 'bg-purple-100 text-purple-700',
  expert: 'bg-green-100 text-green-700',
}

export default function SkillAspirationCard({ aspiration, onDelete, onUpdate }: SkillAspirationCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{aspiration.targetSkill}</h3>
          <p className="text-sm text-gray-500">{aspiration.status}</p>
        </div>
        <div className="flex gap-1">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[aspiration.currentLevel]}`}>
            {aspiration.currentLevel}
          </span>
          <span className="text-xs text-gray-400">→</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColors[aspiration.targetLevel]}`}>
            {aspiration.targetLevel}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{aspiration.progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 rounded-full transition-all duration-300"
            style={{ width: `${aspiration.progress}%` }}
          />
        </div>
      </div>

      {aspiration.motivation && (
        <p className="text-sm text-gray-600 italic">"{aspiration.motivation}"</p>
      )}

      {aspiration.resourcesUsed.length > 0 && (
        <div>
          <p className="text-xs font-medium text-gray-500 mb-1">Resources ({aspiration.resourcesUsed.length})</p>
          <div className="space-y-1">
            {aspiration.resourcesUsed.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={r.status === 'completed' ? 'text-green-500' : 'text-gray-400'}>
                  {r.status === 'completed' ? '✓' : r.status === 'in_progress' ? '▶' : '○'}
                </span>
                <span>{r.title}</span>
                <span className="text-gray-400">· {r.provider}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        {onUpdate && (
          <button
            onClick={() => onUpdate(aspiration.id, Math.min(aspiration.progress + 10, 100))}
            className="flex-1 text-xs bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg px-3 py-1.5 transition-colors"
          >
            +10% Progress
          </button>
        )}
        {onDelete && (
          <button
            onClick={() => onDelete(aspiration.id)}
            className="text-xs bg-red-50 hover:bg-red-100 text-red-600 rounded-lg px-3 py-1.5 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}
