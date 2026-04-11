import { db } from '@/lib/firebase'
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
  increment,
} from 'firebase/firestore'
import type { JobApplication } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToApplication(id: string, data: Record<string, unknown>): JobApplication {
  return {
    ...data,
    id,
    appliedAt: tsToIso(data.appliedAt),
    updatedAt: tsToIso(data.updatedAt),
    respondedAt: data.respondedAt ? tsToIso(data.respondedAt) : undefined,
  } as JobApplication
}

/**
 * Submit a new application.
 * Returns the created application document ID.
 */
export async function applyToJob(
  jobId: string,
  job: { title: string; employerId: string; employerName: string },
  worker: { uid: string; displayName: string; photoURL?: string; rating?: number },
  coverLetter?: string
): Promise<string> {
  if (!db) throw new Error('Feature not available')

  // Prevent duplicate applications
  const already = await getDocs(
    query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('workerId', '==', worker.uid)
    )
  )
  if (!already.empty) {
    throw new Error('You have already applied for this job')
  }

  const now = serverTimestamp()
  const docRef = await addDoc(collection(db, 'applications'), {
    jobId,
    jobTitle: job.title,
    employerId: job.employerId,
    employerName: job.employerName,
    workerId: worker.uid,
    workerName: worker.displayName,
    workerPhotoURL: worker.photoURL ?? null,
    workerRating: worker.rating ?? null,
    coverLetter: coverLetter ?? null,
    status: 'pending',
    appliedAt: now,
    updatedAt: now,
  })

  // Increment the job's applicant count (guards against non-existent job doc)
  const jobRef = doc(db, 'jobs', jobId)
  const jobSnap = await getDoc(jobRef)
  if (jobSnap.exists()) {
    await updateDoc(jobRef, { applicantsCount: increment(1) })
  }

  return docRef.id
}

/**
 * Get all applications submitted by a worker.
 */
export async function getWorkerApplications(workerId: string): Promise<JobApplication[]> {
  if (!db) return []

  try {
    const q = query(
      collection(db, 'applications'),
      where('workerId', '==', workerId),
      orderBy('appliedAt', 'desc')
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) =>
      docToApplication(d.id, d.data() as Record<string, unknown>)
    )
  } catch {
    return []
  }
}

/**
 * Withdraw a pending application (sets status to 'withdrawn').
 */
export async function withdrawApplication(applicationId: string): Promise<void> {
  if (!db) throw new Error('Feature not available')

  const appRef = doc(db, 'applications', applicationId)
  const snap = await getDoc(appRef)
  if (!snap.exists()) throw new Error('Application not found')

  const data = snap.data()
  if (data.status !== 'pending') {
    throw new Error('Only pending applications can be withdrawn')
  }

  await updateDoc(appRef, {
    status: 'withdrawn',
    updatedAt: serverTimestamp(),
  })
}

/**
 * Check if a worker has already applied to a job.
 */
export async function hasApplied(jobId: string, workerId: string): Promise<boolean> {
  return (await getApplicationId(jobId, workerId)) !== null
}

/**
 * Get the application ID for a worker's application to a specific job, or null if not applied.
 */
export async function getApplicationId(jobId: string, workerId: string): Promise<string | null> {
  if (!db) return null

  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
      where('workerId', '==', workerId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return snapshot.docs[0].id
  } catch {
    return null
  }
}
