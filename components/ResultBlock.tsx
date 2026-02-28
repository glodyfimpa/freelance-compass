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
      <div className="h-4 w-3/4 rounded bg-gray-200" />
      <div className="h-4 w-full rounded bg-gray-200" />
      <div className="h-4 w-5/6 rounded bg-gray-200" />
      <div className="h-4 w-2/3 rounded bg-gray-200" />
    </div>
  )
}

function StreamingIndicator() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 text-sm text-gray-400">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500" />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"
        style={{ animationDelay: '0.2s' }}
      />
      <span
        className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500"
        style={{ animationDelay: '0.4s' }}
      />
    </span>
  )
}

export default function ResultBlock({ titolo, contenuto, stato, variant = 'default' }: ResultBlockProps) {
  const isHighlighted = variant === 'highlighted'

  const sectionClasses = isHighlighted
    ? 'min-h-[200px] rounded-xl border-l-4 border-l-blue-600 border border-blue-100 bg-blue-50/50 p-6 shadow-md'
    : 'min-h-[200px] rounded-xl border border-gray-200 bg-white p-6 shadow-sm'

  return (
    <section className={sectionClasses}>
      <h2 className="mb-4 flex items-center text-xl font-semibold tracking-tight">
        {titolo}
        {stato === 'streaming' && <StreamingIndicator />}
      </h2>

      {stato === 'loading' ? (
        <SkeletonBlock />
      ) : (
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{contenuto}</ReactMarkdown>
        </div>
      )}
    </section>
  )
}
