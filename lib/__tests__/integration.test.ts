import { describe, it, expect } from 'vitest'
import { calcolaNettoPerRuolo, getAliquota, deduciCoefficienteATECO } from '@/lib/calculator'
import { buildUserMessage, SYSTEM_PROMPT } from '@/lib/prompt'
import type { FormData, CalcoloNettoResult } from '@/lib/types'

// ============================================================
// Integration Tests: end-to-end data flow validation
// FormData -> calculator -> CalcoloNettoResult -> prompt builder
// ============================================================

// --- Helper: replicates buildCalcoloNettoResult from route.ts ---

const BENCHMARK: Record<string, Record<string, [number, number]>> = {
  backend:   { junior: [200, 280], mid: [300, 380], senior: [400, 550] },
  frontend:  { junior: [180, 250], mid: [260, 330], senior: [350, 480] },
  fullstack: { junior: [200, 270], mid: [270, 350], senior: [380, 520] },
  devops:    { junior: [250, 320], mid: [350, 430], senior: [450, 600] },
  data:      { junior: [230, 300], mid: [330, 420], senior: [440, 600] },
  altro:     { junior: [200, 280], mid: [300, 380], senior: [400, 550] },
}

function getSeniority(anni: number): string {
  if (anni <= 2) return 'junior'
  if (anni <= 5) return 'mid'
  return 'senior'
}

function getTariffaObiettivo(ruolo: string, anni: number, tariffaAttuale: number): number {
  const seniority = getSeniority(anni)
  const [min, max] = BENCHMARK[ruolo]?.[seniority] ?? [200, 400]
  const midpoint = Math.round((min + max) / 2)
  return Math.max(midpoint, Math.round(tariffaAttuale * 1.1))
}

function buildCalcoloNettoResult(formData: FormData): CalcoloNettoResult {
  const atecoManuale = formData.atecoConosciuto ? formData.codiceAteco : undefined

  const risultatoAttuale = calcolaNettoPerRuolo(
    formData.tariffaGiornaliera,
    formData.giorniFatturatiMese,
    formData.ruolo,
    formData.regime,
    atecoManuale,
  )

  const tariffaObiettivo = getTariffaObiettivo(
    formData.ruolo,
    formData.anniEsperienza,
    formData.tariffaGiornaliera,
  )

  const risultatoObiettivo = calcolaNettoPerRuolo(
    tariffaObiettivo,
    formData.giorniFatturatiMese,
    formData.ruolo,
    formData.regime,
    atecoManuale,
  )

  const deltaNetto = Math.round((risultatoObiettivo.primario.netto - risultatoAttuale.primario.netto) * 100) / 100

  return {
    calcoloAttuale: risultatoAttuale.primario,
    calcoloObiettivo: risultatoObiettivo.primario,
    deltaNetto,
    calcoloAlternativo: risultatoAttuale.alternativo,
  }
}

// ============================================================
// Golden Path: Backend Developer, Java/Spring, 6y, 350/gg,
//   forfettario 15%, 18gg, ATECO 62.20.10, aumentare tariffa
// ============================================================

