'use client'

import type { CalcoloNettoResult } from '@/lib/types'

interface KpiCardsProps {
  risultato: CalcoloNettoResult
  tariffaObiettivo: number
  tariffaAttuale: number
}

function formatEur(value: number): string {
  return value.toLocaleString('it-IT', { maximumFractionDigits: 0 })
}

export default function KpiCards({ risultato, tariffaObiettivo, tariffaAttuale }: KpiCardsProps) {
  const { calcoloAttuale, calcoloObiettivo, deltaNetto } = risultato
  const deltaPercent = calcoloAttuale.netto > 0
    ? ((deltaNetto / calcoloAttuale.netto) * 100).toFixed(1)
    : '0'

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Netto attuale */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <p className="text-sm font-medium text-[var(--muted)] mb-3">
          Netto annuo attuale
        </p>
        <p className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          {formatEur(calcoloAttuale.netto)}
          <span className="ml-1 text-sm font-normal text-slate-400">EUR</span>
        </p>
        <p className="mt-2 text-sm text-slate-400">
          {formatEur(tariffaAttuale)} EUR/giorno
        </p>
      </div>

      {/* Netto obiettivo */}
      <div className="rounded-2xl bg-blue-50 p-6 shadow-sm border border-blue-100">
        <p className="text-sm font-medium text-[var(--primary)] mb-3">
          Netto annuo obiettivo
        </p>
        <p className="text-3xl font-bold tracking-tight text-[var(--primary)]">
          {formatEur(calcoloObiettivo.netto)}
          <span className="ml-1 text-sm font-normal text-blue-400">EUR</span>
        </p>
        <p className="mt-2 text-sm text-blue-400">
          {formatEur(tariffaObiettivo)} EUR/giorno
        </p>
      </div>

      {/* Delta */}
      <div className="rounded-2xl bg-emerald-50 p-6 shadow-sm border border-emerald-100">
        <p className="text-sm font-medium text-emerald-600 mb-3">
          Potenziale guadagno
        </p>
        <p className="text-3xl font-bold tracking-tight text-emerald-600">
          +{formatEur(deltaNetto)}
          <span className="ml-1 text-sm font-normal text-emerald-400">EUR</span>
        </p>
        <p className="mt-2 text-sm font-medium text-emerald-500">
          +{deltaPercent}% rispetto ad oggi
        </p>
      </div>
    </div>
  )
}
