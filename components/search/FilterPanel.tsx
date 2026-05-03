'use client'
import { useState, type ReactNode } from 'react'
import { Filter, ChevronDown, ChevronUp, X } from 'lucide-react'

interface FilterPanelProps {
  children: ReactNode
  /** Number of active filters — shown as a badge */
  activeCount?: number
  onReset?: () => void
  /** Panel is always expanded on desktop; collapsible on mobile */
  defaultExpanded?: boolean
}

/**
 * Reusable collapsible filter panel.
 * On mobile the panel collapses/expands via a header toggle.
 * On desktop (lg+) it is always visible.
 */
export default function FilterPanel({
  children,
  activeCount = 0,
  onReset,
  defaultExpanded = false,
}: FilterPanelProps) {
  const [mobileOpen, setMobileOpen] = useState(defaultExpanded)

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Mobile toggle header */}
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        className="lg:hidden w-full flex items-center justify-between px-4 py-3 text-sm font-semibold
          text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        aria-expanded={mobileOpen}
        aria-controls="filter-panel-body"
      >
        <span className="flex items-center gap-2">
          <Filter className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold
              bg-primary-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          {activeCount > 0 && onReset && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onReset() }}
              className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
          {mobileOpen
            ? <ChevronUp className="h-4 w-4" aria-hidden />
            : <ChevronDown className="h-4 w-4" aria-hidden />}
        </span>
      </button>

      {/* Desktop header (always shown) */}
      <div className="hidden lg:flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
          <Filter className="h-4 w-4" aria-hidden />
          Filters
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold
              bg-primary-600 text-white rounded-full">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
          >
            <X className="h-3 w-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Panel body — always visible on desktop, toggled on mobile */}
      <div
        id="filter-panel-body"
        className={`${mobileOpen ? 'block' : 'hidden'} lg:block p-4 space-y-4`}
      >
        {children}
      </div>
    </div>
  )
}
