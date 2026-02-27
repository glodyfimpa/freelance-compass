import { describe, it, expect } from 'vitest'
import {
  calcolaNettoForfettario,
  deduciCoefficienteATECO,
  getAliquota,
  calcolaNettoPerRuolo,
} from '@/lib/calculator'
import type { InfoATECO } from '@/lib/types'

// --- calcolaNettoForfettario ---

describe('calcolaNettoForfettario', () => {
  const atecoBackend: InfoATECO = {
    codice: '62.20.10',
    coefficiente: 0.67,
    dedotto: false,
    nota: 'Codice ATECO fornito dall\'utente',
  }

  it('golden path: Backend 350/gg 18gg coeff 0.67 aliquota 15% -> netto 56777.97', () => {
    const result = calcolaNettoForfettario(350, 18, 0.67, 0.15, atecoBackend)

    expect(result.fatturato).toBe(75600)
    expect(result.coefficiente).toBe(0.67)
    expect(result.redditoLordo).toBe(50652)
    expect(result.inps).toBe(13204.98)
    expect(result.imponibile).toBe(37447.02)
    expect(result.aliquota).toBe(0.15)
    expect(result.imposta).toBe(5617.05)
    expect(result.netto).toBe(56777.97)
  })

  it('calcola con aliquota 5% (primi 5 anni)', () => {
    const result = calcolaNettoForfettario(350, 18, 0.67, 0.05, atecoBackend)

    expect(result.fatturato).toBe(75600)
    expect(result.aliquota).toBe(0.05)
    expect(result.imposta).toBe(1872.35)
    expect(result.netto).toBe(60522.67)
  })

  it('edge case: valori minimi (50/gg, 1 giorno/mese)', () => {
    const result = calcolaNettoForfettario(50, 1, 0.67, 0.05, atecoBackend)

    expect(result.fatturato).toBe(600)
    expect(result.netto).toBe(480.34)
  })

  it('include infoAteco nel risultato', () => {
    const result = calcolaNettoForfettario(350, 18, 0.67, 0.15, atecoBackend)

    expect(result.infoAteco).toEqual(atecoBackend)
  })

  it('coefficiente 0.78 produce netto inferiore rispetto a 0.67 (stessa tariffa)', () => {
    const ateco78: InfoATECO = {
      codice: '74.12.01',
      coefficiente: 0.78,
      dedotto: true,
      nota: 'test',
    }

    const calc67 = calcolaNettoForfettario(300, 20, 0.67, 0.15, atecoBackend)
    const calc78 = calcolaNettoForfettario(300, 20, 0.78, 0.15, ateco78)

    expect(calc67.fatturato).toBe(calc78.fatturato)
    expect(calc67.netto).toBeGreaterThan(calc78.netto)
    expect(calc67.netto).toBe(54074.26)
    expect(calc78.netto).toBe(51131.23)
  })
})

// --- deduciCoefficienteATECO ---

describe('deduciCoefficienteATECO', () => {
  it('backend senza ATECO -> 62.20.10, coefficiente 0.67, dedotto=true', () => {
    const info = deduciCoefficienteATECO('backend')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
  })

  it('fullstack senza ATECO -> 62.20.10, coefficiente 0.67, dedotto=true', () => {
    const info = deduciCoefficienteATECO('fullstack')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
  })

  it('devops senza ATECO -> 62.20.10, coefficiente 0.67, dedotto=true', () => {
    const info = deduciCoefficienteATECO('devops')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
  })

  it('data senza ATECO -> 62.20.10, coefficiente 0.67, dedotto=true', () => {
    const info = deduciCoefficienteATECO('data')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
  })

  it('frontend senza ATECO -> 62.10.00, coefficiente 0.67 (caso primario)', () => {
    const info = deduciCoefficienteATECO('frontend')

    expect(info.codice).toBe('62.10.00')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
  })

  it('altro senza ATECO -> 62.20.10, coefficiente 0.67 con nota di verifica', () => {
    const info = deduciCoefficienteATECO('altro')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(true)
    expect(info.nota).toContain('verificare')
  })

  it('ATECO manuale 62.20.10 -> coefficiente 0.67, dedotto=false', () => {
    const info = deduciCoefficienteATECO('backend', '62.20.10')

    expect(info.codice).toBe('62.20.10')
    expect(info.coefficiente).toBe(0.67)
    expect(info.dedotto).toBe(false)
  })

  it('ATECO manuale 70.22.09 -> coefficiente 0.78, dedotto=false', () => {
    const info = deduciCoefficienteATECO('backend', '70.22.09')

    expect(info.codice).toBe('70.22.09')
    expect(info.coefficiente).toBe(0.78)
    expect(info.dedotto).toBe(false)
  })

  it('nota per coefficiente dedotto contiene "commercialista"', () => {
    const info = deduciCoefficienteATECO('backend')

    expect(info.nota).toContain('commercialista')
  })
})

// --- getAliquota ---

describe('getAliquota', () => {
  it('forfettario5 -> 0.05', () => {
    expect(getAliquota('forfettario5')).toBe(0.05)
  })

  it('forfettario15 -> 0.15', () => {
    expect(getAliquota('forfettario15')).toBe(0.15)
  })
})

// --- calcolaNettoPerRuolo (frontend ambiguo) ---

describe('calcolaNettoPerRuolo', () => {
  it('backend con ATECO manuale -> solo calcolo primario, no alternativo', () => {
    const result = calcolaNettoPerRuolo(350, 18, 'backend', 'forfettario15', '62.20.10')

    expect(result.primario.netto).toBe(56777.97)
    expect(result.alternativo).toBeUndefined()
  })

  it('frontend senza ATECO ritorna due calcoli paralleli (67% e 78%)', () => {
    const result = calcolaNettoPerRuolo(300, 20, 'frontend', 'forfettario15')

    expect(result.primario.coefficiente).toBe(0.67)
    expect(result.primario.netto).toBe(54074.26)

    expect(result.alternativo).toBeDefined()
    expect(result.alternativo!.coefficiente).toBe(0.78)
    expect(result.alternativo!.netto).toBe(51131.23)
  })

  it('frontend con ATECO manuale -> solo calcolo primario, no alternativo', () => {
    const result = calcolaNettoPerRuolo(300, 20, 'frontend', 'forfettario15', '62.10.00')

    expect(result.primario).toBeDefined()
    expect(result.alternativo).toBeUndefined()
  })

  it('backend senza ATECO -> coefficiente dedotto, no alternativo', () => {
    const result = calcolaNettoPerRuolo(350, 18, 'backend', 'forfettario15')

    expect(result.primario.infoAteco.dedotto).toBe(true)
    expect(result.alternativo).toBeUndefined()
  })
})
