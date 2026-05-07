import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import WorkerProfilePageClient from '@/components/workers/WorkerProfilePageClient'
import { SITE_DESCRIPTION, SITE_URL, absoluteUrl } from '@/lib/seo/config'
import { getWorkerPublicProfileData } from '@/lib/workers/publicProfile'

interface Props {
  params: Promise<{ id: string }>
}

function truncate(text: string, limit: number) {
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

function buildWorkerDescription(data: NonNullable<Awaited<ReturnType<typeof getWorkerPublicProfileData>>>) {
  const { worker, reviewAgg, tradeLicences } = data
  const parts: string[] = []

  if (worker.bio) parts.push(truncate(worker.bio, 140))

  if (worker.location) {
    parts.push(`Based in ${worker.location}.`)
  }

  if (worker.skills?.length) {
    parts.push(`Skills: ${worker.skills.slice(0, 5).join(', ')}.`)
  }

  if (reviewAgg?.totalReviews) {
    parts.push(
      `Rated ${reviewAgg.averageRating.toFixed(1)}/5 from ${reviewAgg.totalReviews} review${reviewAgg.totalReviews === 1 ? '' : 's'}.`,
    )
  } else if (worker.completedJobs) {
    parts.push(
      `${worker.completedJobs} completed job${worker.completedJobs === 1 ? '' : 's'} on QuickTrade.`,
    )
  }

  if (tradeLicences.length) {
    parts.push(`${tradeLicences.length} verified credential${tradeLicences.length === 1 ? '' : 's'} listed.`)
  }

  return truncate(parts.join(' '), 160) || SITE_DESCRIPTION
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const profileData = await getWorkerPublicProfileData(id)

  if (!profileData) {
    return {
      title: 'Worker Profile Not Found | QuickTrade',
      description: SITE_DESCRIPTION,
      robots: { index: false, follow: false },
    }
  }

  const { worker, reviewAgg } = profileData
  const name = worker.displayName ?? 'Worker'
  const titleBits = [name]

  if (worker.location) titleBits.push(worker.location)
  titleBits.push('QuickTrade')

  const title = titleBits.join(' | ')
  const description = buildWorkerDescription(profileData)
  const canonical = absoluteUrl(`/workers/${worker.uid}`)
  const hasIndexableContent = Boolean(
    worker.bio ||
      worker.skills?.length ||
      profileData.portfolio.length ||
      profileData.servicePackages.length ||
      reviewAgg?.totalReviews ||
      worker.completedJobs,
  )

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'profile',
      images: worker.photoURL
        ? [
            {
              url: worker.photoURL,
              alt: `${name} on QuickTrade`,
            },
          ]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: worker.photoURL ? [worker.photoURL] : [`${SITE_URL}/opengraph-image`],
    },
    robots: hasIndexableContent ? undefined : { index: false, follow: true },
  }
}

export default async function WorkerProfilePage({ params }: Props) {
  const { id } = await params
  const profileData = await getWorkerPublicProfileData(id)

  if (!profileData) {
    notFound()
  }

  return <WorkerProfilePageClient workerId={id} initialData={profileData} />
}
