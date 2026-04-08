'use client'
import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, Paperclip } from 'lucide-react'
import type { EvidenceType } from '@/types'

const MAX_FILE_SIZE_MB = 10
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024

interface Props {
  onUpload: (file: File, type: EvidenceType, description: string) => Promise<void>
  uploading?: boolean
}

const TYPE_OPTIONS: { value: EvidenceType; label: string; icon: React.ElementType }[] = [
  { value: 'photo', label: 'Photo', icon: Image },
  { value: 'document', label: 'Document', icon: FileText },
  { value: 'message_history', label: 'Chat History', icon: Paperclip },
  { value: 'other', label: 'Other', icon: Paperclip },
]

export default function EvidenceUpload({ onUpload, uploading = false }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<EvidenceType>('photo')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (f.size > MAX_FILE_SIZE) {
      setError(`File exceeds ${MAX_FILE_SIZE_MB} MB limit.`)
      return
    }
    setError(null)
    setFile(f)
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) { setError('Please select a file.'); return }
    if (!description.trim()) { setError('Please add a description.'); return }
    setError(null)
    await onUpload(file, type, description.trim())
    setFile(null)
    setDescription('')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type selector */}
      <div className="grid grid-cols-4 gap-2">
        {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setType(value)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs font-medium transition-colors ${
              type === value
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-sm">
            <FileText className="h-4 w-4 text-primary-500" />
            <span className="text-gray-700 dark:text-gray-300 truncate max-w-xs">{file.name}</span>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setFile(null) }}
              className="ml-1 text-gray-400 hover:text-red-500"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Drag &amp; drop or click to select a file
            </p>
            <p className="text-xs text-gray-400 mt-1">Max {MAX_FILE_SIZE_MB} MB</p>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe this evidence…"
        rows={2}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
      />

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Upload className="h-4 w-4" />
        {uploading ? 'Uploading…' : 'Upload Evidence'}
      </button>
    </form>
  )
}