describe('Golden Path: Backend Developer end-to-end', () => {
  const goldenFormData: FormData = {
    ruolo: 'backend',
    stack: 'java-spring',
    anniEsperienza: 6,
    tariffaGiornaliera: 350,
    regime: 'forfettario15',
    giorniFatturatiMese: 18,
    atecoConosciuto: true,
    codiceAteco: '62.20.10',
    obiettivo: 'aumentare-tariffa',
  }

  it('calculator produces exact golden path netto values', () => {
    const result = buildCalcoloNettoResult(goldenFormData)

    // Step-by-step verification from PRD
    expect(result.calcoloAttuale.fatturato).toBe(75600)        // 350 * 18 * 12
    expect(result.calcoloAttuale.coefficiente).toBe(0.67)
    expect(result.calcoloAttuale.redditoLordo).toBe(50652)     // 75600 * 0.67
    expect(result.calcoloAttuale.inps).toBe(13204.98)          // 50652 * 0.2607
    expect(result.calcoloAttuale.imponibile).toBe(37447.02)    // 50652 - 13204.98
    expect(result.calcoloAttuale.aliquota).toBe(0.15)
    expect(result.calcoloAttuale.imposta).toBe(5617.05)        // 37447.02 * 0.15
    expect(result.calcoloAttuale.netto).toBe(56777.97)         // 75600 - 13204.98 - 5617.05
  })

  it('ATECO info is correct for manual code 62.20.10', () => {
    const result = buildCalcoloNettoResult(goldenFormData)

    expect(result.calcoloAttuale.infoAteco.codice).toBe('62.20.10')
    expect(result.calcoloAttuale.infoAteco.coefficiente).toBe(0.67)
    expect(result.calcoloAttuale.infoAteco.dedotto).toBe(false) // manual ATECO
  })

  it('no alternative calculation for backend with manual ATECO', () => {
    const result = buildCalcoloNettoResult(goldenFormData)

    expect(result.calcoloAlternativo).toBeUndefined()
  })

  it('seniority band is senior for 6 years experience', () => {
    const seniority = getSeniority(goldenFormData.anniEsperienza)
    expect(seniority).toBe('senior')
  })

  it('target rate is derived from senior backend benchmark (400-550)', () => {
    const tariffaObiettivo = getTariffaObiettivo('backend', 6, 350)
    const midpoint = Math.round((400 + 550) / 2) // 475
    expect(tariffaObiettivo).toBe(midpoint)
  })

  it('objective calculation uses target rate with same fiscal params', () => {
    const result = buildCalcoloNettoResult(goldenFormData)
    const tariffaObiettivo = getTariffaObiettivo('backend', 6, 350) // 475

    expect(result.calcoloObiettivo.fatturato).toBe(tariffaObiettivo * 18 * 12)
    expect(result.calcoloObiettivo.coefficiente).toBe(0.67)
    expect(result.calcoloObiettivo.aliquota).toBe(0.15)
  })

  it('deltaNetto is positive (objective netto > current netto)', () => {
    const result = buildCalcoloNettoResult(goldenFormData)

    expect(result.deltaNetto).toBeGreaterThan(0)
    expect(result.deltaNetto).toBe(
      Math.round((result.calcoloObiettivo.netto - result.calcoloAttuale.netto) * 100) / 100,
    )
  })

  it('prompt builder receives and embeds all pre-calculated golden path values', () => {
    const result = buildCalcoloNettoResult(goldenFormData)
    const msg = buildUserMessage(goldenFormData, result)

    // Profile fields
    expect(msg).toContain('backend')
    expect(msg).toContain('java-spring')
    expect(msg).toContain('6')
    expect(msg).toContain('350')
    expect(msg).toContain('18')
    expect(msg).toContain('forfettario15')
    expect(msg).toContain('aumentare-tariffa')

    // Current calculation
    expect(msg).toContain('75600')
    expect(msg).toContain('56777.97')
    expect(msg).toContain('13204.98')
    expect(msg).toContain('5617.05')
    expect(msg).toContain('50652')
    expect(msg).toContain('37447.02')

    // Objective calculation
    expect(msg).toContain('Calcolo obiettivo')
    expect(msg).toContain(String(result.calcoloObiettivo.netto))

    // Delta
    expect(msg).toContain(String(result.deltaNetto))
  })

  it('system prompt contains the 3 required section markers', () => {
    expect(SYSTEM_PROMPT).toContain('## BENCHMARK DI MERCATO')
    expect(SYSTEM_PROMPT).toContain('## ANALISI NETTO REALE')
    expect(SYSTEM_PROMPT).toContain('## PIANO DI TRANSIZIONE')
  })

  it('system prompt benchmark table shows Senior Backend 400-550', () => {
    expect(SYSTEM_PROMPT).toContain('400-550')
    expect(SYSTEM_PROMPT).toContain('Backend Developer')
  })
})

// ============================================================
// Golden Path without manual ATECO (atecoConosciuto = false)
// Backend should deduce 62.20.10, coeff 0.67
// ============================================================

describe('Golden Path: Backend without manual ATECO', () => {
  const formData: FormData = {
    ruolo: 'backend',
    stack: 'java-spring',
    anniEsperienza: 6,
    tariffaGiornaliera: 350,
    regime: 'forfettario15',
    giorniFatturatiMese: 18,
    atecoConosciuto: false,
    obiettivo: 'aumentare-tariffa',
  }

  it('produces same netto as manual ATECO 62.20.10', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.netto).toBe(56777.97)
    expect(result.calcoloAttuale.infoAteco.coefficiente).toBe(0.67)
  })

  it('deduces ATECO code to 62.20.10 with dedotto=true', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.infoAteco.codice).toBe('62.20.10')
    expect(result.calcoloAttuale.infoAteco.dedotto).toBe(true)
  })

  it('no alternative calculation for backend', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAlternativo).toBeUndefined()
  })
})

