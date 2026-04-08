'use client'

import GDPRConsentForm from './GDPRConsentForm'
import DataExportRequest from './DataExportRequest'

interface GDPRDataPortalProps {
  userId: string
}

export default function GDPRDataPortal({ userId }: GDPRDataPortalProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          Privacy & Data Portal
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage your privacy consents and exercise your data rights.
        </p>
      </div>
      <GDPRConsentForm userId={userId} />
      <DataExportRequest userId={userId} />
    </div>
  )
}
