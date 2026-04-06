/**
 * Photo upload service for the Rating & Reviews System.
 * Handles client-side image compression and Firebase Storage uploads.
 */
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from '@/lib/firebase'
import { MAX_PHOTO_SIZE_BYTES, MAX_TOTAL_PHOTO_SIZE_BYTES, MAX_PHOTOS, ALLOWED_IMAGE_TYPES } from '@/lib/reviewValidation'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PhotoUploadResult {
  url: string
  storagePath: string
  size: number
  type: string
}

export interface PhotoValidationError {
  file: string
  error: string
}

export interface PhotoValidationResult {
  valid: boolean
  errors: PhotoValidationError[]
}

export type UploadProgressCallback = (fileName: string, progress: number) => void

// ─── Validation ───────────────────────────────────────────────────────────────

export function validatePhotos(files: File[]): PhotoValidationResult {
  const errors: PhotoValidationError[] = []

  if (files.length > MAX_PHOTOS) {
    errors.push({ file: 'all', error: `Maximum ${MAX_PHOTOS} photos allowed` })
    return { valid: false, errors }
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  if (totalSize > MAX_TOTAL_PHOTO_SIZE_BYTES) {
    errors.push({
      file: 'all',
      error: `Total size exceeds ${MAX_TOTAL_PHOTO_SIZE_BYTES / 1024 / 1024}MB limit`,
    })
    return { valid: false, errors }
  }

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      errors.push({
        file: file.name,
        error: `Unsupported file type: ${file.type}. Allowed: jpg, png, webp, gif`,
      })
    } else if (file.size > MAX_PHOTO_SIZE_BYTES) {
      errors.push({
        file: file.name,
        error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum 5MB per photo`,
      })
    }
  }

  return { valid: errors.length === 0, errors }
}

// ─── Image compression ────────────────────────────────────────────────────────

const MAX_DIMENSION = 1920
const JPEG_QUALITY = 0.82

/**
 * Compress an image using Canvas API (browser-only).
 * Falls back to the original file if compression fails or is not needed.
 */
export async function compressImage(file: File, maxDimension = MAX_DIMENSION): Promise<File> {
  if (typeof window === 'undefined') return file
  if (file.type === 'image/gif') return file // Don't compress GIFs

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { width, height } = img
      let newWidth = width
      let newHeight = height

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          newWidth = maxDimension
          newHeight = Math.round((height * maxDimension) / width)
        } else {
          newHeight = maxDimension
          newWidth = Math.round((width * maxDimension) / height)
        }
      }

      const canvas = document.createElement('canvas')
      canvas.width = newWidth
      canvas.height = newHeight

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }

      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          // Only use compressed version if it's actually smaller
          const outputType = file.type === 'image/png' ? 'image/png' : 'image/jpeg'
          const compressedFile = new File([blob], file.name, { type: outputType })
          resolve(compressedFile.size < file.size ? compressedFile : file)
        },
        file.type === 'image/png' ? 'image/png' : 'image/jpeg',
        JPEG_QUALITY
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Upload a single photo to Firebase Storage.
 */
export async function uploadReviewPhoto(
  userId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<PhotoUploadResult> {
  if (!storage) throw new Error('Firebase Storage is not configured')

  // Compress before upload
  const compressed = await compressImage(file)

  const nameParts = file.name.split('.')
  const ext = nameParts.length > 1 ? (nameParts.pop()?.toLowerCase() ?? 'jpg') : 'jpg'
  const storagePath = `review-photos/${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storageRef = ref(storage, storagePath)

  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, compressed)
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve()
    )
  })

  const url = await getDownloadURL(storageRef)
  return { url, storagePath, size: compressed.size, type: compressed.type }
}

/**
 * Upload multiple photos with progress tracking per file.
 */
export async function uploadReviewPhotos(
  userId: string,
  files: File[],
  onProgress?: UploadProgressCallback
): Promise<PhotoUploadResult[]> {
  const validation = validatePhotos(files)
  if (!validation.valid) {
    const firstError = validation.errors[0]
    throw new Error(firstError?.error ?? 'Photo validation failed')
  }

  const results: PhotoUploadResult[] = []
  const uploadedPaths: string[] = []

  for (const file of files) {
    try {
      const result = await uploadReviewPhoto(userId, file, (pct) =>
        onProgress?.(file.name, pct)
      )
      results.push(result)
      uploadedPaths.push(result.storagePath)
    } catch (err) {
      // Clean up already-uploaded photos on failure
      for (const path of uploadedPaths) {
        await deleteReviewPhoto(path).catch((cleanupErr) => {
          console.warn(`Failed to clean up photo at ${path}:`, cleanupErr)
        })
      }
      throw err
    }
  }

  return results
}

/**
 * Delete a photo from Firebase Storage.
 */
export async function deleteReviewPhoto(storagePath: string): Promise<void> {
  if (!storage) return
  try {
    await deleteObject(ref(storage, storagePath))
  } catch {
    // Ignore – may already be deleted
  }
}

/**
 * Create a local object URL preview for a file (client-only).
 */
export function createPhotoPreview(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke a local object URL to free memory.
 */
export function revokePhotoPreview(url: string): void {
  URL.revokeObjectURL(url)
}