// ============================================================
// Frontend Developer without ATECO -> two parallel calculations
// ============================================================

describe('Frontend Developer without ATECO: dual calculation', () => {
  const formData: FormData = {
    ruolo: 'frontend',
    stack: 'react-vue-angular',
    anniEsperienza: 3,
    tariffaGiornaliera: 300,
    regime: 'forfettario15',
    giorniFatturatiMese: 20,
    atecoConosciuto: false,
    obiettivo: 'aumentare-tariffa',
  }

  it('produces primary calculation with coefficiente 0.67', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.coefficiente).toBe(0.67)
    expect(result.calcoloAttuale.infoAteco.codice).toBe('62.10.00')
  })

  it('produces alternative calculation with coefficiente 0.78', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAlternativo).toBeDefined()
    expect(result.calcoloAlternativo!.coefficiente).toBe(0.78)
    expect(result.calcoloAlternativo!.infoAteco.codice).toBe('74.12.01')
  })

  it('alternative netto is lower than primary (higher coefficient = more tax base)', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.netto).toBeGreaterThan(result.calcoloAlternativo!.netto)
  })

  it('both calculations have same fatturato', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.fatturato).toBe(result.calcoloAlternativo!.fatturato)
  })

  it('prompt includes alternative calculation with 0.78 coefficient', () => {
    const result = buildCalcoloNettoResult(formData)
    const msg = buildUserMessage(formData, result)

    expect(msg).toContain('alternativo')
    expect(msg).toContain('0.78')
    expect(msg).toContain(String(result.calcoloAlternativo!.netto))
  })

  it('frontend with manual ATECO does NOT produce alternative', () => {
    const formDataWithAteco: FormData = {
      ...formData,
      atecoConosciuto: true,
      codiceAteco: '62.10.00',
    }
    const result = buildCalcoloNettoResult(formDataWithAteco)

    expect(result.calcoloAlternativo).toBeUndefined()
  })
})

// ============================================================
// Ruolo "Altro": uses default 0.67 with disclaimer
// ============================================================

describe('Ruolo "Altro": default coefficient with disclaimer', () => {
  const formData: FormData = {
    ruolo: 'altro',
    anniEsperienza: 4,
    tariffaGiornaliera: 400,
    regime: 'forfettario15',
    giorniFatturatiMese: 15,
    atecoConosciuto: false,
    obiettivo: 'ottimizzare-netto',
  }

  it('uses coefficiente 0.67 as default', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.coefficiente).toBe(0.67)
  })

  it('deduces ATECO 62.20.10 with disclaimer nota', () => {
    const result = buildCalcoloNettoResult(formData)
    const info = result.calcoloAttuale.infoAteco

    expect(info.codice).toBe('62.20.10')
    expect(info.dedotto).toBe(true)
    expect(info.nota).toContain('verificare')
    expect(info.nota).toContain('commercialista')
  })

  it('no alternative calculation for "altro"', () => {
    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAlternativo).toBeUndefined()
  })

  it('calculation values are correct', () => {
    const result = buildCalcoloNettoResult(formData)

    // 400 * 15 * 12 = 72000
    expect(result.calcoloAttuale.fatturato).toBe(72000)
    // 72000 * 0.67 = 48240
    expect(result.calcoloAttuale.redditoLordo).toBe(48240)
  })
})

// ============================================================
// Edge cases: validation boundaries
// ============================================================

