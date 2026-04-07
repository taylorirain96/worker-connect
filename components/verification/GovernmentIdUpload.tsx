'use client'
import { useState, useRef } from 'react'
import { Upload, FileText } from 'lucide-react'

interface Props {
  onSubmit: (file: File) => Promise<void>
}

export default function GovernmentIdUpload({ onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    try {
      await onSubmit(file)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Upload a clear photo or scan of your government-issued ID (passport, driver&apos;s license, or national ID).</p>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PNG, JPG, PDF up to 10MB</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        />
      </div>
      <button
        onClick={handleSubmit}
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Uploading...' : 'Submit ID'}
      </button>
    </div>
  )
}
