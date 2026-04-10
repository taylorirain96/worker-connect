'use client'

import { WORKER_THEME } from '@/lib/themes/worker'
import { EMPLOYER_THEME } from '@/lib/themes/employer'
import type { RoleTheme } from '@/lib/themes'

interface ColorSwatchesProps {
  theme: RoleTheme
}

type ColorGroup = {
  label: string
  entries: { name: string; value: string }[]
}

function buildGroups(theme: RoleTheme): ColorGroup[] {
  const t = theme === 'worker' ? WORKER_THEME : EMPLOYER_THEME
  return [
    {
      label: 'Background',
      entries: Object.entries(t.background).map(([name, value]) => ({ name, value })),
    },
    {
      label: 'Accent',
      entries: Object.entries(t.accent).map(([name, value]) => ({ name, value })),
    },
    {
      label: 'Text',
      entries: Object.entries(t.text).map(([name, value]) => ({ name, value })),
    },
    {
      label: 'Border',
      entries: Object.entries(t.border)
        .filter(([, v]) => v.startsWith('#') || v.startsWith('rgb') || v.startsWith('rgba'))
        .map(([name, value]) => ({ name, value })),
    },
  ]
}

export default function ColorSwatches({ theme }: ColorSwatchesProps) {
  const groups = buildGroups(theme)
  const t = theme === 'worker' ? WORKER_THEME : EMPLOYER_THEME

  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: t.text.muted }}>
            {group.label}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {group.entries.map(({ name, value }) => (
              <div
                key={name}
                className="flex items-center gap-2 rounded-lg p-2"
                style={{ backgroundColor: t.background.secondary }}
              >
                <div
                  className="h-7 w-7 rounded-md flex-shrink-0 border"
                  style={{ backgroundColor: value, borderColor: t.border.default }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium capitalize truncate" style={{ color: t.text.secondary }}>
                    {name}
                  </p>
                  <p className="text-[10px] font-mono truncate" style={{ color: t.text.muted }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
