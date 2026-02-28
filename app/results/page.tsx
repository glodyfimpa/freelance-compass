'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import type { FormData, CalcoloNettoResult } from '@/lib/types'
import { calcolaNettoPerRuolo } from '@/lib/calculator'
import { getTariffaObiettivo, getSeniority } from '@/lib/benchmarks'
import { parseStreamingBlocks } from '@/lib/stream-parser'
import type { ParsedBlocks } from '@/lib/stream-parser'
import ResultBlock from '@/components/ResultBlock'
import KpiCards from '@/components/KpiCards'

const RUOLO_LABELS: Record<string, string> = {
  backend: 'Backend Developer',
  frontend: 'Frontend Developer',
  fullstack: 'Fullstack Developer',
  devops: 'DevOps / SRE',
  data: 'Data Engineer / ML',
  altro: 'Altro',
}

const SENIORITY_LABELS: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-level',
  senior: 'Senior',
}

function ProfileBadges({ formData }: { formData: FormData }) {
  const seniority = getSeniority(formData.anniEsperienza)
  const badges = [
    RUOLO_LABELS[formData.ruolo] ?? formData.ruolo,
    SENIORITY_LABELS[seniority],
    formData.regime === 'forfettario5' ? 'Forfettario 5%' : 'Forfettario 15%',
    `${formData.giorniFatturatiMese} gg/mese`,
  ]
  if (formData.stack) badges.splice(1, 0, formData.stack)

  return (
    <div className="mb-6 flex flex-wrap gap-2 justify-center">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
        >
          {badge}
        </span>
      ))}
    </div>
  )
}

