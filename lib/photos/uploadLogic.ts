/**
 * Client-side photo validation and lightweight compression.
 * Heavy server-side compression (Sharp/Cloudinary) is handled on upload APIs;
 * this module focuses on pre-flight checks and canvas-based resizing.
 */

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const MAX_FILE_SIZE_MB = 5
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
export const MIN_PHOTOS = 2
export const MAX_PHOTOS = 10
export const MAX_DIMENSION = 2048 // resize to at most 2048px on the longest side

export interface ValidationError {
  field: string
  message: string
}

/** Validate a single file before upload */
export function validatePhotoFile(file: File): ValidationError | null {
  if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
    return { field: 'type', message: `${file.name}: Only JPEG, PNG, and WebP images are accepted.` }
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      field: 'size',
      message: `${file.name}: File exceeds ${MAX_FILE_SIZE_MB} MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB).`,
    }
  }
  return null
}

/** Validate the full upload batch */
export function validatePhotoBatch(files: File[]): ValidationError[] {
  const errors: ValidationError[] = []
  if (files.length < MIN_PHOTOS) {
    errors.push({ field: 'count', message: `Please upload at least ${MIN_PHOTOS} photos.` })
  }
  if (files.length > MAX_PHOTOS) {
    errors.push({ field: 'count', message: `You can upload at most ${MAX_PHOTOS} photos.` })
  }
  for (const file of files) {
    const err = validatePhotoFile(file)
    if (err) errors.push(err)
  }
  return errors
}

/**
 * Compress/resize an image via an off-screen canvas.
 * Returns a new Blob at JPEG quality 0.85, no larger than MAX_DIMENSION px.
 */
export async function compressImage(file: File, maxDimension = MAX_DIMENSION): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img
      if (width > maxDimension || height > maxDimension) {
        if (width >= height) {
          height = Math.round((height * maxDimension) / width)
          width = maxDimension
        } else {
          width = Math.round((width * maxDimension) / height)
          height = maxDimension
        }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas context unavailable'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Canvas toBlob failed'))
        },
        'image/jpeg',
        0.85
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

/** Build a data-URL preview for a File without uploading */
export function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/** Convert a Blob back to a File with the original name */
export function blobToFile(blob: Blob, originalName: string): File {
  // Canvas compression always outputs JPEG
  const ext = 'jpg'
  const name = originalName.replace(/\.[^.]+$/, `.${ext}`)
  return new File([blob], name, { type: blob.type })
}
