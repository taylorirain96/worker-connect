import type { WorkerVerification, VerificationType, VerificationStatus } from '@/types/reputation'

const VERIFICATION_LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID',
  background_check: 'Background Check',
  insurance: 'Insurance',
  certification: 'Certification',
  bbb_rating: 'BBB Rating',
}

function StatusIcon({ status }: { status?: VerificationStatus }) {
  if (status === 'verified') return <span className="text-green-500 font-bold">✓</span>
  if (status === 'pending') return <span className="text-yellow-500">⟳</span>
  if (status === 'failed') return <span className="text-red-500">✗</span>
  return <span className="text-gray-400">—</span>
}

interface Props {
  verification: WorkerVerification | null
  onStartVerification: (type: VerificationType) => void
}

const ALL_TYPES: VerificationType[] = ['government_id', 'background_check', 'insurance', 'certification', 'bbb_rating']

export default function VerificationChecklist({ verification, onStartVerification }: Props) {
  const itemMap = new Map(verification?.items.map(i => [i.type, i]) ?? [])
  const score = verification?.verificationScore ?? 0

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
      <div className="space-y-1 mb-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Verification Score</span>
          <span className="font-medium">{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <ul className="divide-y divide-gray-100">
        {ALL_TYPES.map(type => {
          const item = itemMap.get(type)
          return (
            <li key={type} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <StatusIcon status={item?.status} />
                <span className="text-sm text-gray-800">{VERIFICATION_LABELS[type]}</span>
              </div>
              {!item || item.status === 'failed' || item.status === 'expired' ? (
                <button
                  onClick={() => onStartVerification(type)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Start
                </button>
              ) : (
                <span className="text-xs text-gray-400 capitalize">{item.status}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
