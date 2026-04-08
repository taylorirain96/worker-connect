'use client'
import { useState } from 'react'
import MonthlyDashboard from '@/components/platform/MonthlyDashboard'
import FinancialReports from '@/components/platform/FinancialReports'
import ExpenseTracker from '@/components/platform/ExpenseTracker'
import GSTDashboard from '@/components/platform/GSTDashboard'
import GSTRegistrationToggle from '@/components/admin/GSTRegistrationToggle'
import AccountantExport from '@/components/admin/AccountantExport'

type Tab = 'overview' | 'expenses' | 'reports' | 'gst' | 'export'

export default function PlatformProfitsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'expenses', label: 'Expenses', icon: '💳' },
    { id: 'reports', label: 'Reports', icon: '📋' },
    { id: 'gst', label: 'GST', icon: '🇳🇿' },
    { id: 'export', label: 'Export', icon: '📥' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Platform Financials</h1>
          <p className="text-gray-600 mt-1">
            Track platform profits, expenses, and NZ GST compliance
          </p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-xs">
              📋 <strong>Disclaimer:</strong> This system tracks financial data for accounting purposes only. All figures should be reviewed by a qualified NZ tax accountant before filing with IRD.
            </p>
          </div>
        </div>

        <div className="flex gap-1 mb-6 bg-white rounded-xl border border-gray-200 p-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <MonthlyDashboard />
          </div>
        )}
        {activeTab === 'expenses' && <ExpenseTracker />}
        {activeTab === 'reports' && <FinancialReports />}
        {activeTab === 'gst' && (
          <div className="space-y-6">
            <GSTRegistrationToggle />
            <GSTDashboard />
          </div>
        )}
        {activeTab === 'export' && (
          <div className="space-y-6">
            <AccountantExport />
          </div>
        )}
      </div>
    </div>
  )
}