describe('Edge cases: boundary values', () => {
  it('minimum valid inputs: tariffa 50, 1 giorno, 0 anni esperienza', () => {
    const formData: FormData = {
      ruolo: 'backend',
      anniEsperienza: 0,
      tariffaGiornaliera: 50,
      regime: 'forfettario5',
      giorniFatturatiMese: 1,
      atecoConosciuto: false,
      obiettivo: 'trovare-clienti',
    }

    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.fatturato).toBe(600) // 50 * 1 * 12
    expect(result.calcoloAttuale.netto).toBeGreaterThan(0)
    expect(result.calcoloAttuale.aliquota).toBe(0.05)
  })

  it('maximum valid inputs: tariffa 2000, 23 giorni, 50 anni esperienza', () => {
    const formData: FormData = {
      ruolo: 'devops',
      anniEsperienza: 50,
      tariffaGiornaliera: 2000,
      regime: 'forfettario15',
      giorniFatturatiMese: 23,
      atecoConosciuto: false,
      obiettivo: 'uscire-body-rental',
    }

    const result = buildCalcoloNettoResult(formData)

    expect(result.calcoloAttuale.fatturato).toBe(552000) // 2000 * 23 * 12
    expect(result.calcoloAttuale.netto).toBeGreaterThan(0)
    expect(result.calcoloAttuale.netto).toBeLessThan(result.calcoloAttuale.fatturato)
  })

  it('forfettario5 produces lower tax than forfettario15 (same inputs)', () => {
    const base: FormData = {
      ruolo: 'fullstack',
      anniEsperienza: 3,
      tariffaGiornaliera: 300,
      regime: 'forfettario5',
      giorniFatturatiMese: 20,
      atecoConosciuto: false,
      obiettivo: 'ottimizzare-netto',
    }

    const result5 = buildCalcoloNettoResult(base)
    const result15 = buildCalcoloNettoResult({ ...base, regime: 'forfettario15' })

    expect(result5.calcoloAttuale.netto).toBeGreaterThan(result15.calcoloAttuale.netto)
    expect(result5.calcoloAttuale.imposta).toBeLessThan(result15.calcoloAttuale.imposta)
  })

  it('junior seniority (0-2 years) assigned correctly', () => {
    expect(getSeniority(0)).toBe('junior')
    expect(getSeniority(1)).toBe('junior')
    expect(getSeniority(2)).toBe('junior')
  })

  it('mid seniority (3-5 years) assigned correctly', () => {
    expect(getSeniority(3)).toBe('mid')
    expect(getSeniority(4)).toBe('mid')
    expect(getSeniority(5)).toBe('mid')
  })

  it('senior seniority (6+ years) assigned correctly', () => {
    expect(getSeniority(6)).toBe('senior')
    expect(getSeniority(10)).toBe('senior')
    expect(getSeniority(50)).toBe('senior')
  })
})

// ============================================================
// Target rate logic: ensure objective uses correct benchmark
// ============================================================

describe('Target rate derivation from benchmark', () => {
  it('uses benchmark midpoint when it exceeds 110% of current rate', () => {
    // Backend senior: [400, 550], midpoint = 475
    // 350 * 1.1 = 385 -> midpoint (475) wins
    const target = getTariffaObiettivo('backend', 6, 350)
    expect(target).toBe(475)
  })

  it('uses 110% of current rate when it exceeds benchmark midpoint', () => {
    // Backend senior: [400, 550], midpoint = 475
    // 500 * 1.1 = 550 -> 550 > 475, so 550 wins
    const target = getTariffaObiettivo('backend', 6, 500)
    expect(target).toBe(550)
  })

  it('uses correct benchmark for each ruolo and seniority', () => {
    expect(getTariffaObiettivo('frontend', 1, 100)).toBe(215)   // junior [180,250], mid=215
    expect(getTariffaObiettivo('devops', 4, 100)).toBe(390)     // mid [350,430], mid=390
    expect(getTariffaObiettivo('data', 8, 100)).toBe(520)       // senior [440,600], mid=520
  })

  it('"altro" role falls back to backend benchmark', () => {
    const altroTarget = getTariffaObiettivo('altro', 6, 350)
    const backendTarget = getTariffaObiettivo('backend', 6, 350)
    expect(altroTarget).toBe(backendTarget)
  })
})

// ============================================================
// ATECO with prefix 70.x and 74.x -> coefficient 0.78
// ============================================================

