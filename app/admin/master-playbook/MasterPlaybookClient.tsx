'use client'
import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

// ---------------------------------------------------------------------------
// Lightweight markdown renderer — supports headings, lists (incl. checkboxes),
// bold, inline code, code blocks, tables, blockquotes, and horizontal rules.
// All content is from the controlled repo file, not from user input.
// ---------------------------------------------------------------------------

type Token =
  | { type: 'hr' }
  | { type: 'heading'; level: number; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'fence'; lang: string; code: string }
  | { type: 'table'; header: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'blank' }
  | { type: 'paragraph'; text: string }

type ListItem = { checked: boolean | null; text: string }

function tokenize(markdown: string): Token[] {
  const lines = markdown.split('\n')
  const tokens: Token[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    // Fenced code block
    if (line.trimStart().startsWith('```')) {
      const lang = line.replace(/^```/, '').trim()
      const codeLines: string[] = []
      i++
      while (i < lines.length && !lines[i].trimStart().startsWith('```')) {
        codeLines.push(lines[i])
        i++
      }
      i++ // consume closing ```
      tokens.push({ type: 'fence', lang, code: codeLines.join('\n') })
      continue
    }

    // Horizontal rule
    if (/^(\s*[-*_]){3,}\s*$/.test(line)) {
      tokens.push({ type: 'hr' })
      i++
      continue
    }

    // Heading
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      tokens.push({ type: 'heading', level: headingMatch[1].length, text: headingMatch[2] })
      i++
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      tokens.push({ type: 'blockquote', text: line.slice(2) })
      i++
      continue
    }

    // Table (detect by | on first line)
    if (/^\|.+\|/.test(line)) {
      const header = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim())
      i++ // skip header
      if (i < lines.length && /^\|[\s\-|:]+\|/.test(lines[i])) i++ // skip separator
      const rows: string[][] = []
      while (i < lines.length && /^\|.+\|/.test(lines[i])) {
        rows.push(lines[i].split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1).map(c => c.trim()))
        i++
      }
      tokens.push({ type: 'table', header, rows })
      continue
    }

    // List (unordered or ordered)
    if (/^(\s*)[-*+] /.test(line) || /^(\s*)\d+\. /.test(line)) {
      const items: ListItem[] = []
      const ordered = /^\s*\d+\./.test(line)
      while (
        i < lines.length &&
        (/^\s*[-*+] /.test(lines[i]) || /^\s*\d+\. /.test(lines[i]))
      ) {
        const raw = lines[i].replace(/^\s*([-*+]|\d+\.)\s/, '')
        // Checkbox
        const cbMatch = raw.match(/^\[( |x)\]\s+(.*)$/i)
        if (cbMatch) {
          items.push({ checked: cbMatch[1].toLowerCase() === 'x', text: cbMatch[2] })
        } else {
          items.push({ checked: null, text: raw })
        }
        i++
      }
      tokens.push({ type: 'list', ordered, items })
      continue
    }

    // Blank line
    if (line.trim() === '') {
      tokens.push({ type: 'blank' })
      i++
      continue
    }

    // Paragraph
    tokens.push({ type: 'paragraph', text: line })
    i++
  }
  return tokens
}

/** Render inline markdown: **bold**, `code`, plain text */
function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const re = /(\*\*(.+?)\*\*|`([^`]+)`)/g
  let last = 0
  let match
  let key = 0
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    if (match[0].startsWith('**')) {
      parts.push(<strong key={key++}>{match[2]}</strong>)
    } else {
      parts.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-sm font-mono text-rose-600 dark:text-rose-400"
        >
          {match[3]}
        </code>
      )
    }
    last = match.index + match[0].length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 ? parts[0] : parts
}

function MarkdownRenderer({ content }: { content: string }) {
  const tokens = useMemo(() => tokenize(content), [content])

  return (
    <div className="prose-content space-y-1">
      {tokens.map((token, idx) => {
        switch (token.type) {
          case 'hr':
            return <hr key={idx} className="my-6 border-gray-200 dark:border-gray-700" />

          case 'heading': {
            const base = 'font-bold text-gray-900 dark:text-white'
            const sizes: Record<number, string> = {
              1: 'text-3xl mt-8 mb-4',
              2: 'text-2xl mt-8 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2',
              3: 'text-xl mt-6 mb-2',
              4: 'text-lg mt-4 mb-1',
              5: 'text-base mt-3 mb-1',
              6: 'text-sm mt-3 mb-1',
            }
            const Tag = `h${token.level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
            return (
              <Tag key={idx} className={`${base} ${sizes[token.level] ?? ''}`}>
                {renderInline(token.text)}
              </Tag>
            )
          }

          case 'blockquote':
            return (
              <blockquote
                key={idx}
                className="border-l-4 border-primary-400 pl-4 py-1 italic text-gray-600 dark:text-gray-400 bg-primary-50 dark:bg-primary-900/20 rounded-r-md"
              >
                {renderInline(token.text)}
              </blockquote>
            )

          case 'fence':
            return (
              <pre
                key={idx}
                className="bg-gray-900 dark:bg-gray-950 text-gray-100 rounded-xl p-4 overflow-x-auto text-sm font-mono leading-relaxed my-4"
              >
                <code>{token.code}</code>
              </pre>
            )

          case 'table':
            return (
              <div key={idx} className="overflow-x-auto my-4">
                <table className="min-w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      {token.header.map((h, hi) => (
                        <th
                          key={hi}
                          className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                        >
                          {renderInline(h)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {token.rows.map((row, ri) => (
                      <tr
                        key={ri}
                        className={ri % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800/50'}
                      >
                        {row.map((cell, ci) => (
                          <td
                            key={ci}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                          >
                            {renderInline(cell)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )

          case 'list': {
            const ListTag = token.ordered ? 'ol' : 'ul'
            return (
              <ListTag
                key={idx}
                className={`my-2 space-y-1 pl-5 ${token.ordered ? 'list-decimal' : 'list-none'}`}
              >
                {token.items.map((item, ii) => {
                  if (item.checked !== null) {
                    return (
                      <li key={ii} className="flex items-start gap-2 text-gray-700 dark:text-gray-300">
                        <span
                          className={`mt-0.5 flex-shrink-0 h-4 w-4 rounded border-2 flex items-center justify-center text-xs ${
                            item.checked
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-gray-400 dark:border-gray-500 bg-white dark:bg-gray-800'
                          }`}
                        >
                          {item.checked && '✓'}
                        </span>
                        <span className={item.checked ? 'line-through text-gray-400' : ''}>
                          {renderInline(item.text)}
                        </span>
                      </li>
                    )
                  }
                  return (
                    <li key={ii} className="text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{renderInline(item.text)}</span>
                    </li>
                  )
                })}
              </ListTag>
            )
          }

          case 'blank':
            return null

          case 'paragraph':
            return (
              <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {renderInline(token.text)}
              </p>
            )

          default:
            return null
        }
      })}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Page component with admin auth gating
// ---------------------------------------------------------------------------

interface Props {
  content: string
}

export default function MasterPlaybookClient({ content }: Props) {
  const { profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && profile?.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [profile, loading, router])

  if (loading || profile?.role !== 'admin') {
    return null
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-6 flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Admin Dashboard
            </Link>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
            {/* Banner */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 rounded-t-2xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary-600 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">QuickTrade Master Playbook</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  Admin-only · Single source of truth ·{' '}
                  <code className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">content/master-playbook.md</code>
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              <MarkdownRenderer content={content} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
