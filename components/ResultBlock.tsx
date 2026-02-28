'use client'

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import type { BlockState } from '@/lib/stream-parser'

interface ResultBlockProps {
  titolo: string
  contenuto: string
  stato: BlockState
  variant?: 'default' | 'highlighted'
  onClick?: () => void
  collapsed?: boolean
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

export default function ResultBlock({ titolo, contenuto, stato, variant = 'default', onClick, collapsed = false }: ResultBlockProps) {
  const isHighlighted = variant === 'highlighted'

  const baseClasses = 'rounded-xl p-6 shadow-lg'
  const variantClasses = isHighlighted
    ? 'border-l-4 border-l-blue-600 border border-blue-100 bg-white'
    : 'border border-gray-200 bg-white'
  const interactiveClasses = onClick
    ? 'cursor-pointer transition-shadow duration-200 hover:shadow-xl'
    : ''

  return (
    <section className={`${baseClasses} ${variantClasses} ${interactiveClasses}`} onClick={onClick}>
      <h2 className="flex items-center justify-between text-xl font-semibold tracking-tight">
        <span className="flex items-center">
          {titolo}
          {stato === 'streaming' && !collapsed && <StreamingIndicator />}
        </span>
        {onClick && (
          <svg
            className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-300 ${!collapsed ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </h2>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          collapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="pt-4">
            {stato === 'loading' ? (
              <SkeletonBlock />
            ) : (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{contenuto}</ReactMarkdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