function ResultsContent() {
  const [blocks, setBlocks] = useState<ParsedBlocks>(() =>
    parseStreamingBlocks('', false),
  )
  const [errore, setErrore] = useState<string | null>(null)
  const [streamComplete, setStreamComplete] = useState(false)
  const [formData, setFormData] = useState<FormData | null>(null)

  const kpiData = useMemo(() => {
    if (!formData) return null
    const atecoManuale = formData.atecoConosciuto ? formData.codiceAteco : undefined
    const risultatoAttuale = calcolaNettoPerRuolo(
      formData.tariffaGiornaliera,
      formData.giorniFatturatiMese,
      formData.ruolo,
      formData.regime,
      atecoManuale,
    )
    const tariffaObj = getTariffaObiettivo(
      formData.ruolo,
      formData.anniEsperienza,
      formData.tariffaGiornaliera,
    )
    const risultatoObiettivo = calcolaNettoPerRuolo(
      tariffaObj,
      formData.giorniFatturatiMese,
      formData.ruolo,
      formData.regime,
      atecoManuale,
    )
    const deltaNetto = Math.round((risultatoObiettivo.primario.netto - risultatoAttuale.primario.netto) * 100) / 100
    const risultato: CalcoloNettoResult = {
      calcoloAttuale: risultatoAttuale.primario,
      calcoloObiettivo: risultatoObiettivo.primario,
      deltaNetto,
      calcoloAlternativo: risultatoAttuale.alternativo,
    }
    return { risultato, tariffaObiettivo: tariffaObj }
  }, [formData])

  const [activeCard, setActiveCard] = useState<number | null>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHeight, setHeaderHeight] = useState(0)

  useEffect(() => {
    if (!headerRef.current) return
    const observer = new ResizeObserver(([entry]) => {
      setHeaderHeight(entry.contentRect.height)
    })
    observer.observe(headerRef.current)
    return () => observer.disconnect()
  }, [])

  const handleCardClick = useCallback((index: number) => {
    setActiveCard(prev => prev === index ? null : index)
  }, [])

  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [stuckCards, setStuckCards] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!headerHeight) return
    const stickyTops = [0, 1, 2].map(i => headerHeight + 10 + i * 25)
    let rafId: number

    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const next = new Set<number>()
        cardRefs.current.forEach((el, i) => {
          if (!el) return
          if (el.getBoundingClientRect().top <= stickyTops[i] + 1) next.add(i)
        })
        setStuckCards(prev => {
          if (prev.size === next.size && [...prev].every(v => next.has(v))) return prev
          return next
        })
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(rafId) }
  }, [headerHeight])

  const fetchAnalisi = useCallback(async (fd: FormData) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fd),
      })

      if (!response.ok) {
        setErrore(`Errore dal server: ${response.status} ${response.statusText}`)
        return
      }

      const reader = response.body?.getReader()
      if (!reader) {
        setErrore('Risposta vuota dal server.')
        return
      }

      const decoder = new TextDecoder()
      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        accumulatedText += chunk
        setBlocks(parseStreamingBlocks(accumulatedText, false))
      }

      if (!accumulatedText.trim()) {
        setErrore('Nessun risultato ricevuto.')
        return
      }

      setBlocks(parseStreamingBlocks(accumulatedText, true))
      setStreamComplete(true)
    } catch (err) {
      setErrore(
        err instanceof Error
          ? `Errore di connessione: ${err.message}`
          : 'Errore durante il caricamento dei risultati.',
      )
    }
  }, [])

  useEffect(() => {
    const raw = sessionStorage.getItem('freelance-compass-data')

    if (!raw) {
      setErrore('Dati del form mancanti. Torna alla pagina principale per compilare il form.')
      return
    }

    try {
      const fd: FormData = JSON.parse(raw)
      setFormData(fd)
      fetchAnalisi(fd)
    } catch {
      setErrore('Dati del form non validi. Torna alla pagina principale per compilare il form.')
    }
  }, [fetchAnalisi])

  if (errore) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700">{errore}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Nuova analisi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div ref={headerRef} className="sticky top-0 z-[100] bg-[#f7f8fa] pb-4">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            La tua analisi
          </h1>
          {streamComplete && (
            <p className="mt-2 text-sm text-gray-400">Analisi completata.</p>
          )}
        </header>

        {formData && <ProfileBadges formData={formData} />}

        {kpiData && (
          <KpiCards
            risultato={kpiData.risultato}
            tariffaObiettivo={kpiData.tariffaObiettivo}
            tariffaAttuale={formData!.tariffaGiornaliera}
          />
        )}
      </div>

      {blocks.benchmark.stato === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
              style={{ animationDelay: '0.3s' }}
            />
            <span
              className="h-2 w-2 animate-pulse rounded-full bg-blue-500"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
          <p className="mt-4 text-sm text-gray-400">Analisi del tuo profilo in corso...</p>
        </div>
      ) : (
        <div>
          {[
            { block: blocks.benchmark, variant: 'default' as const },
            { block: blocks.analisi, variant: 'default' as const },
            { block: blocks.piano, variant: 'highlighted' as const },
          ].map(({ block, variant }, i) => (
            <div
              key={i}
              ref={el => { cardRefs.current[i] = el }}
              className="sticky transition-[margin] duration-500 ease-out animate-[fadeSlideIn_0.5s_ease-out_both]"
              style={{
                top: `${headerHeight + 10 + i * 25}px`,
                zIndex: activeCard === i ? 50 : 10 + i,
                marginBottom: activeCard !== null && i < activeCard ? '-2rem' : '1.5rem',
                marginTop: activeCard !== null && i > activeCard ? '70vh' : '0',
                animationDelay: `${i * 150}ms`,
              }}
            >
              <ResultBlock
                titolo={block.titolo}
                contenuto={block.contenuto}
                stato={block.stato}
                variant={variant}
                onClick={() => handleCardClick(i)}
                maxHeight={stuckCards.has(i) ? `calc(100vh - ${headerHeight + 10 + i * 25 + 24}px)` : undefined}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          Nuova analisi
        </Link>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return <ResultsContent />
}
