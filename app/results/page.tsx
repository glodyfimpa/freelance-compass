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
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          La tua analisi
        </h1>
        <p className="mt-2 text-sm text-gray-400">
          {streamComplete
            ? 'Analisi completata.'
            : 'Analisi in corso...'}
        </p>
      </header>

      {formData && <ProfileBadges formData={formData} />}

      {kpiData && (
        <KpiCards
          risultato={kpiData.risultato}
          tariffaObiettivo={kpiData.tariffaObiettivo}
          tariffaAttuale={formData!.tariffaGiornaliera}
        />
      )}

      <div className="space-y-6">
        <ResultBlock
          titolo={blocks.benchmark.titolo}
          contenuto={blocks.benchmark.contenuto}
          stato={blocks.benchmark.stato}
        />
        <ResultBlock
          titolo={blocks.analisi.titolo}
          contenuto={blocks.analisi.contenuto}
          stato={blocks.analisi.stato}
        />
        <ResultBlock
          titolo={blocks.piano.titolo}
          contenuto={blocks.piano.contenuto}
          stato={blocks.piano.stato}
          variant="highlighted"
        />
      </div>

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
