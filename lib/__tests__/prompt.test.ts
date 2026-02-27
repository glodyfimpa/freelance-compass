import { describe, it, expect } from 'vitest'
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/prompt'
import type { FormData, CalcoloNetto, CalcoloNettoResult, InfoATECO } from '@/lib/types'

const atecoBackend: InfoATECO = {
  codice: '62.20.10',
  coefficiente: 0.67,
  dedotto: true,
  nota: 'Codice ATECO dedotto: consulenza informatica. Verifica con il tuo commercialista.',
}

const atecoFrontendPrimario: InfoATECO = {
  codice: '62.10.00',
  coefficiente: 0.67,
  dedotto: true,
  nota: 'Codice ATECO dedotto per frontend. Verifica con il tuo commercialista.',
}

const atecoFrontendAlternativo: InfoATECO = {
  codice: '74.10.21',
  coefficiente: 0.78,
  dedotto: true,
  nota: 'Codice ATECO alternativo per frontend (web design). Verifica con il tuo commercialista.',
}

const goldenPathFormData: FormData = {
  ruolo: 'backend',
  stack: 'java-spring',
  anniEsperienza: 6,
  tariffaGiornaliera: 350,
  regime: 'forfettario15',
  giorniFatturatiMese: 18,
  atecoConosciuto: false,
  obiettivo: 'ottimizzare-netto',
}

const goldenPathCalcoloAttuale: CalcoloNetto = {
  fatturato: 75600,
  coefficiente: 0.67,
  redditoLordo: 50652,
  inps: 13204.98,
  imponibile: 37447.02,
  aliquota: 0.15,
  imposta: 5617.05,
  netto: 56777.97,
  infoAteco: atecoBackend,
}

const goldenPathCalcoloObiettivo: CalcoloNetto = {
  fatturato: 86400,
  coefficiente: 0.67,
  redditoLordo: 57888,
  inps: 15091.62,
  imponibile: 42796.38,
  aliquota: 0.15,
  imposta: 6419.46,
  netto: 64888.92,
  infoAteco: atecoBackend,
}

const goldenPathResult: CalcoloNettoResult = {
  calcoloAttuale: goldenPathCalcoloAttuale,
  calcoloObiettivo: goldenPathCalcoloObiettivo,
  deltaNetto: 8110.95,
}

const frontendFormData: FormData = {
  ruolo: 'frontend',
  stack: 'react-vue-angular',
  anniEsperienza: 3,
  tariffaGiornaliera: 280,
  regime: 'forfettario5',
  giorniFatturatiMese: 20,
  atecoConosciuto: false,
  obiettivo: 'aumentare-tariffa',
}

const frontendCalcoloAttuale: CalcoloNetto = {
  fatturato: 67200,
  coefficiente: 0.67,
  redditoLordo: 45024,
  inps: 11738.76,
  imponibile: 33285.24,
  aliquota: 0.05,
  imposta: 1664.26,
  netto: 53796.98,
  infoAteco: atecoFrontendPrimario,
}

const frontendCalcoloObiettivo: CalcoloNetto = {
  fatturato: 79200,
  coefficiente: 0.67,
  redditoLordo: 53064,
  inps: 13833.78,
  imponibile: 39230.22,
  aliquota: 0.05,
  imposta: 1961.51,
  netto: 63404.71,
  infoAteco: atecoFrontendPrimario,
}

const frontendCalcoloAlternativo: CalcoloNetto = {
  fatturato: 67200,
  coefficiente: 0.78,
  redditoLordo: 52416,
  inps: 13664.85,
  imponibile: 38751.15,
  aliquota: 0.05,
  imposta: 1937.56,
  netto: 51597.59,
  infoAteco: atecoFrontendAlternativo,
}

const frontendResult: CalcoloNettoResult = {
  calcoloAttuale: frontendCalcoloAttuale,
  calcoloObiettivo: frontendCalcoloObiettivo,
  deltaNetto: 9607.73,
  calcoloAlternativo: frontendCalcoloAlternativo,
}

