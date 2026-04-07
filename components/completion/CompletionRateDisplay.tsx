import { getCompletionLabel } from '@/lib/utils/completionRateCalc'

interface Props {
  rate: number
  showLabel?: boolean
}

export default function CompletionRateDisplay({ rate, showLabel = true }: Props) {
  const { label, color } = getCompletionLabel(rate)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="34" fill="none" stroke="#E5E7EB" strokeWidth="8" />
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke={rate >= 95 ? '#D97706' : rate >= 85 ? '#16A34A' : rate >= 70 ? '#2563EB' : rate >= 50 ? '#EA580C' : '#DC2626'}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(rate / 100) * 213.6} 213.6`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold text-gray-900">{rate}%</span>
        </div>
      </div>
      {showLabel && <span className={`text-sm font-semibold ${color}`}>{label}</span>}
    </div>
  )
}
