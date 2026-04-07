import { collection, doc, addDoc, updateDoc, getDocs, query, where, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { VerificationRecord, VerificationType, VerificationStatus } from '@/types/reputation'

const COLLECTION = 'verificationRecords'

function toIso(ts: Timestamp | string | undefined): string {
  if (!ts) return new Date().toISOString()
  if (ts instanceof Timestamp) return ts.toDate().toISOString()
  return ts
}

export async function startVerification(workerId: string, type: VerificationType): Promise<VerificationRecord> {
  if (!db) {
    return {
      id: `mock-${Date.now()}`,
      workerId,
      type,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    }
  }
  const ref = await addDoc(collection(db, COLLECTION), {
    workerId,
    type,
    status: 'pending',
    submittedAt: serverTimestamp(),
  })
  return {
    id: ref.id,
    workerId,
    type,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  }
}

export async function getVerificationStatus(workerId: string): Promise<VerificationRecord[]> {
  if (!db) return []
  const q = query(collection(db, COLLECTION), where('workerId', '==', workerId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      ...data,
      id: d.id,
      submittedAt: toIso(data.submittedAt),
      verifiedAt: data.verifiedAt ? toIso(data.verifiedAt) : undefined,
      expiresAt: data.expiresAt ? toIso(data.expiresAt) : undefined,
    } as VerificationRecord
  })
}

export async function updateVerificationStatus(
  recordId: string,
  status: VerificationStatus,
  notes?: string
): Promise<void> {
  if (!db) return
  const ref = doc(db, COLLECTION, recordId)
  const updates: Record<string, unknown> = { status }
  if (notes) updates.notes = notes
  if (status === 'verified') updates.verifiedAt = serverTimestamp()
  await updateDoc(ref, updates)
}
