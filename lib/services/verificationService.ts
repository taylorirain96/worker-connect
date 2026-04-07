import { db } from '@/lib/firebase'
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import type { WorkerVerification, VerificationItem, VerificationType, VerificationStatus } from '@/types/reputation'

export function getVerificationCollection() {
  if (!db) throw new Error('Firestore not initialized')
  return collection(db, 'workerVerifications')
}

export async function getWorkerVerification(workerId: string): Promise<WorkerVerification | null> {
  if (!db) return null
  try {
    const ref = doc(db, 'workerVerifications', workerId)
    const snap = await getDoc(ref)
    if (!snap.exists()) return null
    return snap.data() as WorkerVerification
  } catch {
    return null
  }
}

export async function startVerification(workerId: string, type: VerificationType): Promise<VerificationItem> {
  if (!db) throw new Error('Firestore not initialized')
  const existing = await getWorkerVerification(workerId)
  const newItem: VerificationItem = {
    id: `${workerId}_${type}_${Date.now()}`,
    type,
    status: 'pending',
  }
  const items = existing ? [...existing.items.filter(i => i.type !== type), newItem] : [newItem]
  const score = calculateVerificationScore(items)
  const ref = doc(db, 'workerVerifications', workerId)
  await setDoc(ref, {
    workerId,
    items,
    verificationScore: score,
    lastUpdated: new Date().toISOString(),
  })
  return newItem
}

export async function updateVerificationStatus(
  workerId: string,
  type: VerificationType,
  status: VerificationStatus,
  documentUrl?: string,
): Promise<void> {
  if (!db) return
  const existing = await getWorkerVerification(workerId)
  if (!existing) return
  const now = new Date().toISOString()
  const items = existing.items.map(item => {
    if (item.type !== type) return item
    return {
      ...item,
      status,
      ...(status === 'verified' ? { verifiedAt: now } : {}),
      ...(documentUrl ? { documentUrl } : {}),
    }
  })
  const score = calculateVerificationScore(items)
  const ref = doc(db, 'workerVerifications', workerId)
  await updateDoc(ref, { items, verificationScore: score, lastUpdated: now })
}

export function calculateVerificationScore(items: VerificationItem[]): number {
  const verifiedCount = items.filter(i => i.status === 'verified').length
  return Math.min(100, verifiedCount * 20)
}
