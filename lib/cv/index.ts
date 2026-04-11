import { db, storage } from '@/lib/firebase'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export interface WorkerCV {
  workerId: string
  fileName: string
  fileUrl: string
  fileSize: number
  source: 'upload' | 'ai_generated'
  visibility: 'private' | 'public'  // public = shown on profile (Pro only)
  createdAt: string
  updatedAt: string
}

export async function saveCV(workerId: string, cv: Omit<WorkerCV, 'workerId' | 'createdAt' | 'updatedAt'>): Promise<void> {
  if (!db) throw new Error('Firestore not available')
  const docRef = doc(db, 'workerCVs', workerId)
  const existing = await getDoc(docRef)
  await setDoc(docRef, {
    ...cv,
    workerId,
    ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    updatedAt: serverTimestamp(),
  }, { merge: true })
}

export async function getCV(workerId: string): Promise<WorkerCV | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, 'workerCVs', workerId))
  if (!snap.exists()) return null
  return snap.data() as WorkerCV
}

export async function uploadCVFile(workerId: string, file: File): Promise<string> {
  if (!storage) throw new Error('Storage not available')
  const storageRef = ref(storage, `cvs/${workerId}/${Date.now()}_${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
