'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import type { ComplianceRequirement, ComplianceAuditResult } from '@/types/global'

interface ComplianceChecklistProps {
  userId: string
  countryCode: string
}

export default function ComplianceChecklist({ userId, countryCode }: ComplianceChecklistProps) {
  const [requirements, setRequirements] = useState<ComplianceRequirement | null>(null)
  const [audit, setAudit] = useState<ComplianceAuditResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [reqRes, auditRes] = await Promise.all([
          fetch(`/api/compliance/${countryCode}`),
          fetch('/api/compliance/audit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
            body: JSON.stringify({ countryCode }),
          }),
        ])
        const reqData = await reqRes.json() as { requirements: ComplianceRequirement }
        const auditData = await auditRes.json() as { result: ComplianceAuditResult }
        setRequirements(reqData.requirements)
        setAudit(auditData.result)
      } catch {
        setError('Failed to load compliance data')
      } finally {
        setLoading(false)
      }
    }
    void loadData()
  }, [userId, countryCode])

  if (loading) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-gray-500 dark:text-gray-400">Loading compliance data...</p>
        </CardContent>
      </Card>
    )
  }

  if (error || !requirements) {
    return (
      <Card>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">{error || 'No data available'}</p>
        </CardContent>
      </Card>
    )
  }

  const issueMap = new Map(audit?.issues.map(i => [i.requirementId, i]))

  return (
    <Card>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Compliance Checklist — {requirements.countryName}
          </h2>
          {audit && (
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                audit.passed
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {audit.passed ? '✓ Passing' : '✗ Issues Found'}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {requirements.requirements.map(req => {
            const issue = issueMap.get(req.id)
            const passed = !issue

            return (
              <div
                key={req.id}
                className={`p-3 rounded-lg border ${
                  passed
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                }`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base mt-0.5">{passed ? '✅' : '❌'}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {req.title}
                      </p>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                        {req.category}
                      </span>
                      {req.mandatory && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {req.description}
                    </p>
                    {issue && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">{issue.issue}</p>
                    )}
                    {req.deadline && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Deadline: {req.deadline}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