describe('ATECO prefix rules for coefficient', () => {
  it('ATECO 70.22.09 returns coefficient 0.78', () => {
    const info = deduciCoefficienteATECO('backend', '70.22.09')
    expect(info.coefficiente).toBe(0.78)
  })

  it('ATECO 74.10.21 returns coefficient 0.78', () => {
    const info = deduciCoefficienteATECO('backend', '74.10.21')
    expect(info.coefficiente).toBe(0.78)
  })

  it('ATECO 62.20.10 returns coefficient 0.67', () => {
    const info = deduciCoefficienteATECO('backend', '62.20.10')
    expect(info.coefficiente).toBe(0.67)
  })

  it('manual ATECO 70.x produces lower netto in full pipeline', () => {
    const formData67: FormData = {
      ruolo: 'backend',
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: 'forfettario15',
      giorniFatturatiMese: 18,
      atecoConosciuto: true,
      codiceAteco: '62.20.10',
      obiettivo: 'aumentare-tariffa',
    }

    const formData78: FormData = {
      ...formData67,
      codiceAteco: '70.22.09',
    }

    const result67 = buildCalcoloNettoResult(formData67)
    const result78 = buildCalcoloNettoResult(formData78)

    expect(result67.calcoloAttuale.netto).toBeGreaterThan(result78.calcoloAttuale.netto)
  })
})

// ============================================================
// Aliquota integration
// ============================================================

describe('Aliquota maps correctly through the pipeline', () => {
  it('getAliquota forfettario5 returns 0.05', () => {
    expect(getAliquota('forfettario5')).toBe(0.05)
  })

  it('getAliquota forfettario15 returns 0.15', () => {
    expect(getAliquota('forfettario15')).toBe(0.15)
  })

  it('aliquota is embedded correctly in CalcoloNetto result', () => {
    const formData5: FormData = {
      ruolo: 'backend',
      anniEsperienza: 2,
      tariffaGiornaliera: 250,
      regime: 'forfettario5',
      giorniFatturatiMese: 20,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData5)
    expect(result.calcoloAttuale.aliquota).toBe(0.05)
    expect(result.calcoloObiettivo.aliquota).toBe(0.05)
  })
})

// ============================================================
// Prompt builder receives correct structure from calculator
// ============================================================