describe('SYSTEM_PROMPT', () => {
  it('contiene tabella benchmark Backend Developer', () => {
    expect(SYSTEM_PROMPT).toContain('Backend Developer')
    expect(SYSTEM_PROMPT).toContain('200-280')
    expect(SYSTEM_PROMPT).toContain('300-380')
    expect(SYSTEM_PROMPT).toContain('400-550')
  })

  it('contiene tabella benchmark Frontend Developer', () => {
    expect(SYSTEM_PROMPT).toContain('Frontend Developer')
    expect(SYSTEM_PROMPT).toContain('180-250')
    expect(SYSTEM_PROMPT).toContain('260-330')
    expect(SYSTEM_PROMPT).toContain('350-480')
  })

  it('contiene tabella benchmark Fullstack Developer', () => {
    expect(SYSTEM_PROMPT).toContain('Fullstack Developer')
    expect(SYSTEM_PROMPT).toContain('200-270')
    expect(SYSTEM_PROMPT).toContain('270-350')
    expect(SYSTEM_PROMPT).toContain('380-520')
  })

  it('contiene tabella benchmark DevOps', () => {
    expect(SYSTEM_PROMPT).toContain('DevOps')
    expect(SYSTEM_PROMPT).toContain('250-320')
    expect(SYSTEM_PROMPT).toContain('350-430')
    expect(SYSTEM_PROMPT).toContain('450-600')
  })

  it('contiene tabella benchmark Data Engineer', () => {
    expect(SYSTEM_PROMPT).toContain('Data Engineer')
    expect(SYSTEM_PROMPT).toContain('230-300')
    expect(SYSTEM_PROMPT).toContain('330-420')
    expect(SYSTEM_PROMPT).toContain('440-600')
  })

  it('contiene i 3 marcatori di sezione', () => {
    expect(SYSTEM_PROMPT).toContain('## BENCHMARK DI MERCATO')
    expect(SYSTEM_PROMPT).toContain('## ANALISI NETTO REALE')
    expect(SYSTEM_PROMPT).toContain('## PIANO DI TRANSIZIONE')
  })

  it('contiene istruzione non ricalcolare', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('non ricalcolare')
  })

  it('contiene disclaimer commercialista', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toContain('commercialista')
  })

  it('contiene istruzione markdown', () => {
    expect(SYSTEM_PROMPT.toLowerCase()).toMatch(/markdown/)
  })
})

describe('buildUserMessage', () => {
  it('include netto pre-calcolato', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('56777.97')
  })

  it('include fatturato', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('75600')
  })

  it('include ruolo utente', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('backend')
  })

  it('include anni esperienza', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('6')
  })

  it('include obiettivo', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('ottimizzare-netto')
  })

  it('include tariffa giornaliera', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('350')
  })

  it('include regime fiscale', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('forfettario15')
  })

  it('include importo INPS', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('13204.98')
  })

  it('include stack tecnologico', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('java-spring')
  })

  it('include giorni fatturati', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('18')
  })

  it('include reddito lordo', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('50652')
  })

  it('include imposta', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('5617.05')
  })

  it('include coefficiente redditivita', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('0.67')
  })

  it('include deltaNetto', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('8110.95')
  })

  it('include dati calcolo obiettivo', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).toContain('86400')
    expect(msg).toContain('64888.92')
  })

  it('include calcolo alternativo quando presente', () => {
    const msg = buildUserMessage(frontendFormData, frontendResult)
    expect(msg).toContain('0.78')
    expect(msg).toContain('51597.59')
  })

  it('non include alternativo quando assente', () => {
    const msg = buildUserMessage(goldenPathFormData, goldenPathResult)
    expect(msg).not.toContain('51597.59')
  })

  it('gestisce formData senza stack', () => {
    const formDataSenzaStack: FormData = {
      ...goldenPathFormData,
      stack: undefined,
    }
    const msg = buildUserMessage(formDataSenzaStack, goldenPathResult)
    expect(msg).toContain('backend')
    expect(msg).toContain('56777.97')
  })
})
