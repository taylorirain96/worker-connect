import { adminDb } from '@/lib/firebase-admin'
import type {
  PortfolioPhoto,
  ReviewAggregates,
  ServicePackage,
  UserProfile,
  WorkerAvailability,
  WorkerTradeLicence,
} from '@/types'

function serializeDate(value: unknown, fallback?: string) {
  const resolvedFallback = fallback ?? new Date().toISOString()
  if (!value) return resolvedFallback
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof value.toDate === 'function') {
    return value.toDate().toISOString()
  }
  return resolvedFallback
}

function hasPublicAvailability(availability?: WorkerAvailability | null) {
  if (!availability) return false
  const days = [
    availability.monday,
    availability.tuesday,
    availability.wednesday,
    availability.thursday,
    availability.friday,
    availability.saturday,
    availability.sunday,
  ]
  return days.some((day) => day?.available)
}

export interface WorkerPublicProfileData {
  worker: UserProfile
  reviewAgg: ReviewAggregates | null
  hasAvailability: boolean
  portfolio: PortfolioPhoto[]
  servicePackages: ServicePackage[]
  tradeLicences: WorkerTradeLicence[]
}

export async function getWorkerPublicProfileData(
  workerId: string,
): Promise<WorkerPublicProfileData | null> {
  const workerDoc = await adminDb.collection('users').doc(workerId).get()
  if (!workerDoc.exists) return null

  const rawWorker = workerDoc.data()
  if (!rawWorker || rawWorker.role !== 'worker') return null

  const [portfolioSnap, servicePackagesSnap, tradeLicencesSnap, reviewAggDoc] = await Promise.all([
    adminDb.collection('portfolio').doc(workerId).collection('photos').orderBy('order', 'asc').get(),
    adminDb
      .collection('servicePackages')
      .where('workerId', '==', workerId)
      .where('active', '==', true)
      .orderBy('createdAt', 'desc')
      .get(),
    adminDb
      .collection('workerTradeLicences')
      .doc(workerId)
      .collection('items')
      .orderBy('createdAt', 'desc')
      .get(),
    adminDb.collection('reviewAggregates').doc(workerId).get(),
  ])

  const worker: UserProfile = {
    ...(rawWorker as UserProfile),
    uid: workerDoc.id,
    createdAt: serializeDate(rawWorker.createdAt),
    updatedAt: serializeDate(rawWorker.updatedAt, serializeDate(rawWorker.createdAt)),
  }

  const portfolio: PortfolioPhoto[] = portfolioSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      uid: data.uid as string,
      url: data.url as string,
      thumbnailUrl: (data.thumbnailUrl as string | undefined) ?? undefined,
      title: data.title as string,
      category: data.category as string,
      description: (data.description as string | undefined) ?? undefined,
      order: (data.order as number | undefined) ?? 0,
      createdAt: serializeDate(data.createdAt),
    }
  })

  const servicePackages: ServicePackage[] = servicePackagesSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      workerId: data.workerId as string,
      workerName: data.workerName as string,
      workerPhotoURL: (data.workerPhotoURL as string | null | undefined) ?? null,
      workerRating: (data.workerRating as number | undefined) ?? undefined,
      workerReviewCount: (data.workerReviewCount as number | undefined) ?? undefined,
      workerCompletedJobs: (data.workerCompletedJobs as number | undefined) ?? undefined,
      title: data.title as string,
      description: data.description as string,
      price: data.price as number,
      category: data.category as string,
      region: data.region as string,
      inclusions: Array.isArray(data.inclusions) ? (data.inclusions as string[]) : [],
      estimatedDurationHours: (data.estimatedDurationHours as number | undefined) ?? 1,
      active: Boolean(data.active),
      createdAt: serializeDate(data.createdAt),
      updatedAt: serializeDate(data.updatedAt),
    }
  })

  const tradeLicences: WorkerTradeLicence[] = tradeLicencesSnap.docs.map((doc) => {
    const data = doc.data()
    return {
      id: doc.id,
      uid: data.uid as string,
      licenceType: data.licenceType as WorkerTradeLicence['licenceType'],
      licenceNumber: (data.licenceNumber as string | undefined) ?? undefined,
      issuingBody: (data.issuingBody as string | undefined) ?? undefined,
      issueDate: (data.issueDate as string | undefined) ?? undefined,
      expiryDate: (data.expiryDate as string | undefined) ?? undefined,
      documentUrl: (data.documentUrl as string | undefined) ?? undefined,
      notes: (data.notes as string | undefined) ?? undefined,
      createdAt: serializeDate(data.createdAt),
      updatedAt: serializeDate(data.updatedAt),
    }
  })

  const reviewAgg = reviewAggDoc.exists
    ? ({
        id: reviewAggDoc.id,
        ...(reviewAggDoc.data() as Omit<ReviewAggregates, 'id'>),
        updatedAt: serializeDate(reviewAggDoc.data()?.updatedAt),
      } satisfies ReviewAggregates)
    : null

  return {
    worker,
    reviewAgg,
    hasAvailability: hasPublicAvailability(
      typeof rawWorker.availability === 'object' && rawWorker.availability !== null
        ? (rawWorker.availability as WorkerAvailability)
        : undefined,
    ),
    portfolio,
    servicePackages,
    tradeLicences,
  }
}
