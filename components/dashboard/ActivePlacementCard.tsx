import { Briefcase } from 'lucide-react'
import type { Placement } from '@/lib/placements/firebase'

const MS_PER_DAY = 86_400_000

interface Props {
  placement: Placement
  placementConfirmed: boolean
  confirmingPlacement: boolean
  onConfirm: (stillEmployed: boolean) => void
}

export default function ActivePlacementCard({ placement, placementConfirmed, confirmingPlacement, onConfirm }: Props) {
  if (placementConfirmed) return null

  return (
    <div className="bg-indigo-900/40 border border-indigo-500 rounded-xl p-5 mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Briefcase className="h-5 w-5 text-indigo-400 flex-shrink-0" />
        <div>
          <h3 className="font-semibold text-white">Still working at {placement.employerName}?</h3>
          <p className="text-sm text-indigo-300">
            Placed by QuickTrade · {Math.floor((Date.now() - new Date(placement.hiredAt).getTime()) / MS_PER_DAY)} days ago
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onConfirm(true)}
          disabled={confirmingPlacement}
          className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          ✅ Yes, still there
        </button>
        <button
          onClick={() => onConfirm(false)}
          disabled={confirmingPlacement}
          className="flex-1 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-60 text-white text-sm font-semibold transition-colors"
        >
          👋 I&apos;ve moved on
        </button>
      </div>
    </div>
  )
}
