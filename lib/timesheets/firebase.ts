import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface JobTimesheet {
  jobId: string
  workerId: string
  employerId: string
  jobTitle: string
  employerName: string
  quotedBudget: number
  estimatedHours?: number
  sharedWithClient: boolean
  createdAt: string
  updatedAt: string
}

export interface TimesheetEntry {
  id: string
  type: 'time' | 'material'
  date: string
  // time entries
  hours?: number
  minutes?: number
  notes?: string
  // material entries
  itemName?: string
  cost?: number
  receiptNote?: string
  createdAt: string
}

const TIMESHEETS_COLLECTION = 'timesheets'

export async function getOrCreateTimesheet(
  jobId: string,
  workerId: string,
  employerId: string,
  jobTitle: string,
  employerName: string,
  quotedBudget: number,
  estimatedHours?: number
): Promise<JobTimesheet> {
  if (!db) {
    const now = new Date().toISOString()
    return {
      jobId,
      workerId,
      employerId,
      jobTitle,
      employerName,
      quotedBudget,
      estimatedHours,
      sharedWithClient: false,
      createdAt: now,
      updatedAt: now,
    }
  }

  const ref = doc(db, TIMESHEETS_COLLECTION, jobId)
  const snap = await getDoc(ref)

  if (snap.exists()) {
    return snap.data() as JobTimesheet
  }

  const now = new Date().toISOString()
  const timesheet: JobTimesheet = {
    jobId,
    workerId,
    employerId,
    jobTitle,
    employerName,
    quotedBudget,
    estimatedHours,
    sharedWithClient: false,
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(ref, timesheet)
  return timesheet
}

export async function getTimesheet(jobId: string): Promise<JobTimesheet | null> {
  if (!db) return null
  const ref = doc(db, TIMESHEETS_COLLECTION, jobId)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as JobTimesheet
}

export async function getTimesheetEntries(jobId: string): Promise<TimesheetEntry[]> {
  if (!db) return []
  try {
    const ref = collection(db, TIMESHEETS_COLLECTION, jobId, 'entries')
    const q = query(ref, orderBy('date', 'desc'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as TimesheetEntry))
  } catch {
    return []
  }
}

export async function addTimesheetEntry(
  jobId: string,
  entry: Omit<TimesheetEntry, 'id' | 'createdAt'>
): Promise<string> {
  if (!db) throw new Error('Firestore not initialized')
  const ref = collection(db, TIMESHEETS_COLLECTION, jobId, 'entries')
  const now = new Date().toISOString()
  const docRef = await addDoc(ref, { ...entry, createdAt: now })

  // Update the timesheet's updatedAt timestamp
  const sheetRef = doc(db, TIMESHEETS_COLLECTION, jobId)
  await updateDoc(sheetRef, { updatedAt: now })

  return docRef.id
}

export async function deleteTimesheetEntry(jobId: string, entryId: string): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await deleteDoc(doc(db, TIMESHEETS_COLLECTION, jobId, 'entries', entryId))
  const now = new Date().toISOString()
  await updateDoc(doc(db, TIMESHEETS_COLLECTION, jobId), { updatedAt: now })
}

export async function toggleShareWithClient(jobId: string, shared: boolean): Promise<void> {
  if (!db) throw new Error('Firestore not initialized')
  await updateDoc(doc(db, TIMESHEETS_COLLECTION, jobId), {
    sharedWithClient: shared,
    updatedAt: new Date().toISOString(),
  })
}

export async function getWorkerTimesheets(workerId: string): Promise<JobTimesheet[]> {
  if (!db) return []
  try {
    const ref = collection(db, TIMESHEETS_COLLECTION)
    const q = query(ref, where('workerId', '==', workerId), orderBy('updatedAt', 'desc'))
    const snap = await getDocs(q)
    return snap.docs.map((d) => d.data() as JobTimesheet)
  } catch {
    return []
  }
}
