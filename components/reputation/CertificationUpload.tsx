'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { CertificationItem } from '@/types/reputation'

interface Props {
  certifications: CertificationItem[]
  onAdd?: (cert: { name: string; issuer: string; url?: string }, file?: File) => Promise<void>
  className?: string
}

export default function CertificationUpload({ certifications, onAdd, className }: Props) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [url, setUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleAdd = async () => {
    if (!name || !issuer) return
    setLoading(true)
    try {
      await onAdd?.({ name, issuer, url: url || undefined }, file ?? undefined)
      setName('')
      setIssuer('')
      setUrl('')
      setFile(null)
      setShowForm(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📜</span>
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            Certifications <span className="text-gray-400 font-normal">({certifications.length})</span>
          </h4>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Existing certifications */}
      {certifications.length > 0 && (
        <ul className="space-y-2">
          {certifications.map((cert, i) => (
            <li key={i} className="flex items-start gap-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-3">
              <span className="text-lg mt-0.5">📄</span>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{cert.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{cert.issuer}</p>
                <p className="text-xs text-gray-400">{new Date(cert.verifiedAt).toLocaleDateString()}</p>
              </div>
              {cert.url && (
                <a
                  href={cert.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:underline flex-shrink-0"
                >
                  View ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Add form */}
      {showForm && (
        <div className="border border-gray-200 dark:border-gray-600 rounded-xl p-4 space-y-3">
          <Field label="Certification Name *" value={name} onChange={setName} placeholder="e.g. EPA 608 Technician" />
          <Field label="Issuing Authority *" value={issuer} onChange={setIssuer} placeholder="e.g. EPA" />
          <Field label="Certificate URL (optional)" value={url} onChange={setUrl} placeholder="https://" />

          <label className="block cursor-pointer">
            <div className={cn(
              'border-2 border-dashed rounded-xl p-4 text-center transition-colors text-sm',
              file ? 'border-blue-400 text-gray-700 dark:text-gray-200' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
            )}>
              {file ? file.name : 'Upload certificate (optional)'}
            </div>
            <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>

          <button
            onClick={handleAdd}
            disabled={loading || !name || !issuer}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-medium transition-colors"
          >
            {loading ? 'Adding…' : 'Add Certification'}
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string
}) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
      />
    </div>
  )
}
