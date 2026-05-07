/**
 * lib/servicePackages/firebase.ts
 *
 * Client-side Firestore helpers for Service Packages.
 * Firestore collection: servicePackages/{packageId}
 * Bookings collection: servicePackageBookings/{bookingId}
 */
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
  limit as fsLimit,
  type QueryConstraint,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ServicePackage, ServicePackageBooking } from '@/types'

const PACKAGES_COL = 'servicePackages'
const BOOKINGS_COL = 'servicePackageBookings'

// ── Service Packages ──────────────────────────────────────────────────────────

export async function getServicePackage(packageId: string): Promise<ServicePackage | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, PACKAGES_COL, packageId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as ServicePackage
  } catch {
    return null
  }
}

export interface ListPackagesOptions {
  workerId?: string
  category?: string
  region?: string
  activeOnly?: boolean
  maxResults?: number
}

export async function listServicePackages(opts: ListPackagesOptions = {}): Promise<ServicePackage[]> {
  if (!db) return []
  try {
    const constraints: QueryConstraint[] = []
    if (opts.workerId) constraints.push(where('workerId', '==', opts.workerId))
    if (opts.category) constraints.push(where('category', '==', opts.category))
    if (opts.region) constraints.push(where('region', '==', opts.region))
    if (opts.activeOnly !== false) constraints.push(where('active', '==', true))
    constraints.push(orderBy('createdAt', 'desc'))
    if (opts.maxResults) constraints.push(fsLimit(opts.maxResults))

    const q = query(collection(db, PACKAGES_COL), ...constraints)
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServicePackage))
  } catch {
    return []
  }
}

export async function createServicePackage(
  data: Omit<ServicePackage, 'id' | 'createdAt' | 'updatedAt'>
): Promise<ServicePackage | null> {
  if (!db) return null
  try {
    const now = new Date().toISOString()
    const ref = await addDoc(collection(db, PACKAGES_COL), {
      ...data,
      createdAt: now,
      updatedAt: now,
    })
    return { id: ref.id, ...data, createdAt: now, updatedAt: now }
  } catch {
    return null
  }
}

export async function updateServicePackage(
  packageId: string,
  data: Partial<Omit<ServicePackage, 'id' | 'workerId' | 'createdAt'>>
): Promise<boolean> {
  if (!db) return false
  try {
    await updateDoc(doc(db, PACKAGES_COL, packageId), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
    return true
  } catch {
    return false
  }
}

export async function deleteServicePackage(packageId: string): Promise<boolean> {
  if (!db) return false
  try {
    await deleteDoc(doc(db, PACKAGES_COL, packageId))
    return true
  } catch {
    return false
  }
}

// ── Service Package Bookings ──────────────────────────────────────────────────

export async function getServicePackageBooking(bookingId: string): Promise<ServicePackageBooking | null> {
  if (!db) return null
  try {
    const snap = await getDoc(doc(db, BOOKINGS_COL, bookingId))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() } as ServicePackageBooking
  } catch {
    return null
  }
}

export async function listBookingsForUser(
  userId: string,
  role: 'homeowner' | 'worker'
): Promise<ServicePackageBooking[]> {
  if (!db) return []
  try {
    const field = role === 'worker' ? 'workerId' : 'homeownerId'
    const q = query(
      collection(db, BOOKINGS_COL),
      where(field, '==', userId),
      orderBy('createdAt', 'desc')
    )
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ServicePackageBooking))
  } catch {
    return []
  }
}
