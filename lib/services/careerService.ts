import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Certification, CareerPath } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToCertification(id: string, data: DocumentData): Certification {
  return {
    ...data,
    id,
    issuedAt: tsToIso(data.issuedAt),
  } as Certification
}

function docToCareerPath(id: string, data: DocumentData): CareerPath {
  return {
    ...data,
    id,
    steps: data.steps ?? [],
  } as CareerPath
}

export async function getCertifications(workerId: string): Promise<Certification[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'certifications')
  const q = query(ref, where('workerId', '==', workerId), orderBy('issuedAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToCertification(d.id, d.data()))
}

export async function claimCertification(
  cert: Omit<Certification, 'id'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'certifications')
  const docRef = await addDoc(ref, {
    ...cert,
    issuedAt: serverTimestamp(),
    verified: false,
  })
  return docRef.id
}

export async function verifyCertifications(workerId: string): Promise<Certification[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'certifications')
  const q = query(ref, where('workerId', '==', workerId), where('verified', '==', true))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToCertification(d.id, d.data()))
}

export async function getCareerPaths(): Promise<CareerPath[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'careerPaths')
  const snap = await getDocs(ref)
  return snap.docs.map(d => docToCareerPath(d.id, d.data()))
}

export async function getCareerPath(fromSkill: string, toSkill: string): Promise<CareerPath | null> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'careerPaths')
  const q = query(
    ref,
    where('fromSkill', '==', fromSkill),
    where('toSkill', '==', toSkill)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return docToCareerPath(d.id, d.data())
}

export async function createCareerPath(
  path: Omit<CareerPath, 'id'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'careerPaths')
  const docRef = await addDoc(ref, path)
  return docRef.id
}
