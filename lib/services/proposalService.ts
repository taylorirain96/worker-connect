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
import type { Proposal, CounterOffer } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToProposal(id: string, data: DocumentData): Proposal {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
    expiresAt: data.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    counterOffers: data.counterOffers ?? [],
  } as Proposal
}

export async function createProposal(
  jobId: string,
  workerId: string,
  employerId: string,
  proposedTerms: Proposal['proposedTerms'],
  workerName?: string,
  employerName?: string
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'proposals')
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const docRef = await addDoc(ref, {
    jobId,
    workerId,
    employerId,
    workerName: workerName ?? '',
    employerName: employerName ?? '',
    status: 'pending',
    proposedTerms,
    counterOffers: [],
    expiresAt,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getProposalsForJob(jobId: string): Promise<Proposal[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'proposals')
  const q = query(ref, where('jobId', '==', jobId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToProposal(d.id, d.data()))
}

export async function getProposal(proposalId: string): Promise<Proposal | null> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'proposals', proposalId))
  if (!snap.exists()) return null
  return docToProposal(snap.id, snap.data())
}

export async function submitCounterOffer(
  proposalId: string,
  counterOffer: Omit<CounterOffer, 'id' | 'createdAt'>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'proposals', proposalId))
  if (!snap.exists()) throw new Error('Proposal not found')
  const data = snap.data()
  const existing: CounterOffer[] = data.counterOffers ?? []
  const newOffer: CounterOffer = {
    ...counterOffer,
    id: `co_${Date.now()}`,
    createdAt: new Date().toISOString(),
  }
  await updateDoc(doc(db, 'proposals', proposalId), {
    counterOffers: [...existing, newOffer],
    status: 'negotiating',
    updatedAt: serverTimestamp(),
  })
}

export async function acceptProposal(proposalId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'proposals', proposalId), {
    status: 'accepted',
    updatedAt: serverTimestamp(),
  })
}

export async function rejectProposal(proposalId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'proposals', proposalId), {
    status: 'rejected',
    updatedAt: serverTimestamp(),
  })
}