describe('Prompt builder receives correct structure', () => {
  it('buildUserMessage does not throw for any valid ruolo', () => {
    const ruoli = ['backend', 'frontend', 'fullstack', 'devops', 'data', 'altro'] as const

    for (const ruolo of ruoli) {
      const formData: FormData = {
        ruolo,
        anniEsperienza: 5,
        tariffaGiornaliera: 300,
        regime: 'forfettario15',
        giorniFatturatiMese: 20,
        atecoConosciuto: false,
        obiettivo: 'aumentare-tariffa',
      }

      const result = buildCalcoloNettoResult(formData)
      const msg = buildUserMessage(formData, result)

      expect(msg).toContain(ruolo)
      expect(msg).toContain('Calcolo attuale')
      expect(msg).toContain('Calcolo obiettivo')
      expect(msg).toContain('Delta netto')
    }
  })

  it('prompt message includes all CalcoloNetto fields', () => {
    const formData: FormData = {
      ruolo: 'backend',
      stack: 'java-spring',
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: 'forfettario15',
      giorniFatturatiMese: 18,
      atecoConosciuto: true,
      codiceAteco: '62.20.10',
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    const msg = buildUserMessage(formData, result)

    // Verify all CalcoloNetto fields appear for current calculation
    expect(msg).toContain('Fatturato annuo')
    expect(msg).toContain('Coefficiente redditivita')
    expect(msg).toContain('Reddito lordo')
    expect(msg).toContain('INPS')
    expect(msg).toContain('Imponibile')
    expect(msg).toContain('Aliquota')
    expect(msg).toContain('Imposta')
    expect(msg).toContain('Netto')
  })

  it('message without stack omits stack line', () => {
    const formData: FormData = {
      ruolo: 'backend',
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: 'forfettario15',
      giorniFatturatiMese: 18,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    const msg = buildUserMessage(formData, result)

    expect(msg).not.toContain('Stack:')
  })

  it('message with stack includes stack line', () => {
    const formData: FormData = {
      ruolo: 'backend',
      stack: 'java-spring',
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: 'forfettario15',
      giorniFatturatiMese: 18,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    const msg = buildUserMessage(formData, result)

    expect(msg).toContain('Stack: java-spring')
  })
})

// ============================================================
// Financial rounding consistency
// ============================================================

describe('Financial rounding consistency across pipeline', () => {
  it('all intermediate values in CalcoloNetto are rounded to 2 decimals', () => {
    const formData: FormData = {
      ruolo: 'backend',
      anniEsperienza: 7,
      tariffaGiornaliera: 333,
      regime: 'forfettario15',
      giorniFatturatiMese: 17,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    const calc = result.calcoloAttuale

    function isRounded2(n: number): boolean {
      return n === Math.round(n * 100) / 100
    }

    expect(isRounded2(calc.fatturato)).toBe(true)
    expect(isRounded2(calc.redditoLordo)).toBe(true)
    expect(isRounded2(calc.inps)).toBe(true)
    expect(isRounded2(calc.imponibile)).toBe(true)
    expect(isRounded2(calc.imposta)).toBe(true)
    expect(isRounded2(calc.netto)).toBe(true)
  })

  it('netto = fatturato - inps - imposta (accounting identity)', () => {
    const formData: FormData = {
      ruolo: 'data',
      anniEsperienza: 4,
      tariffaGiornaliera: 420,
      regime: 'forfettario5',
      giorniFatturatiMese: 19,
      atecoConosciuto: false,
      obiettivo: 'ottimizzare-netto',
    }

    const result = buildCalcoloNettoResult(formData)
    const calc = result.calcoloAttuale
    const expectedNetto = Math.round((calc.fatturato - calc.inps - calc.imposta) * 100) / 100

    expect(calc.netto).toBe(expectedNetto)
  })

  it('deltaNetto is rounded to 2 decimals', () => {
    const formData: FormData = {
      ruolo: 'fullstack',
      anniEsperienza: 3,
      tariffaGiornaliera: 277,
      regime: 'forfettario15',
      giorniFatturatiMese: 21,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    const isRounded = result.deltaNetto === Math.round(result.deltaNetto * 100) / 100

    expect(isRounded).toBe(true)
  })
})

// ============================================================
// All ruoli: full pipeline smoke tests
// ============================================================

describe('Full pipeline smoke test for all ruoli', () => {
  const ruoli = ['backend', 'frontend', 'fullstack', 'devops', 'data', 'altro'] as const

  for (const ruolo of ruoli) {
    it(`${ruolo}: produces valid CalcoloNettoResult and prompt message`, () => {
      const formData: FormData = {
        ruolo,
        anniEsperienza: 5,
        tariffaGiornaliera: 350,
        regime: 'forfettario15',
        giorniFatturatiMese: 20,
        atecoConosciuto: false,
        obiettivo: 'aumentare-tariffa',
      }

      const result = buildCalcoloNettoResult(formData)

      // Structural assertions
      expect(result.calcoloAttuale).toBeDefined()
      expect(result.calcoloObiettivo).toBeDefined()
      expect(typeof result.deltaNetto).toBe('number')
      expect(result.calcoloAttuale.fatturato).toBe(350 * 20 * 12) // 84000

      // Only frontend without ATECO has alternative
      if (ruolo === 'frontend') {
        expect(result.calcoloAlternativo).toBeDefined()
      } else {
        expect(result.calcoloAlternativo).toBeUndefined()
      }

      // Prompt builder does not throw
      const msg = buildUserMessage(formData, result)
      expect(msg.length).toBeGreaterThan(0)
    })
  }
})

// ============================================================
// Revenue cap awareness (informational - no blocking logic yet)
// ============================================================

describe('Revenue cap check: fatturato vs 85000 EUR', () => {
  it('golden path fatturato 75600 is under 85000 cap', () => {
    const formData: FormData = {
      ruolo: 'backend',
      anniEsperienza: 6,
      tariffaGiornaliera: 350,
      regime: 'forfettario15',
      giorniFatturatiMese: 18,
      atecoConosciuto: true,
      codiceAteco: '62.20.10',
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    expect(result.calcoloAttuale.fatturato).toBeLessThan(85000)
  })

  it('high rate scenario can exceed 85000 cap', () => {
    const formData: FormData = {
      ruolo: 'devops',
      anniEsperienza: 10,
      tariffaGiornaliera: 500,
      regime: 'forfettario15',
      giorniFatturatiMese: 20,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }

    const result = buildCalcoloNettoResult(formData)
    // 500 * 20 * 12 = 120000
    expect(result.calcoloAttuale.fatturato).toBe(120000)
    expect(result.calcoloAttuale.fatturato).toBeGreaterThan(85000)
  })
})
