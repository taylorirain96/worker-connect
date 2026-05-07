/**
 * Renders an embedded YouTube or Vimeo video from a standard watch URL.
 * Returns null if the URL is missing or cannot be parsed.
 */

interface WorkerVideoEmbedProps {
  url: string
  workerName: string
}

function toEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // YouTube: youtube.com/watch?v=ID or youtu.be/ID
    if (parsed.hostname === 'www.youtube.com' || parsed.hostname === 'youtube.com') {
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube.com/embed/${id}?rel=0`
    }
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.replace('/', '')
      if (id) return `https://www.youtube.com/embed/${id}?rel=0`
    }

    // Vimeo: vimeo.com/ID
    if (parsed.hostname === 'vimeo.com' || parsed.hostname === 'www.vimeo.com') {
      const id = parsed.pathname.replace('/', '')
      if (id) return `https://player.vimeo.com/video/${id}`
    }

    return null
  } catch {
    return null
  }
}

export default function WorkerVideoEmbed({ url, workerName }: WorkerVideoEmbedProps) {
  if (!url) return null
  const embedUrl = toEmbedUrl(url)
  if (!embedUrl) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Profile Video</h2>
      <div className="relative w-full overflow-hidden rounded-lg" style={{ paddingTop: '56.25%' }}>
        <iframe
          src={embedUrl}
          title={`${workerName} profile video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    </div>
  )
}
