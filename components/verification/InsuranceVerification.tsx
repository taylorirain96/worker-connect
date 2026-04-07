'use client'

import { useState } from 'react'
import { Upload, CheckCircle } from 'lucide-react'

interface Props {
  workerId: string
  onComplete: () => void
}

export function InsuranceVerification({ workerId: _workerId, onComplete }: Props) {
  const [policyNumber, setPolicyNumber] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!policyNumber || !file) return
    setSubmitted(true)
    setTimeout(onComplete, 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-green-600">
        <CheckCircle className="w-12 h-12" />
        <p className="font-medium">Insurance submitted for review</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Provide your insurance policy number and upload your certificate of insurance.
      </p>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
        <input
          type="text"
          value={policyNumber}
          onChange={(e) => setPolicyNumber(e.target.value)}
          placeholder="e.g. INS-2024-XXXXXXX"
          className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Certificate of Insurance
        </label>
        <label className="flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 rounded-xl p-6 cursor-pointer hover:border-indigo-400 transition-colors">
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-sm text-gray-500">{file ? file.name : 'Upload document'}</span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) setFile(f)
            }}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={!policyNumber || !file}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        Submit Insurance
      </button>
    </form>
  )
}
