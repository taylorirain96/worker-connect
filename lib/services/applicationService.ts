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
} from 'firebase/firestore'
import type { JobApplication } from '@/types'

function docToApplication(id: string, data: Record<string, unknown>): JobApplication {
  return {
    ...data,
    id,
    appliedAt:
      data.appliedAt instanceof Timestamp
        ? data.appliedAt.toDate().toISOString()
        : (data.appliedAt as string) ?? new Date().toISOString(),
    respondedAt:
      data.respondedAt instanceof Timestamp
        ? data.respondedAt.toDate().toISOString()
        : (data.respondedAt as string | undefined),
  } as JobApplication
}

// ─── Mock data fallback ───────────────────────────────────────────────────────

const MOCK_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_mock_1',
    workerId: 'worker_demo',
    jobId: 'mock_job_1',
    status: 'pending',
    coverLetter: 'I have 5 years of plumbing experience and can start immediately.',
    appliedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'app_mock_2',
    workerId: 'worker_demo',
    jobId: 'mock_job_2',
    status: 'accepted',
    coverLetter: 'Certified electrician with residential experience.',
    appliedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    respondedAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

// ─── Application CRUD ─────────────────────────────────────────────────────────

/**
 * Create a new job application.
 * Returns the created application ID.
 */
export async function createApplication(
  workerId: string,
  jobId: string,
  coverLetter?: string
): Promise<string> {
  if (!db) {
    // Return mock ID
    return `app_${Date.now()}`
  }

  // Prevent duplicate applications
  const existing = await getDocs(
    query(
      collection(db, 'applications'),
      where('workerId', '==', workerId),
      where('jobId', '==', jobId)
    )
  )
  if (!existing.empty) {
    throw new Error('You have already applied for this job')
  }

  const application: Omit<JobApplication, 'id'> = {
    workerId,
    jobId,
    status: 'pending',
    coverLetter: coverLetter ?? '',
    appliedAt: new Date().toISOString(),
  }

  const docRef = await addDoc(collection(db, 'applications'), {
    ...application,
    appliedAt: serverTimestamp(),
  })

  return docRef.id
}

/**
 * Get all applications for a specific worker, optionally filtered by status.
 */
export async function getWorkerApplications(
  workerId: string,
  status?: 'pending' | 'accepted' | 'rejected' | 'withdrawn'
): Promise<JobApplication[]> {
  if (!db) {
    const apps = MOCK_APPLICATIONS.filter((a) => a.workerId === workerId)
    return status ? apps.filter((a) => a.status === status) : apps
  }

  try {
    let q = query(
      collection(db, 'applications'),
      where('workerId', '==', workerId),
      orderBy('appliedAt', 'desc')
    )
    if (status) {
      q = query(
        collection(db, 'applications'),
        where('workerId', '==', workerId),
        where('status', '==', status),
        orderBy('appliedAt', 'desc')
      )
    }
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) =>
      docToApplication(d.id, d.data() as Record<string, unknown>)
    )
  } catch {
    return []
  }
}

/**
 * Get all applications for a specific job.
 */
export async function getJobApplications(jobId: string): Promise<JobApplication[]> {
  if (!db) {
    return MOCK_APPLICATIONS.filter((a) => a.jobId === jobId)
  }

  try {
    const q = query(
      collection(db, 'applications'),
      where('jobId', '==', jobId),
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
 * Update the status of an application.
 */
export async function updateApplicationStatus(
  applicationId: string,
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn',
  message?: string
): Promise<void> {
  if (!db) return

  const appRef = doc(db, 'applications', applicationId)
  const snap = await getDoc(appRef)
  if (!snap.exists()) {
    throw new Error('Application not found')
  }

  const updates: Record<string, unknown> = {
    status,
    respondedAt: serverTimestamp(),
  }
  if (message) {
    updates.rejectionReason = message
  }

  await updateDoc(appRef, updates)
}

/**
 * Withdraw an application (sets status to 'withdrawn').
 */
export async function withdrawApplication(applicationId: string): Promise<void> {
  if (!db) return

  const appRef = doc(db, 'applications', applicationId)
  const snap = await getDoc(appRef)
  if (!snap.exists()) {
    throw new Error('Application not found')
  }

  const data = snap.data()
  if (data.status !== 'pending') {
    throw new Error('Only pending applications can be withdrawn')
  }

  await updateDoc(appRef, { status: 'withdrawn', respondedAt: serverTimestamp() })
}

/**
 * Get a single application by ID.
 */
export async function getApplicationById(
  applicationId: string
): Promise<JobApplication | null> {
  if (!db) {
    return MOCK_APPLICATIONS.find((a) => a.id === applicationId) ?? null
  }

  try {
    const appRef = doc(db, 'applications', applicationId)
    const snap = await getDoc(appRef)
    if (!snap.exists()) return null
    return docToApplication(snap.id, snap.data() as Record<string, unknown>)
  } catch {
    return null
  }
}
