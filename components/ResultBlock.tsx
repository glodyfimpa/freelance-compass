'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import type { BlockState } from '@/lib/stream-parser'

interface ResultBlockProps {
  titolo: string
  contenuto: string
  stato: BlockState
  variant?: 'default' | 'highlighted'
}

function SkeletonBlock() {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-4 w-3/4 rounded bg-slate-200" />
      <div className="h-4 w-full rounded bg-slate-200" />
      <div className="h-4 w-5/6 rounded bg-slate-200" />
      <div className="h-4 w-2/3 rounded bg-slate-200" />
    </div>
  )
}

function StreamingIndicator() {
  return (
    <span className="ml-2 inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]" />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--primary)]"
        style={{ animationDelay: '0.4s' }}
      />
    </span>
  )
}

export default function ResultBlock({ titolo, contenuto, stato, variant = 'default' }: ResultBlockProps) {
  const isHighlighted = variant === 'highlighted'

  return (
    <section
      className={`rounded-2xl p-6 sm:p-8 border transition-all ${
        isHighlighted
          ? 'border-l-4 border-l-[var(--primary)] border-blue-100 bg-white shadow-md'
          : 'border-slate-100 bg-white shadow-sm'
      }`}
    >
      <h2 className="mb-4 flex items-center text-xl font-bold tracking-tight text-[var(--foreground)]">
        {titolo}
        {stato === 'streaming' && <StreamingIndicator />}
      </h2>

      {stato === 'loading' ? (
        <SkeletonBlock />
      ) : (
        <div className="prose prose-sm max-w-none prose-headings:text-[var(--foreground)] prose-p:text-slate-600 prose-strong:text-[var(--foreground)] prose-li:text-slate-600">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{contenuto}</ReactMarkdown>
        </div>
      )}
    </section>
  )
}
