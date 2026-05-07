import { adminDb } from '@/lib/firebase-admin'
import type {
  PortfolioPhoto,
  ReviewAggregates,
  ServicePackage,
  UserProfile,
  WorkerAvailability,
  WorkerTradeLicence,
} from '@/types'
import { toIsoDate } from '@/lib/utils/dateSerialization'

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
    createdAt: toIsoDate(
      rawWorker.createdAt,
      workerDoc.createTime?.toDate().toISOString() ?? new Date(0).toISOString(),
    ),
    updatedAt: toIsoDate(
      rawWorker.updatedAt,
      workerDoc.updateTime?.toDate().toISOString() ??
        workerDoc.createTime?.toDate().toISOString() ??
        new Date(0).toISOString(),
    ),
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
      createdAt: toIsoDate(
        data.createdAt,
        doc.createTime?.toDate().toISOString() ?? new Date(0).toISOString(),
      ),
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
      createdAt: toIsoDate(
        data.createdAt,
        doc.createTime?.toDate().toISOString() ?? new Date(0).toISOString(),
      ),
      updatedAt: toIsoDate(
        data.updatedAt,
        doc.updateTime?.toDate().toISOString() ??
          doc.createTime?.toDate().toISOString() ??
          new Date(0).toISOString(),
      ),
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
      createdAt: toIsoDate(
        data.createdAt,
        doc.createTime?.toDate().toISOString() ?? new Date(0).toISOString(),
      ),
      updatedAt: toIsoDate(
        data.updatedAt,
        doc.updateTime?.toDate().toISOString() ??
          doc.createTime?.toDate().toISOString() ??
          new Date(0).toISOString(),
      ),
    }
  })

  const reviewAgg = reviewAggDoc.exists
    ? ({
        id: reviewAggDoc.id,
        ...(reviewAggDoc.data() as Omit<ReviewAggregates, 'id'>),
        updatedAt: toIsoDate(
          reviewAggDoc.data()?.updatedAt,
          reviewAggDoc.updateTime?.toDate().toISOString() ??
            reviewAggDoc.createTime?.toDate().toISOString() ??
            new Date(0).toISOString(),
        ),
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
