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
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Job, JobCategory } from '@/types'

function docToJob(id: string, data: DocumentData): Job {
  return {
    ...data,
    id,
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt ?? new Date().toISOString(),
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt ?? new Date().toISOString(),
  } as Job
}

export async function saveJob(
  jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'applicantsCount'>
): Promise<string> {
  if (!db) throw new Error('Firestore is not initialized')
  const jobsRef = collection(db, 'jobs')
  const docRef = await addDoc(jobsRef, {
    ...jobData,
    applicantsCount: 0,
    status: jobData.status ?? 'open',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getJobs(): Promise<Job[]> {
  if (!db) return []
  const jobsRef = collection(db, 'jobs')
  const q = query(jobsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToJob(d.id, d.data()))
}

export async function getJobsByCategory(category: JobCategory): Promise<Job[]> {
  if (!db) return []
  const jobsRef = collection(db, 'jobs')
  const q = query(
    jobsRef,
    where('status', '==', 'open'),
    where('category', '==', category),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => docToJob(d.id, d.data()))
}

export async function getJobsNearby(location: string, radius: number = 10): Promise<Job[]> {
  void radius
  if (!db) return []
  // Simple text-match filter — replace with geohash/geolocation query for production
  const jobsRef = collection(db, 'jobs')
  const q = query(jobsRef, where('status', '==', 'open'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  const locationLower = location.toLowerCase()
  return snapshot.docs
    .map((d) => docToJob(d.id, d.data()))
    .filter((job) => job.location.toLowerCase().includes(locationLower))
}

export async function updateJob(jobId: string, updates: Partial<Job>): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized')
  const jobRef = doc(db, 'jobs', jobId)
  await updateDoc(jobRef, { ...updates, updatedAt: serverTimestamp() })
}

export async function deleteJob(jobId: string): Promise<void> {
  if (!db) throw new Error('Firestore is not initialized')
  const jobRef = doc(db, 'jobs', jobId)
  // Archive instead of hard delete
  await updateDoc(jobRef, { status: 'cancelled', updatedAt: serverTimestamp() })
}

export async function getJobById(jobId: string): Promise<Job | null> {
  if (!db) return null
  const jobRef = doc(db, 'jobs', jobId)
  const snapshot = await getDoc(jobRef)
  if (!snapshot.exists()) return null
  return docToJob(snapshot.id, snapshot.data())
}
