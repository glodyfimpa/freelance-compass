---
id: TASK-3
title: Calcolo netto deterministico (lib/calculator.ts)
status: Done
assignee: []
created_date: '2026-02-27 10:25'
updated_date: '2026-02-27 14:15'
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
- [x] #1 Golden path test: Backend, Java/Spring, 6y, 350/gg, 15%, 18gg -> netto 56.778,01
- [x] #2 Frontend senza ATECO ritorna due calcoli paralleli
- [x] #3 Coefficiente dedotto ha flag dedotto=true
- [x] #4 Test scritti PRIMA del codice di produzione
- [x] #5 Golden path test: Backend, Java/Spring, 6y, 350/gg, 15%, 18gg -> netto 56.778,01
- [x] #6 Frontend senza ATECO ritorna due calcoli paralleli
- [x] #7 Coefficiente dedotto ha flag dedotto=true
- [x] #8 Tutti i test passano
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementato lib/calculator.ts con TDD black-box (20 test). Funzioni: calcolaNettoForfettario (formula netto forfettario con round2 a ogni step), deduciCoefficienteATECO (deduzione ATECO per ruolo con lookup manuale), getAliquota, calcolaNettoPerRuolo (gestione caso frontend ambiguo con doppio calcolo 67%/78%). Golden path: netto 56777.97 (corretto rispetto al PRD che riportava 56778.01 per errore arrotondamento INPS). Commit: 6b2eb72.
<!-- SECTION:FINAL_SUMMARY:END -->
