'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import type { FormData } from '@/lib/types'
import { parseStreamingBlocks } from '@/lib/stream-parser'
import type { ParsedBlocks } from '@/lib/stream-parser'
import ResultBlock from '@/components/ResultBlock'

function ResultsContent() {
  const [blocks, setBlocks] = useState<ParsedBlocks>(() =>
    parseStreamingBlocks('', false),
  )
  const [errore, setErrore] = useState<string | null>(null)
  const [streamComplete, setStreamComplete] = useState(false)

  const fetchAnalisi = useCallback(async (formData: FormData) => {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
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
      const formData: FormData = JSON.parse(raw)
      fetchAnalisi(formData)
    } catch {
      setErrore('Dati del form non validi. Torna alla pagina principale per compilare il form.')
    }
  }, [fetchAnalisi])

  if (errore) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
          <p className="text-red-700 dark:text-red-300">{errore}</p>
          <Link
            href="/"
            className="mt-4 inline-block rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            Nuova analisi
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">
          La tua analisi
        </h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {streamComplete
            ? 'Analisi completata.'
            : 'Analisi in corso...'}
        </p>
      </header>

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
        />
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/"
          className="inline-block rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
