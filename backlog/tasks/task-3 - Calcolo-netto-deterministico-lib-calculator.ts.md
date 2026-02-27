---
id: TASK-3
title: Calcolo netto deterministico (lib/calculator.ts)
status: To Do
assignee: []
created_date: '2026-02-27 10:25'
updated_date: '2026-02-27 10:57'
labels:
  - lib
dependencies:
  - TASK-2
references:
  - PRD.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare la formula del netto forfettario in TypeScript puro con ciclo TDD.

**TDD: scrivere i test PRIMA del codice.**

### Red (test first)
Creare lib/__tests__/calculator.test.ts con:
- Golden path: Backend, Java/Spring, 6y, 350/gg, 15%, 18gg, ATECO 62.20.10 -> netto 56.778,01
- Deduzione ATECO per ogni ruolo
- Frontend senza ATECO -> due calcoli paralleli (67% e 78%)
- Calcolo con aliquota 5%
- Edge case: valori ai limiti

### Green (minimum code)
Formula:
  redditoLordo = fatturato * coefficiente
  inps = redditoLordo * 0.2607
  imponibile = redditoLordo - inps
  imposta = imponibile * aliquota
  netto = fatturato - inps - imposta

Dove fatturato = tariffa * giorni * 12

Funzioni:
- calcolaNettoForfettario(tariffa, giorni, coefficiente, aliquota) -> CalcoloNetto
- deduciCoefficienteATECO(ruolo, atecoManuale?) -> InfoATECO
- Gestione caso Frontend ambiguo

### Refactor
Clean up mantenendo i test verdi.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Golden path test: Backend, Java/Spring, 6y, 350/gg, 15%, 18gg -> netto 56.778,01
- [ ] #2 Frontend senza ATECO ritorna due calcoli paralleli
- [ ] #3 Coefficiente dedotto ha flag dedotto=true
- [ ] #4 Test scritti PRIMA del codice di produzione
- [ ] #5 Golden path test: Backend, Java/Spring, 6y, 350/gg, 15%, 18gg -> netto 56.778,01
- [ ] #6 Frontend senza ATECO ritorna due calcoli paralleli
- [ ] #7 Coefficiente dedotto ha flag dedotto=true
- [ ] #8 Tutti i test passano
<!-- AC:END -->
