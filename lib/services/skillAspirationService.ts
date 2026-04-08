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
import type { SkillAspiration } from '@/types'

function tsToIso(value: unknown): string {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (typeof value === 'string') return value
  return new Date().toISOString()
}

function docToAspiration(id: string, data: DocumentData): SkillAspiration {
  return {
    ...data,
    id,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
    resourcesUsed: data.resourcesUsed ?? [],
    trainingPath: data.trainingPath ?? [],
  } as SkillAspiration
}

export async function createSkillAspiration(
  workerId: string,
  aspiration: Omit<SkillAspiration, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'skillAspirations')
  const docRef = await addDoc(ref, {
    ...aspiration,
    workerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

export async function getSkillAspirations(workerId: string): Promise<SkillAspiration[]> {
  if (!db) throw new Error('Firestore not initialised')
  const ref = collection(db, 'skillAspirations')
  const q = query(ref, where('workerId', '==', workerId), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => docToAspiration(d.id, d.data()))
}

export async function updateSkillAspiration(
  aspirationId: string,
  updates: Partial<SkillAspiration>
): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await updateDoc(doc(db, 'skillAspirations', aspirationId), {
    ...updates,
    updatedAt: serverTimestamp(),
  })
}

export async function deleteSkillAspiration(aspirationId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialised')
  await deleteDoc(doc(db, 'skillAspirations', aspirationId))
}

export async function getSkillAspiration(aspirationId: string): Promise<SkillAspiration | null> {
  if (!db) throw new Error('Firestore not initialised')
  const snap = await getDoc(doc(db, 'skillAspirations', aspirationId))
  if (!snap.exists()) return null
  return docToAspiration(snap.id, snap.data())
}
