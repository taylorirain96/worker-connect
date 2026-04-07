'use client'

import { useState, useRef } from 'react'
import { Upload, CheckCircle } from 'lucide-react'

interface Props {
  workerId: string
  onComplete: () => void
}

export function GovernmentIdUpload({ workerId: _workerId, onComplete }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    // In production, upload file to storage then call verification API
    setSubmitted(true)
    setTimeout(onComplete, 1200)
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-green-600">
        <CheckCircle className="w-12 h-12" />
        <p className="font-medium">ID submitted for review</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-600">
        Upload a clear photo of a government-issued ID (passport, driver&apos;s license, or national ID).
      </p>
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center gap-2 cursor-pointer hover:border-indigo-400 transition-colors"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-8 h-8 text-gray-400" />
        <p className="text-sm text-gray-500">
          {file ? file.name : 'Click to upload or drag & drop'}
        </p>
        <p className="text-xs text-gray-400">JPG, PNG, PDF up to 10MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      <button
        type="submit"
        disabled={!file}
        className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-40 transition-colors"
      >
        Submit ID
      </button>
    </form>
  )
}
