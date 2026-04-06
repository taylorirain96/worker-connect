import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { JobPhoto, PhotoApprovalStatus, PhotoType } from '@/types'

/** Convert a Firestore doc snapshot to a JobPhoto */
function docToPhoto(id: string, data: Record<string, unknown>): JobPhoto {
  const uploadedAt =
    data.uploadedAt instanceof Timestamp
      ? data.uploadedAt.toDate().toISOString()
      : typeof data.uploadedAt === 'string'
        ? data.uploadedAt
        : new Date().toISOString()

  return {
    id,
    jobId: (data.jobId as string) ?? '',
    workerId: (data.workerId as string) ?? '',
    workerName: (data.workerName as string) ?? '',
    url: (data.url as string) ?? '',
    thumbnailUrl: data.thumbnailUrl as string | undefined,
    caption: (data.caption as string) ?? '',
    type: (data.type as PhotoType) ?? 'other',
    approvalStatus: (data.approvalStatus as PhotoApprovalStatus) ?? 'pending',
    qualityScore: data.qualityScore as number | undefined,
    uploadedAt,
    fileSize: (data.fileSize as number) ?? 0,
    width: data.width as number | undefined,
    height: data.height as number | undefined,
  }
}

/** Upload a photo file to Firebase Storage and save metadata to Firestore */
export async function uploadJobPhoto(
  jobId: string,
  workerId: string,
  workerName: string,
  file: File,
  caption: string,
  type: PhotoType,
  onProgress?: (pct: number) => void
): Promise<{ photoId: string; url: string }> {
  if (!storage || !db) throw new Error('Firebase not initialised')

  const ext = file.name.split('.').pop() ?? 'jpg'
  const storageRef = ref(storage, `job-photos/${jobId}/${workerId}/${Date.now()}.${ext}`)

  await new Promise<void>((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, file)
    task.on(
      'state_changed',
      (snap) => {
        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
        onProgress?.(pct)
      },
      reject,
      () => resolve()
    )
  })

  const url = await getDownloadURL(storageRef)

  const docRef = await addDoc(collection(db, 'jobPhotos'), {
    jobId,
    workerId,
    workerName,
    url,
    caption,
    type,
    approvalStatus: 'pending',
    fileSize: file.size,
    uploadedAt: serverTimestamp(),
  })

  return { photoId: docRef.id, url }
}

/** Fetch all photos for a given job */
export async function getJobPhotos(jobId: string): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('jobId', '==', jobId),
    orderBy('uploadedAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPhoto(d.id, d.data() as Record<string, unknown>))
}

/** Fetch all photos uploaded by a given worker */
export async function getWorkerPhotos(workerId: string): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('workerId', '==', workerId),
    orderBy('uploadedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPhoto(d.id, d.data() as Record<string, unknown>))
}

/** Fetch all photos pending moderation (admin) */
export async function getPendingPhotos(): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('approvalStatus', '==', 'pending'),
    orderBy('uploadedAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => docToPhoto(d.id, d.data() as Record<string, unknown>))
}

/** Update a photo's approval status (admin moderation) */
export async function updatePhotoStatus(
  photoId: string,
  status: PhotoApprovalStatus,
  qualityScore?: number
): Promise<void> {
  if (!db) return
  const updates: Record<string, unknown> = { approvalStatus: status }
  if (qualityScore !== undefined) updates.qualityScore = qualityScore
  await updateDoc(doc(db, 'jobPhotos', photoId), updates)
}

/** Delete a photo from both Storage and Firestore */
export async function deleteJobPhoto(photoId: string, storageUrl: string): Promise<void> {
  if (!db || !storage) return
  try {
    const storageRef = ref(storage, storageUrl)
    await deleteObject(storageRef)
  } catch {
    // ignore if already deleted
  }
  const docRef = doc(db, 'jobPhotos', photoId)
  const snap = await getDoc(docRef)
  if (snap.exists()) {
    await updateDoc(docRef, { approvalStatus: 'flagged' })
  }
}

/** Count photos uploaded by a worker */
export async function getWorkerPhotoStats(workerId: string): Promise<{
  totalPhotos: number
  approvedPhotos: number
  jobsWithPhotos: number
}> {
  if (!db) return { totalPhotos: 0, approvedPhotos: 0, jobsWithPhotos: 0 }
  const q = query(collection(db, 'jobPhotos'), where('workerId', '==', workerId))
  const snap = await getDocs(q)
  const photos = snap.docs.map((d) => d.data() as Record<string, unknown>)
  const totalPhotos = photos.length
  const approvedPhotos = photos.filter((p) => p.approvalStatus === 'approved').length
  const uniqueJobs = new Set(photos.map((p) => p.jobId as string))
  return { totalPhotos, approvedPhotos, jobsWithPhotos: uniqueJobs.size }
}
