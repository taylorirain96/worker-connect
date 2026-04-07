import type { VerificationStatus } from '@/types/reputation'

interface Props {
  status: VerificationStatus
  bbbRating?: string
  googleRating?: number
}

export default function BBBIntegration({ status, bbbRating, googleRating }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Business Ratings</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>{status}</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-blue-50 p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">BBB Rating</p>
          <p className="text-xl font-bold text-blue-700">{bbbRating ?? '—'}</p>
        </div>
        <div className="rounded-lg bg-yellow-50 p-3 text-center">
          <p className="text-xs text-gray-500 mb-1">Google Rating</p>
          <p className="text-xl font-bold text-yellow-600">
            {googleRating != null ? `${googleRating} ★` : '—'}
          </p>
        </div>
      </div>
    </div>
  )
}
