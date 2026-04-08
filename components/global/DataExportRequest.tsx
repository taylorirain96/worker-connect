'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { GDPRDataRequest } from '@/types/global'

interface DataExportRequestProps {
  userId: string
}

export default function DataExportRequest({ userId }: DataExportRequestProps) {
  const [exportRequest, setExportRequest] = useState<GDPRDataRequest | null>(null)
  const [deleteRequest, setDeleteRequest] = useState<GDPRDataRequest | null>(null)
  const [loading, setLoading] = useState<'export' | 'delete' | null>(null)
  const [error, setError] = useState('')

  const handleExport = async () => {
    setLoading('export')
    setError('')
    try {
      const res = await fetch('/api/gdpr/export-request', {
        method: 'POST',
        headers: { 'x-user-id': userId },
      })
      const data = await res.json() as { request: GDPRDataRequest; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Export request failed')
      setExportRequest(data.request)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to request account deletion? This cannot be undone.')) return
    setLoading('delete')
    setError('')
    try {
      const res = await fetch('/api/gdpr/delete-request', {
        method: 'POST',
        headers: { 'x-user-id': userId, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'User requested account deletion' }),
      })
      const data = await res.json() as { request: GDPRDataRequest; error?: string }
      if (!res.ok) throw new Error(data.error ?? 'Delete request failed')
      setDeleteRequest(data.request)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(null)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[status] ?? ''}`}>
        {status}
      </span>
    )
  }

  return (
    <Card>
      <CardContent>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Data Rights
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          You have the right to export or delete your personal data.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Export My Data</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Download a copy of all your personal data
              </p>
              {exportRequest && (
                <div className="mt-1 flex items-center gap-2">
                  {statusBadge(exportRequest.status)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(exportRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              loading={loading === 'export'}
              disabled={exportRequest?.status === 'pending' || exportRequest?.status === 'processing'}
            >
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 dark:border-red-800">
            <div>
              <p className="text-sm font-medium text-red-900 dark:text-red-300">Delete My Account</p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Permanently delete your account and all data
              </p>
              {deleteRequest && (
                <div className="mt-1 flex items-center gap-2">
                  {statusBadge(deleteRequest.status)}
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(deleteRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              loading={loading === 'delete'}
              disabled={deleteRequest?.status === 'pending' || deleteRequest?.status === 'processing'}
            >
              Delete
            </Button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
      </CardContent>
    </Card>
  )
}
