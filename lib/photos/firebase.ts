/**
 * Firebase Storage & Firestore helpers for the Photo Reviews system.
 * Real uploads use Firebase Storage; all metadata lives in Firestore.
 * Falls back to mock data when Firebase is not configured.
 */
import { storage, db } from '@/lib/firebase'
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore'
import type { JobPhoto } from '@/types'

// ─── Mock data (used when Firebase is not configured) ───────────────────────

export const MOCK_PHOTOS: JobPhoto[] = [
  {
    id: 'photo1',
    jobId: '1',
    workerId: 'worker1',
    workerName: 'Alex Johnson',
    url: 'https://placehold.co/800x600/4f46e5/ffffff?text=Before',
    thumbnailUrl: 'https://placehold.co/400x300/4f46e5/ffffff?text=Before',
    caption: 'Leaking pipe under bathroom sink — before repair',
    type: 'before',
    approvalStatus: 'approved',
    qualityScore: 90,
    fileSize: 1024 * 800,
    width: 800,
    height: 600,
    createdAt: new Date(Date.now() - 3600 * 2 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 2 * 1000).toISOString(),
  },
  {
    id: 'photo2',
    jobId: '1',
    workerId: 'worker1',
    workerName: 'Alex Johnson',
    url: 'https://placehold.co/800x600/16a34a/ffffff?text=After',
    thumbnailUrl: 'https://placehold.co/400x300/16a34a/ffffff?text=After',
    caption: 'Pipe replaced and sealed — job complete',
    type: 'after',
    approvalStatus: 'approved',
    qualityScore: 95,
    fileSize: 1024 * 750,
    width: 800,
    height: 600,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'photo3',
    jobId: '1',
    workerId: 'worker1',
    workerName: 'Alex Johnson',
    url: 'https://placehold.co/800x600/0891b2/ffffff?text=Progress',
    thumbnailUrl: 'https://placehold.co/400x300/0891b2/ffffff?text=Progress',
    caption: 'Mid-repair — pipe sections cut and ready',
    type: 'progress',
    approvalStatus: 'pending',
    fileSize: 1024 * 820,
    width: 800,
    height: 600,
    createdAt: new Date(Date.now() - 3600 * 1.5 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1.5 * 1000).toISOString(),
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function timestampToISO(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

// ─── Upload a single photo to Firebase Storage ──────────────────────────────

export interface UploadPhotoOptions {
  file: File
  jobId: string
  workerId: string
  workerName: string
  caption: string
  type: 'before' | 'after' | 'progress'
  onProgress?: (pct: number) => void
}

export async function uploadJobPhoto(options: UploadPhotoOptions): Promise<JobPhoto> {
  const { file, jobId, workerId, workerName, caption, type, onProgress } = options

  if (!storage || !db) {
    // Mock upload for local dev
    await new Promise<void>((resolve) => {
      let p = 0
      const iv = setInterval(() => {
        p += 20
        onProgress?.(Math.min(p, 100))
        if (p >= 100) { clearInterval(iv); resolve() }
      }, 200)
    })
    const mock: JobPhoto = {
      id: `photo_${Date.now()}`,
      jobId,
      workerId,
      workerName,
      url: `https://placehold.co/800x600/4f46e5/ffffff?text=${encodeURIComponent(caption.slice(0, 20) || type)}`,
      thumbnailUrl: `https://placehold.co/400x300/4f46e5/ffffff?text=${encodeURIComponent(type)}`,
      caption,
      type,
      approvalStatus: 'pending',
      fileSize: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return mock
  }

  // Real Firebase upload
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `job-photos/${jobId}/${workerId}/${Date.now()}.${ext}`
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  const url = await new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      async () => {
        try {
          resolve(await getDownloadURL(uploadTask.snapshot.ref))
        } catch (e) {
          reject(e)
        }
      }
    )
  })

  const docRef = await addDoc(collection(db, 'jobPhotos'), {
    jobId,
    workerId,
    workerName,
    url,
    caption,
    type,
    approvalStatus: 'pending',
    fileSize: file.size,
    storagePath: path,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  return {
    id: docRef.id,
    jobId,
    workerId,
    workerName,
    url,
    caption,
    type,
    approvalStatus: 'pending',
    fileSize: file.size,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

// ─── Fetch photos for a job ──────────────────────────────────────────────────

export async function getJobPhotos(jobId: string): Promise<JobPhoto[]> {
  if (!db) return MOCK_PHOTOS.filter((p) => p.jobId === jobId)

  const q = query(
    collection(db, 'jobPhotos'),
    where('jobId', '==', jobId),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<JobPhoto, 'id'>),
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  }))
}

// ─── Fetch photos for a worker ───────────────────────────────────────────────

export async function getWorkerPhotos(workerId: string): Promise<JobPhoto[]> {
  if (!db) return MOCK_PHOTOS.filter((p) => p.workerId === workerId)

  const q = query(
    collection(db, 'jobPhotos'),
    where('workerId', '==', workerId),
    orderBy('createdAt', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<JobPhoto, 'id'>),
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  }))
}

// ─── Fetch ALL photos (admin) ────────────────────────────────────────────────

export async function getAllPhotos(): Promise<JobPhoto[]> {
  if (!db) return MOCK_PHOTOS

  const snap = await getDocs(
    query(collection(db, 'jobPhotos'), orderBy('createdAt', 'desc'))
  )
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<JobPhoto, 'id'>),
    createdAt: timestampToISO(d.data().createdAt),
    updatedAt: timestampToISO(d.data().updatedAt),
  }))
}

// ─── Moderate a photo (admin) ────────────────────────────────────────────────

export async function moderatePhoto(
  photoId: string,
  status: 'approved' | 'flagged',
  moderatorNote?: string
): Promise<void> {
  if (!db) return

  await updateDoc(doc(db, 'jobPhotos', photoId), {
    approvalStatus: status,
    ...(moderatorNote ? { moderatorNote } : {}),
    updatedAt: serverTimestamp(),
  })
}

// ─── Delete a photo ──────────────────────────────────────────────────────────

export async function deleteJobPhoto(photoId: string): Promise<void> {
  if (!db) return

  const snap = await getDoc(doc(db, 'jobPhotos', photoId))
  if (!snap.exists()) return

  const data = snap.data()
  if (data.storagePath && storage) {
    try {
      await deleteObject(ref(storage, data.storagePath))
    } catch {
      // ignore if file already deleted
    }
  }
  await updateDoc(doc(db, 'jobPhotos', photoId), { deleted: true, updatedAt: serverTimestamp() })
}
