interface Props {
  hasRelocationBadge: boolean
  targetCity: string
}

export default function RelocationBadge({ hasRelocationBadge, targetCity }: Props) {
  if (!hasRelocationBadge) return null

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
      <span className="text-green-600 text-sm">🚚</span>
      <span className="text-sm font-medium text-green-700">Relocation Ready</span>
      {targetCity && <span className="text-xs text-green-500">→ {targetCity}</span>}
    </div>
  )
}
