import type { WorkerVerification, VerificationType, VerificationStatus } from '@/types/reputation'

const VERIFICATION_LABELS: Record<VerificationType, string> = {
  government_id: 'Government ID',
  background_check: 'Background Check',
  insurance: 'Insurance',
  certification: 'Certification',
  bbb_rating: 'BBB Rating',
}

/**
 * Only Government ID is required to post or apply for jobs. Everything else
 * is an optional "trust booster" — tradies can mark them "Not applicable"
 * so the row stops nagging them, and the verification score is only
 * computed over the items they actually opted into.
 */
const REQUIRED_TYPES: VerificationType[] = ['government_id']
const OPTIONAL_TYPES: VerificationType[] = ['insurance', 'background_check', 'certification', 'bbb_rating']

function StatusIcon({ status }: { status?: VerificationStatus }) {
  if (status === 'verified') return <span className="text-green-500 font-bold">✓</span>
  if (status === 'pending') return <span className="text-yellow-500">⟳</span>
  if (status === 'failed') return <span className="text-red-500">✗</span>
  if (status === 'skipped') return <span className="text-gray-300">—</span>
  return <span className="text-gray-400">—</span>
}

interface Props {
  verification: WorkerVerification | null
  onStartVerification: (type: VerificationType) => void
  /**
   * Called when a tradie marks an optional credential as "Not applicable".
   * Implementations should persist a `VerificationItem` with status `skipped`.
   * Optional: if omitted, the Skip button is hidden.
   */
  onSkipVerification?: (type: VerificationType) => void
}

function VerificationRow({
  type,
  item,
  onStartVerification,
  onSkipVerification,
  optional,
}: {
  type: VerificationType
  item: { status: VerificationStatus } | undefined
  onStartVerification: (type: VerificationType) => void
  onSkipVerification?: (type: VerificationType) => void
  optional: boolean
}) {
  const showStart = !item || item.status === 'failed' || item.status === 'expired' || item.status === 'skipped'
  return (
    <li className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <StatusIcon status={item?.status} />
        <span className="text-sm text-gray-800">{VERIFICATION_LABELS[type]}</span>
        {optional && (
          <span className="text-[10px] uppercase tracking-wide font-medium text-gray-400 border border-gray-200 rounded-full px-1.5 py-0.5">
            Optional
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {showStart ? (
          <button
            onClick={() => onStartVerification(type)}
            className="text-xs text-blue-600 hover:underline"
          >
            {item?.status === 'skipped' ? 'Add later' : 'Start'}
          </button>
        ) : (
          <span className="text-xs text-gray-400 capitalize">{item?.status}</span>
        )}
        {optional && onSkipVerification && !item && (
          <button
            onClick={() => onSkipVerification(type)}
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline"
            title="Mark as not applicable — you can always add this later"
          >
            Not applicable
          </button>
        )}
      </div>
    </li>
  )
}

export default function VerificationChecklist({ verification, onStartVerification, onSkipVerification }: Props) {
  const itemMap = new Map(verification?.items.map((i) => [i.type, i]) ?? [])

  // Score over opted-in items only: anything explicitly skipped is removed
  // from the denominator. Required items always count.
  const optionalOptedIn = OPTIONAL_TYPES.filter((t) => itemMap.get(t)?.status !== 'skipped')
  const consideredTypes = [...REQUIRED_TYPES, ...optionalOptedIn]
  const verifiedCount = consideredTypes.filter((t) => itemMap.get(t)?.status === 'verified').length
  const score = consideredTypes.length === 0 ? 0 : Math.round((verifiedCount / consideredTypes.length) * 100)

  const idItem = itemMap.get('government_id')
  const minimumMet = idItem?.status === 'verified'

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Verification Status</h2>
      </div>

      {minimumMet ? (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          ✅ <span className="font-medium">Profile complete</span> — you can post and apply for jobs. Add the
          optional badges below whenever you want to stand out more.
        </div>
      ) : (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          You only need to verify your <span className="font-medium">Government ID</span> to start posting and
          applying for jobs. Everything else is optional.
        </div>
      )}

      <div className="space-y-1">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Trust score (badges you&apos;ve opted into)</span>
          <span className="font-medium">{score}/100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${score}%` }} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-2 mb-1">
          Required to post or apply
        </p>
        <ul className="divide-y divide-gray-100">
          {REQUIRED_TYPES.map((type) => (
            <VerificationRow
              key={type}
              type={type}
              item={itemMap.get(type)}
              onStartVerification={onStartVerification}
              optional={false}
            />
          ))}
        </ul>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mt-2 mb-1">
          Trust boosters (optional)
        </p>
        <p className="text-xs text-gray-500 mb-1">
          Upload these to earn extra badges on your profile. You can skip any of them and still take jobs —
          tradies with these badges typically win more high-value work.
        </p>
        <ul className="divide-y divide-gray-100">
          {OPTIONAL_TYPES.map((type) => (
            <VerificationRow
              key={type}
              type={type}
              item={itemMap.get(type)}
              onStartVerification={onStartVerification}
              onSkipVerification={onSkipVerification}
              optional
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
