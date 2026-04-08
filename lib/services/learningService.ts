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
import type { LearningJob, SupervisorReport } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToLearningJob(id: string, data: DocumentData): LearningJob {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  } as LearningJob
}

function docToReport(id: string, data: DocumentData): SupervisorReport {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
  } as SupervisorReport
}

export async function createLearningJob(
  jobData: Omit<LearningJob, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'learningJobs')
  const docRef = await addDoc(ref, {
    ...jobData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getLearningJobs(skill?: string): Promise<LearningJob[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'learningJobs')
  let q
  if (skill) {
    q = query(
      ref,
      where('skillBeingTaught', '==', skill),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    )
  } else {
    q = query(ref, where('status', '==', 'active'), orderBy('createdAt', 'desc'))
  }
  const snap = await getDocs(q)
  return snap.docs.map(d => docToLearningJob(d.id, d.data()))
}

export async function getLearningJob(jobId: string): Promise<LearningJob | null> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'learningJobs', jobId))
  if (!snap.exists()) return null
  return docToLearningJob(snap.id, snap.data())
}

export async function applyToLearningJob(
  jobId: string,
  workerId: string,
  message?: string
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'learningJobApplications')
  const docRef = await addDoc(ref, {
    jobId,
    workerId,
    message: message ?? '',
    status: 'pending',
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateSupervisorTracking(
  jobId: string,
  updates: {
    supervisorFeedback?: string
    status?: LearningJob['status']
  }
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'learningJobs', jobId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function completeLearningJob(jobId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'learningJobs', jobId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}

export async function submitSupervisorFeedback(
  report: Omit<SupervisorReport, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'supervisorReports')
  const docRef = await addDoc(ref, {
    ...report,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getSupervisorStats(supervisorId: string): Promise<{
  totalTrained: number
  certified: number
  averageScore: number
  reports: SupervisorReport[]
}> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'supervisorReports')
  const q = query(ref, where('supervisorId', '==', supervisorId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  const reports = snap.docs.map(d => docToReport(d.id, d.data()))
  const certified = reports.filter(r => r.certifyingSkill).length
  const avgScore =
    reports.length > 0
      ? reports.reduce((sum, r) => sum + r.competencyAssessment, 0) / reports.length
      : 0
  return {
    totalTrained: reports.length,
    certified,
    averageScore: Math.round(avgScore),
    reports,
  }
}

export async function getSupervisorLeaderboard(): Promise<
  { supervisorId: string; totalTrained: number; averageScore: number; certified: number }[]
> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'supervisorReports')
  const snap = await getDocs(ref)
  const bySuper: Record<string, SupervisorReport[]> = {}
  snap.docs.forEach(d => {
    const r = docToReport(d.id, d.data())
    if (!bySuper[r.supervisorId]) bySuper[r.supervisorId] = []
    bySuper[r.supervisorId].push(r)
  })
  return Object.entries(bySuper)
    .map(([supervisorId, reports]) => ({
      supervisorId,
      totalTrained: reports.length,
      certified: reports.filter(r => r.certifyingSkill).length,
      averageScore: Math.round(
        reports.reduce((sum, r) => sum + r.competencyAssessment, 0) / reports.length
      ),
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 20)
}
