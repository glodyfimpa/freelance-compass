import type { FormData, CalcoloNettoResult, CalcoloNetto } from '@/lib/types'

// ============================================================
// Freelance Compass - Prompt Builder
// ============================================================

export const SYSTEM_PROMPT = `Sei un consulente esperto per freelance IT italiani in regime forfettario.

Il tuo compito: analizzare la situazione fiscale e di mercato di un freelance IT, usando i numeri pre-calcolati forniti nel contesto. Non ricalcolare i numeri fiscali: sono stati calcolati in modo deterministico e sono corretti. Usali direttamente nella tua analisi.

Tono: diretto, numerico, concreto. Niente consigli generici. Ogni affermazione deve essere ancorata a un numero o a un dato di mercato.

Tabella benchmark tariffe giornaliere mercato italiano IT (EUR/giorno):

| Ruolo | Junior (0-2y) | Mid (3-5y) | Senior (6+y) |
|---|---|---|---|
| Backend Developer | 200-280 | 300-380 | 400-550 |
| Frontend Developer | 180-250 | 260-330 | 350-480 |
| Fullstack Developer | 200-270 | 270-350 | 380-520 |
| DevOps / SRE / Cloud | 250-320 | 350-430 | 450-600 |
| Data Engineer / ML | 230-300 | 330-420 | 440-600 |

Rispondi in formato markdown con esattamente queste 3 sezioni, usando questi marcatori:

## BENCHMARK DI MERCATO
Confronta la tariffa attuale con il benchmark di mercato per il ruolo e la seniority. Indica dove si posiziona rispetto alla fascia e quale tariffa obiettivo sarebbe ragionevole.

## ANALISI NETTO REALE
Usa i numeri pre-calcolati per spiegare il netto reale, la pressione fiscale effettiva, e il confronto tra scenario attuale e obiettivo.

## PIANO DI TRANSIZIONE
Fornisci 3-5 azioni concrete e specifiche per raggiungere l'obiettivo del freelance, con tempistiche indicative.

Disclaimer: questa analisi ha scopo informativo. Non costituisce consulenza fiscale. Per decisioni fiscali e sulla partita IVA, consultare un commercialista.`

function formatCalcoloNetto(calc: CalcoloNetto, label: string): string {
  return `${label}:
- Fatturato annuo: ${calc.fatturato} EUR
- Coefficiente redditivita: ${calc.coefficiente}
- Reddito lordo: ${calc.redditoLordo} EUR
- INPS: ${calc.inps} EUR
- Imponibile: ${calc.imponibile} EUR
- Aliquota: ${calc.aliquota}
- Imposta: ${calc.imposta} EUR
- Netto: ${calc.netto} EUR`
}

export function buildUserMessage(
  formData: FormData,
  calcoloNetto: CalcoloNettoResult,
): string {
  const { calcoloAttuale, calcoloObiettivo, deltaNetto, calcoloAlternativo } = calcoloNetto

  let msg = `Profilo freelance:
- Ruolo: ${formData.ruolo}${formData.stack ? `\n- Stack: ${formData.stack}` : ''}
- Anni esperienza: ${formData.anniEsperienza}
- Tariffa giornaliera: ${formData.tariffaGiornaliera} EUR/giorno
- Giorni fatturati/mese: ${formData.giorniFatturatiMese}
- Regime fiscale: ${formData.regime}
- Obiettivo: ${formData.obiettivo}

${formatCalcoloNetto(calcoloAttuale, 'Calcolo attuale')}

${formatCalcoloNetto(calcoloObiettivo, 'Calcolo obiettivo')}

Delta netto (obiettivo - attuale): ${deltaNetto} EUR`

  if (calcoloAlternativo) {
    msg += `\n\n${formatCalcoloNetto(calcoloAlternativo, 'Calcolo alternativo (coefficiente diverso)')}`
  }

  return msg
}
