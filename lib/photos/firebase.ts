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
  increment,
  limit,
} from 'firebase/firestore'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '@/lib/firebase'
import type { JobPhoto, PhotoApprovalStatus, PhotoStats } from '@/types'

// ─── Upload ───────────────────────────────────────────────────────────────────

export interface UploadProgress {
  progress: number
  url?: string
  error?: string
}

/**
 * Upload a photo file to Firebase Storage and save metadata to Firestore.
 * Returns the download URL on success.
 */
export async function uploadJobPhoto(
  jobId: string,
  workerId: string,
  workerName: string,
  file: File,
  type: 'before' | 'after' | 'general',
  caption: string,
  onProgress?: (pct: number) => void
): Promise<JobPhoto> {
  if (!storage || !db) {
    throw new Error('Firebase is not configured')
  }

  const ext = file.name.split('.').pop() ?? 'jpg'
  const storagePath = `job-photos/${jobId}/${workerId}/${Date.now()}.${ext}`
  const storageRef = ref(storage, storagePath)

  // Upload with progress tracking
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
    storagePath,
    type,
    caption,
    approvalStatus: 'pending',
    uploadedAt: serverTimestamp(),
  })

  // Bump per-job photo count on the job document (best-effort)
  try {
    await updateDoc(doc(db, 'jobs', jobId), { photoCount: increment(1) })
  } catch (err) {
    // job doc may not exist in demo mode – log and continue
    if (process.env.NODE_ENV === 'development') {
      console.debug('[photos/firebase] Could not update job photoCount:', err)
    }
  }

  return {
    id: docRef.id,
    jobId,
    workerId,
    workerName,
    url,
    storagePath,
    type,
    caption,
    approvalStatus: 'pending',
    uploadedAt: new Date().toISOString(),
  }
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/** Fetch all photos for a given job */
export async function getJobPhotos(jobId: string): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('jobId', '==', jobId),
    orderBy('uploadedAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobPhoto, 'id'>) }))
}

/** Fetch all photos uploaded by a given worker */
export async function getWorkerPhotos(workerId: string, maxResults = 50): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('workerId', '==', workerId),
    orderBy('uploadedAt', 'desc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobPhoto, 'id'>) }))
}

/** Fetch photos pending moderation */
export async function getPendingPhotos(maxResults = 50): Promise<JobPhoto[]> {
  if (!db) return []
  const q = query(
    collection(db, 'jobPhotos'),
    where('approvalStatus', '==', 'pending'),
    orderBy('uploadedAt', 'asc'),
    limit(maxResults)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<JobPhoto, 'id'>) }))
}

/** Get photo stats for a worker */
export async function getWorkerPhotoStats(workerId: string): Promise<PhotoStats> {
  if (!db) {
    return {
      totalPhotos: 0,
      totalJobsWithPhotos: 0,
      totalJobsCompleted: 0,
      photoCompletionRate: 0,
      avgPhotosPerJob: 0,
      avgUploadResponseHours: 0,
    }
  }

  const photosSnap = await getDocs(
    query(collection(db, 'jobPhotos'), where('workerId', '==', workerId))
  )
  const photos = photosSnap.docs.map((d) => d.data() as Omit<JobPhoto, 'id'>)

  const totalPhotos = photos.length
  const jobsWithPhotos = new Set(photos.map((p) => p.jobId)).size

  // Count completed jobs for the worker (best-effort)
  let totalJobsCompleted = jobsWithPhotos
  try {
    const jobsSnap = await getDocs(
      query(
        collection(db, 'jobs'),
        where('assignedWorkerId', '==', workerId),
        where('status', '==', 'completed')
      )
    )
    totalJobsCompleted = Math.max(jobsWithPhotos, jobsSnap.size)
  } catch {
    // ignore
  }

  return {
    totalPhotos,
    totalJobsWithPhotos: jobsWithPhotos,
    totalJobsCompleted,
    photoCompletionRate:
      totalJobsCompleted > 0 ? Math.round((jobsWithPhotos / totalJobsCompleted) * 100) : 0,
    avgPhotosPerJob: jobsWithPhotos > 0 ? Math.round((totalPhotos / jobsWithPhotos) * 10) / 10 : 0,
    avgUploadResponseHours: 0, // complex aggregation – kept simple
  }
}

// ─── Moderation ───────────────────────────────────────────────────────────────

export async function moderatePhoto(
  photoId: string,
  action: 'approve' | 'flag',
  moderatorId: string,
  note?: string,
  qualityScore?: number
): Promise<void> {
  if (!db) return
  const updates: Record<string, unknown> = {
    approvalStatus: action === 'approve' ? 'approved' : 'flagged',
    moderatorId,
    moderatedAt: serverTimestamp(),
  }
  if (note) updates.moderatorNote = note
  if (qualityScore !== undefined) updates.qualityScore = qualityScore

  await updateDoc(doc(db, 'jobPhotos', photoId), updates)
}

export async function deleteJobPhoto(photoId: string): Promise<void> {
  if (!db || !storage) return
  const snap = await getDoc(doc(db, 'jobPhotos', photoId))
  if (!snap.exists()) return
  const data = snap.data() as JobPhoto
  try {
    await deleteObject(ref(storage, data.storagePath))
  } catch {
    // already deleted or path wrong – ignore
  }
  await updateDoc(doc(db, 'jobPhotos', photoId), {
    approvalStatus: 'flagged' as PhotoApprovalStatus,
    deleted: true,
  })
}
