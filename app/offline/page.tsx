import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'You\'re Offline | WorkerConnect',
  robots: { index: false, follow: false },
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-gray-100 px-6 text-center">
      <div className="mb-8">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="mx-auto h-20 w-20 text-indigo-400 opacity-80"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3l18 18M8.111 8.111A6.5 6.5 0 0 0 5.5 13.5M10.5 5.5a9 9 0 0 1 8 8M1.5 1.5C.67 2.33.5 3.5.5 3.5m21 0s.17 1.17-.5 2M12 18.5h.01"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-3 text-white">You&#39;re offline</h1>
      <p className="text-gray-400 max-w-xs leading-relaxed mb-8">
        Reconnect to the internet to use WorkerConnect.
      </p>

      <Link
        href="/"
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
      >
        Try again
      </Link>
    </div>
  )
}
