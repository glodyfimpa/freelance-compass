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
    <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {/* Netto attuale */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-400">
          Netto annuo attuale
        </p>
        <p className="text-2xl font-bold text-gray-900">
          {formatEur(calcoloAttuale.netto)} <span className="text-base font-normal text-gray-400">EUR</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">
          {formatEur(tariffaAttuale)} EUR/giorno
        </p>
      </div>

      {/* Netto obiettivo */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-500">
          Netto annuo obiettivo
        </p>
        <p className="text-2xl font-bold text-blue-700">
          {formatEur(calcoloObiettivo.netto)} <span className="text-base font-normal text-blue-400">EUR</span>
        </p>
        <p className="mt-1 text-xs text-blue-400">
          {formatEur(tariffaObiettivo)} EUR/giorno
        </p>
      </div>

      {/* Delta */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-emerald-500">
          Potenziale guadagno
        </p>
        <p className="text-2xl font-bold text-emerald-700">
          +{formatEur(deltaNetto)} <span className="text-base font-normal text-emerald-400">EUR</span>
        </p>
        <p className="mt-1 text-xs text-emerald-500 font-medium">
          +{deltaPercent}% rispetto ad oggi
        </p>
      </div>
    </div>
  )
}
