import type { Ruolo, RegimeFiscale, InfoATECO, CalcoloNetto } from '@/lib/types'

const INPS_RATE = 0.2607

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

export function calcolaNettoForfettario(
  tariffa: number,
  giorni: number,
  coefficiente: number,
  aliquota: number,
  infoAteco: InfoATECO,
): CalcoloNetto {
  const fatturato = round2(tariffa * giorni * 12)
  const redditoLordo = round2(fatturato * coefficiente)
  const inps = round2(redditoLordo * INPS_RATE)
  const imponibile = round2(redditoLordo - inps)
  const imposta = round2(imponibile * aliquota)
  const netto = round2(fatturato - inps - imposta)

  return {
    fatturato,
    coefficiente,
    redditoLordo,
    inps,
    imponibile,
    aliquota,
    imposta,
    netto,
    infoAteco,
  }
}

export function deduciCoefficienteATECO(
  ruolo: Ruolo,
  atecoManuale?: string,
): InfoATECO {
  if (atecoManuale) {
    const coefficiente =
      atecoManuale.startsWith('70.') || atecoManuale.startsWith('74.')
        ? 0.78
        : 0.67
    return {
      codice: atecoManuale,
      coefficiente,
      dedotto: false,
      nota: `Codice ATECO fornito dall'utente: ${atecoManuale}`,
    }
  }

  const mappaCodici: Record<Ruolo, string> = {
    backend: '62.20.10',
    fullstack: '62.20.10',
    devops: '62.20.10',
    data: '62.20.10',
    frontend: '62.10.00',
    altro: '62.20.10',
  }

  const codice = mappaCodici[ruolo]
  const nota =
    ruolo === 'altro'
      ? 'Ruolo generico: codice ATECO assegnato per default — verificare con il proprio commercialista il codice corretto.'
      : `Codice ATECO dedotto dal ruolo "${ruolo}". Si consiglia di verificare con il proprio commercialista.`

  return {
    codice,
    coefficiente: 0.67,
    dedotto: true,
    nota,
  }
}

export function getAliquota(regime: RegimeFiscale): number {
  if (regime === 'forfettario5') return 0.05
  return 0.15
}

export function calcolaNettoPerRuolo(
  tariffa: number,
  giorni: number,
  ruolo: Ruolo,
  regime: RegimeFiscale,
  atecoManuale?: string,
): { primario: CalcoloNetto; alternativo?: CalcoloNetto } {
  const aliquota = getAliquota(regime)
  const infoPrimario = deduciCoefficienteATECO(ruolo, atecoManuale)
  const primario = calcolaNettoForfettario(tariffa, giorni, infoPrimario.coefficiente, aliquota, infoPrimario)

  if (ruolo === 'frontend' && !atecoManuale) {
    const infoAlternativo: InfoATECO = {
      codice: '74.12.01',
      coefficiente: 0.78,
      dedotto: true,
      nota: 'Codice ATECO alternativo per frontend (CMS/design). Si consiglia di verificare con il proprio commercialista.',
    }
    const alternativo = calcolaNettoForfettario(tariffa, giorni, infoAlternativo.coefficiente, aliquota, infoAlternativo)
    return { primario, alternativo }
  }

  return { primario }
}
