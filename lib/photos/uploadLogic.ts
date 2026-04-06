export const PHOTO_CONSTRAINTS = {
  maxFiles: 10,
  minFiles: 2,
  maxSizeBytes: 5 * 1024 * 1024, // 5 MB
  acceptedTypes: ['image/jpeg', 'image/png'],
  acceptedExtensions: ['.jpg', '.jpeg', '.png'],
}

/** Default max width (px) for client-side image resizing — Full HD width */
const DEFAULT_MAX_WIDTH_PX = 1920
/** Default JPEG/PNG compression quality (0–1) */
const DEFAULT_COMPRESSION_QUALITY = 0.85

export interface FileValidationResult {
  valid: boolean
  error?: string
}

/** Validate a single file against type and size constraints */
export function validatePhotoFile(file: File): FileValidationResult {
  if (!PHOTO_CONSTRAINTS.acceptedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPEG and PNG files are accepted.' }
  }
  if (file.size > PHOTO_CONSTRAINTS.maxSizeBytes) {
    return { valid: false, error: 'File size must be 5 MB or less.' }
  }
  return { valid: true }
}

/** Validate the number of files selected */
export function validatePhotoCount(count: number): FileValidationResult {
  if (count < PHOTO_CONSTRAINTS.minFiles) {
    return {
      valid: false,
      error: `Please upload at least ${PHOTO_CONSTRAINTS.minFiles} photos.`,
    }
  }
  if (count > PHOTO_CONSTRAINTS.maxFiles) {
    return {
      valid: false,
      error: `You can upload at most ${PHOTO_CONSTRAINTS.maxFiles} photos.`,
    }
  }
  return { valid: true }
}

/** Compress / resize an image file in the browser using a canvas element.
 *  Returns a new Blob at reduced quality.  If the browser does not support
 *  canvas-based compression the original file is returned unchanged.
 */
export async function compressImage(
  file: File,
  maxWidthPx = DEFAULT_MAX_WIDTH_PX,
  quality = DEFAULT_COMPRESSION_QUALITY
): Promise<File> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidthPx) {
          height = Math.round((height * maxWidthPx) / width)
          width = maxWidthPx
        }
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
            const compressed = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            // Only use compressed version if it is actually smaller
            resolve(compressed.size < file.size ? compressed : file)
          },
          file.type,
          quality
        )
      }
      img.src = e.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Return a human-readable file size string */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Create a local preview URL for a File object */
export function createPreviewUrl(file: File): string {
  return URL.createObjectURL(file)
}

/** Revoke a previously created preview URL to free memory */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url)
}
