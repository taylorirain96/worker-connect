'use client'
import { useState, useRef } from 'react'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Upload, CheckCircle, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'

export type DocumentType = 'nz_drivers_licence' | 'nz_passport'

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  nz_drivers_licence: 'NZ Driver Licence',
  nz_passport: 'NZ Passport',
}

interface UploadedFile {
  file: File
  previewUrl: string
  storageUrl: string
}

interface IDUploadFormProps {
  uid: string
  onSuccess: () => void
}

export default function IDUploadForm({ uid, onSuccess }: IDUploadFormProps) {
  const [documentType, setDocumentType] = useState<DocumentType>('nz_drivers_licence')
  const [frontFile, setFrontFile] = useState<UploadedFile | null>(null)
  const [backFile, setBackFile] = useState<UploadedFile | null>(null)
  const [uploading, setUploading] = useState<'front' | 'back' | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const frontInputRef = useRef<HTMLInputElement>(null)
  const backInputRef = useRef<HTMLInputElement>(null)

  async function handleFileUpload(
    file: File,
    side: 'front' | 'back'
  ): Promise<UploadedFile | null> {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return null
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be smaller than 10 MB')
      return null
    }

    const previewUrl = URL.createObjectURL(file)
    setUploading(side)

    try {
      const { storage } = await import('@/lib/firebase')
      if (!storage) {
        toast.error('Storage is not configured')
        return null
      }
      const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage')
      const ext = file.name.split('.').pop() ?? 'jpg'
      const timestamp = Date.now()
      const storagePath = `verifications/${uid}/id-${timestamp}-${side}.${ext}`
      const storageRef = ref(storage, storagePath)

      await new Promise<void>((resolve, reject) => {
        const task = uploadBytesResumable(storageRef, file)
        task.on('state_changed', undefined, reject, () => resolve())
      })

      const storageUrl = await getDownloadURL(storageRef)
      toast.success(`${side === 'front' ? 'Front' : 'Back'} of ID uploaded!`)
      return { file, previewUrl, storageUrl }
    } catch (err) {
      console.error('Upload error:', err)
      toast.error('Upload failed — please try again')
      return null
    } finally {
      setUploading(null)
    }
  }

  async function handleFrontChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await handleFileUpload(file, 'front')
    if (result) setFrontFile(result)
    if (frontInputRef.current) frontInputRef.current.value = ''
  }

  async function handleBackChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const result = await handleFileUpload(file, 'back')
    if (result) setBackFile(result)
    if (backInputRef.current) backInputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!frontFile) {
      toast.error('Please upload the front of your ID')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/worker-verifications/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          documentType,
          frontImageUrl: frontFile.storageUrl,
          backImageUrl: backFile?.storageUrl,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Submission failed')

      toast.success('ID submitted for review!')
      onSuccess()
    } catch (err) {
      console.error('Submit error:', err)
      toast.error('Submission failed — please try again')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Privacy notice */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
        🔒 Your ID is securely stored and only viewed by WorkerConnect admins
      </div>

      {/* Document type selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Document Type
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setDocumentType(type)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                documentType === type
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <CreditCard className="h-4 w-4 flex-shrink-0" />
              {DOCUMENT_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Front of ID */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Front of ID <span className="text-red-500">*</span>
        </label>
        {frontFile ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-900">
              <Image
                src={frontFile.previewUrl}
                alt="Front of ID"
                fill
                className="object-contain"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Uploaded
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => frontInputRef.current?.click()}
              disabled={uploading !== null}
            >
              Replace Front
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => frontInputRef.current?.click()}
            disabled={uploading !== null}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-colors aspect-video flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading === 'front' ? (
              <LoadingSpinner size="md" />
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <div className="text-center">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload front of {DOCUMENT_LABELS[documentType]}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 10 MB</p>
                </div>
              </>
            )}
          </button>
        )}
        <input
          ref={frontInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFrontChange}
        />
      </div>

      {/* Back of ID (optional for passport) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Back of ID{' '}
          {documentType === 'nz_passport' && (
            <span className="text-gray-400 font-normal">(optional for passport)</span>
          )}
        </label>
        {backFile ? (
          <div className="space-y-2">
            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 aspect-video bg-gray-100 dark:bg-gray-900">
              <Image
                src={backFile.previewUrl}
                alt="Back of ID"
                fill
                className="object-contain"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Uploaded
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => backInputRef.current?.click()}
              disabled={uploading !== null}
            >
              Replace Back
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => backInputRef.current?.click()}
            disabled={uploading !== null}
            className="w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500 transition-colors py-6 flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-gray-900 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading === 'back' ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Upload className="h-6 w-6 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Upload back of ID{documentType === 'nz_passport' ? ' (optional)' : ''}
                </p>
              </>
            )}
          </button>
        )}
        <input
          ref={backInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleBackChange}
        />
      </div>

      {/* Submit */}
      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!frontFile || submitting || uploading !== null}
      >
        {submitting ? 'Submitting…' : 'Submit for Verification'}
      </Button>
    </div>
  )
}
