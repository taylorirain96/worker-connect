'use client'
import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload, FileText } from 'lucide-react'

const schema = z.object({
  name: z.string().min(2, 'Certification name required'),
  issuer: z.string().min(2, 'Issuing organization required'),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSubmit: (data: { name: string; issuer: string; file: File }) => Promise<void>
}

export default function CertificationUpload({ onSubmit }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) })

  const submit = async (data: FormData) => {
    if (!file) return
    setLoading(true)
    try {
      await onSubmit({ ...data, file })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name</label>
        <input
          {...register('name')}
          placeholder="e.g. OSHA 30-Hour"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
        <input
          {...register('issuer')}
          placeholder="e.g. OSHA"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.issuer && <p className="text-xs text-red-500 mt-1">{errors.issuer.message}</p>}
      </div>
      <div
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <FileText className="h-5 w-5" />
            <span className="text-sm font-medium">{file.name}</span>
          </div>
        ) : (
          <>
            <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" />
            <p className="text-sm text-gray-500">Upload certificate document</p>
          </>
        )}
        <input ref={inputRef} type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </div>
      <button
        type="submit"
        disabled={!file || loading}
        className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Uploading...' : 'Submit Certification'}
      </button>
    </form>
  )
}
