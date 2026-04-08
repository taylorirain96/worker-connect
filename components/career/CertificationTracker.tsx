'use client'

import { useState, useEffect } from 'react'
import type { Certification } from '@/types'

interface CertificationTrackerProps {
  workerId: string
}

const levelBadgeColors: Record<string, string> = {
  beginner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  intermediate: 'bg-blue-100 text-blue-800 border-blue-200',
  advanced: 'bg-purple-100 text-purple-800 border-purple-200',
  expert: 'bg-green-100 text-green-800 border-green-200',
}

export default function CertificationTracker({ workerId }: CertificationTrackerProps) {
  const [certs, setCerts] = useState<Certification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/certifications?workerId=${workerId}`)
      .then(r => r.json())
      .then(d => setCerts(d.certifications ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [workerId])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-gray-900 text-lg">My Certifications</h2>
        <span className="bg-blue-100 text-blue-700 text-sm font-medium px-2.5 py-0.5 rounded-full">{certs.length}</span>
      </div>
      {certs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-2xl mb-2">🎓</p>
          <p>No certifications yet</p>
          <p className="text-sm mt-1">Complete learning jobs to earn certifications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {certs.map(cert => (
            <div key={cert.id} className={`border rounded-xl p-4 ${levelBadgeColors[cert.level] ?? 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold">{cert.skill}</p>
                  <p className="text-xs mt-0.5 opacity-75">Issued by {cert.issuedBy}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium capitalize px-2 py-0.5 rounded-full bg-white/50 border border-current/20">
                    {cert.level}
                  </span>
                  {cert.verified && <p className="text-xs mt-0.5 opacity-75">✓ Verified</p>}
                </div>
              </div>
              <p className="text-xs mt-2 opacity-60">{new Date(cert.issuedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
