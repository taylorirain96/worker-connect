/**
 * photoService.ts – client-side photo compression and upload utilities.
 * Uses the Canvas API to resize/compress images before uploading.
 */

export interface CompressOptions {
  /** Maximum width or height in pixels (maintains aspect ratio) */
  maxDimension?: number
  /** JPEG quality 0-1 */
  quality?: number
  /** Output MIME type */
  outputType?: 'image/jpeg' | 'image/webp'
}

const DEFAULT_OPTIONS: Required<CompressOptions> = {
  maxDimension: 1200,
  quality: 0.8,
  outputType: 'image/jpeg',
}

/**
 * Compress a File using the Canvas API.
 * Falls back to the original file if compression is not supported.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options }

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      if (width <= opts.maxDimension && height <= opts.maxDimension) {
        // Already small enough – skip compression
        resolve(file)
        return
      }

      if (width > height) {
        height = Math.round((height * opts.maxDimension) / width)
        width = opts.maxDimension
      } else {
        width = Math.round((width * opts.maxDimension) / height)
        height = opts.maxDimension
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        resolve(file)
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(file)
            return
          }
          const ext = opts.outputType === 'image/webp' ? 'webp' : 'jpg'
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `.${ext}`),
            { type: opts.outputType }
          )
          resolve(compressedFile)
        },
        opts.outputType,
        opts.quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }

    img.src = url
  })
}

/**
 * Validate a list of files against size/type/count constraints.
 */
export interface PhotoValidationResult {
  valid: boolean
  errors: string[]
  validFiles: File[]
}

export function validatePhotos(
  files: File[],
  opts: { maxCount?: number; maxTotalBytes?: number; maxSingleBytes?: number } = {}
): PhotoValidationResult {
  const { maxCount = 10, maxTotalBytes = 50 * 1024 * 1024, maxSingleBytes = 10 * 1024 * 1024 } = opts
  const errors: string[] = []
  const validFiles: File[] = []

  if (files.length > maxCount) {
    errors.push(`You can upload a maximum of ${maxCount} photos.`)
    return { valid: false, errors, validFiles: files.slice(0, maxCount) }
  }

  let total = 0
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      errors.push(`${file.name} is not an image file.`)
      continue
    }
    if (file.size > maxSingleBytes) {
      errors.push(`${file.name} exceeds the ${maxSingleBytes / (1024 * 1024)}MB single-file limit.`)
      continue
    }
    total += file.size
    if (total > maxTotalBytes) {
      errors.push(`Total photo size exceeds ${maxTotalBytes / (1024 * 1024)}MB.`)
      break
    }
    validFiles.push(file)
  }

  return { valid: errors.length === 0, errors, validFiles }
}

/**
 * Generate a local object-URL preview for a File.
 * Remember to call URL.revokeObjectURL(url) when done.
 */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/**
 * Revoke all preview URLs to free memory.
 */
export function revokePreviewUrls(urls: string[]): void {
  for (const url of urls) {
    try {
      URL.revokeObjectURL(url)
    } catch {
      // ignore
    }
  }
}
