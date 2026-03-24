'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
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
    <div className="flex flex-wrap gap-2 justify-center">
      {badges.map((badge) => (
        <span
          key={badge}
          className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600"
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
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-700">{errore}</p>
          <Link
            href="/"
            className="mt-6 inline-block cursor-pointer rounded-xl bg-[var(--primary)] px-6 py-3 text-sm font-semibold text-white hover:bg-[var(--primary-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
          >
            Nuova analisi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-[var(--foreground)] sm:text-5xl">
          La tua analisi
        </h1>
        {streamComplete && (
          <p className="mt-3 text-sm text-[var(--muted)]">Analisi completata</p>
        )}
      </header>

      {/* Profile badges */}
      {formData && (
        <div className="mb-8">
          <ProfileBadges formData={formData} />
        </div>
      )}

      {/* KPI cards */}
      {kpiData && (
        <div className="mb-10">
          <KpiCards
            risultato={kpiData.risultato}
            tariffaObiettivo={kpiData.tariffaObiettivo}
            tariffaAttuale={formData!.tariffaGiornaliera}
          />
        </div>
      )}

      {/* AI blocks */}
      {blocks.benchmark.stato === 'loading' ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary)]" />
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary)]"
              style={{ animationDelay: '0.3s' }}
            />
            <span
              className="h-2.5 w-2.5 animate-pulse rounded-full bg-[var(--primary)]"
              style={{ animationDelay: '0.6s' }}
            />
          </div>
          <p className="mt-4 text-sm text-[var(--muted)]">Analisi del tuo profilo in corso...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { block: blocks.benchmark, variant: 'default' as const },
            { block: blocks.analisi, variant: 'default' as const },
            { block: blocks.piano, variant: 'highlighted' as const },
          ].map(({ block, variant }, i) => (
            <div
              key={i}
              className="animate-[fadeSlideIn_0.5s_ease-out_both]"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <ResultBlock
                titolo={block.titolo}
                contenuto={block.contenuto}
                stato={block.stato}
                variant={variant}
              />
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 text-center">
        <Link
          href="/"
          className="inline-block cursor-pointer rounded-xl bg-blue-600 px-8 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
