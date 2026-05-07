'use client'
import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Video } from 'lucide-react'
import { storage } from '@/lib/firebase'
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

const MAX_SIZE_BYTES = 100 * 1024 * 1024 // 100 MB

export default function VideoProfileUpload() {
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    if (file.size > MAX_SIZE_BYTES) {
      setError('Video must be under 100 MB.')
      return
    }

    setError(null)
    setUploading(true)
    setProgress(0)

    if (!storage) {
      setError('Storage is not configured. Please check environment variables.')
      setUploading(false)
      return
    }

    const storageRef = ref(storage, `worker-videos/${user.uid}/profile.mp4`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        setProgress(pct)
      },
      (err) => {
        console.error('Upload error:', err)
        setError('Upload failed. Please try again.')
        setUploading(false)
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          // Save URL to Firestore via API
          const res = await fetch('/api/worker-video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': user.uid,
            },
            body: JSON.stringify({ videoUrl: downloadUrl }),
          })
          if (!res.ok) throw new Error('Failed to save video URL')
          setUploadedUrl(downloadUrl)
          toast.success('Video profile uploaded successfully!')
        } catch (err) {
          console.error(err)
          setError('Upload succeeded but failed to save. Please try again.')
        } finally {
          setUploading(false)
        }
      }
    )
  }

  return (
    <div className="space-y-4">
      {uploadedUrl ? (
        <div className="flex items-center gap-3 p-4 bg-green-900/20 border border-green-500/30 rounded-xl">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-300">Video uploaded successfully</p>
            <p className="text-xs text-green-500 mt-0.5">Your video profile is now live on your profile page.</p>
          </div>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-slate-600 hover:border-indigo-500/50 rounded-xl p-8 text-center cursor-pointer transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <Video className="h-10 w-10 text-slate-500 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-300 mb-1">Upload your video profile</p>
          <p className="text-xs text-slate-500">MP4, MOV, or WebM · Max 100 MB</p>
          <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors">
            <Upload className="h-4 w-4" />
            Choose Video
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Uploading…</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
