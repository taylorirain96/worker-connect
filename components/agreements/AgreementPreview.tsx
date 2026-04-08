'use client'

import type { Agreement } from '@/types'

interface AgreementPreviewProps {
  agreement: Agreement
}

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending_signature: 'bg-yellow-100 text-yellow-800',
  signed: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-purple-100 text-purple-800',
}

export default function AgreementPreview({ agreement }: AgreementPreviewProps) {
  const total = agreement.agreedTerms.rate * agreement.agreedTerms.hours

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Agreement #{agreement.id.slice(-6).toUpperCase()}</h3>
          <p className="text-sm text-gray-500">{new Date(agreement.createdAt).toLocaleDateString()}</p>
        </div>
        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusColors[agreement.status] ?? 'bg-gray-100 text-gray-600'}`}>
          {agreement.status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </div>

      <div className="border-t pt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Worker</p>
          <p className="font-medium text-gray-900">{agreement.workerName ?? agreement.workerId}</p>
        </div>
        <div>
          <p className="text-gray-500">Employer</p>
          <p className="font-medium text-gray-900">{agreement.employerName ?? agreement.employerId}</p>
        </div>
        <div>
          <p className="text-gray-500">Rate</p>
          <p className="font-medium text-gray-900">${agreement.agreedTerms.rate}/hr</p>
        </div>
        <div>
          <p className="text-gray-500">Hours</p>
          <p className="font-medium text-gray-900">{agreement.agreedTerms.hours}h</p>
        </div>
        <div>
          <p className="text-gray-500">Duration</p>
          <p className="font-medium text-gray-900">{agreement.agreedTerms.duration}</p>
        </div>
        <div>
          <p className="text-gray-500">Total</p>
          <p className="font-bold text-gray-900">${total.toFixed(2)}</p>
        </div>
      </div>

      {agreement.agreedTerms.deliverables.length > 0 && (
        <div className="border-t pt-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Deliverables</p>
          <ul className="space-y-1">
            {agreement.agreedTerms.deliverables.map((d, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {d}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="border-t pt-3">
        <p className="text-sm font-medium text-gray-700 mb-2">Payment Schedule</p>
        <p className="text-sm text-gray-600">{agreement.agreedTerms.payment_schedule}</p>
      </div>

      <div className="border-t pt-3 grid grid-cols-2 gap-3">
        <div className="text-center">
          <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${agreement.signatureStatus.workerSigned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {agreement.signatureStatus.workerSigned ? '✓' : '○'} Worker
          </div>
        </div>
        <div className="text-center">
          <div className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded-full ${agreement.signatureStatus.employerSigned ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
            {agreement.signatureStatus.employerSigned ? '✓' : '○'} Employer
          </div>
        </div>
      </div>
    </div>
  )
}
