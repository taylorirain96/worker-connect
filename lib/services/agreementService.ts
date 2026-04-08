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
import type { Agreement } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToAgreement(id: string, data: DocumentData): Agreement {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
    signatureStatus: data.signatureStatus ?? { workerSigned: false, employerSigned: false },
  } as Agreement
}

export async function createAgreement(
  proposalId: string,
  jobId: string,
  workerId: string,
  employerId: string,
  agreedTerms: Agreement['agreedTerms'],
  workerName?: string,
  employerName?: string
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'agreements')
  const docRef = await addDoc(ref, {
    proposalId,
    jobId,
    workerId,
    employerId,
    workerName: workerName ?? '',
    employerName: employerName ?? '',
    agreedTerms,
    signatureStatus: { workerSigned: false, employerSigned: false },
    status: 'draft',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getAgreement(agreementId: string): Promise<Agreement | null> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'agreements', agreementId))
  if (!snap.exists()) return null
  return docToAgreement(snap.id, snap.data())
}

export async function signAgreement(
  agreementId: string,
  role: 'worker' | 'employer'
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'agreements', agreementId))
  if (!snap.exists()) throw new Error('Agreement not found')
  const data = snap.data()
  const signatureStatus = { ...data.signatureStatus }
  const now = new Date().toISOString()
  if (role === 'worker') {
    signatureStatus.workerSigned = true
    signatureStatus.workerSignedAt = now
  } else {
    signatureStatus.employerSigned = true
    signatureStatus.employerSignedAt = now
  }
  const bothSigned = signatureStatus.workerSigned && signatureStatus.employerSigned
  await updateDoc(doc(db, 'agreements', agreementId), {
    signatureStatus,
    status: bothSigned ? 'signed' : 'pending_signature',
    updatedAt: serverTimestamp(),
  })
}

export async function getUserAgreements(userId: string): Promise<Agreement[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'agreements')
  const workerQ = query(ref, where('workerId', '==', userId), orderBy('createdAt', 'desc'))
  const employerQ = query(ref, where('employerId', '==', userId), orderBy('createdAt', 'desc'))
  const [workerSnap, employerSnap] = await Promise.all([getDocs(workerQ), getDocs(employerQ)])
  const all = [
    ...workerSnap.docs.map(d => docToAgreement(d.id, d.data())),
    ...employerSnap.docs.map(d => docToAgreement(d.id, d.data())),
  ]
  const seen = new Set<string>()
  return all.filter(a => {
    if (seen.has(a.id)) return false
    seen.add(a.id)
    return true
  })
}

export async function completeAgreement(agreementId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'agreements', agreementId), {
    status: 'completed',
    updatedAt: serverTimestamp(),
  })
}
