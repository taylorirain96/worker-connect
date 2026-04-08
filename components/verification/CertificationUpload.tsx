'use client'

import type { VerificationItem } from '@/types/reputation'

interface Props {
  certifications: VerificationItem[]
  onUpload: (name: string, file: File) => void
}

export default function CertificationUpload({ certifications, onUpload }: Props) {
  const handleChange = (name: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(name, file)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Certifications</h3>
      {certifications.length === 0 ? (
        <p className="text-sm text-gray-400">No certifications uploaded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {certifications.map(cert => (
            <li key={cert.id} className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-700 capitalize">{cert.type.replace('_', ' ')}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                cert.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>{cert.status}</span>
            </li>
          ))}
        </ul>
      )}
      <label className="flex items-center gap-2 cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 w-fit">
        + Upload Certification
        <input type="file" accept="image/*,.pdf" aria-label="Upload certification" className="hidden" onChange={handleChange('certification')} />
      </label>
    </div>
  )
}
