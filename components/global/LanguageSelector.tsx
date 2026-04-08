'use client'

import { useEffect, useState } from 'react'
import type { Language } from '@/types/global'

interface LanguageSelectorProps {
  value: string
  onChange: (lang: string) => void
}

export default function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/localization/languages')
      .then(r => r.json())
      .then((data: { languages: Language[] }) => setLanguages(data.languages))
      .catch(() => setLanguages([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Language</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={loading}
        className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
      >
        <option value="">{loading ? 'Loading...' : 'Select language'}</option>
        {languages.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  )
}
