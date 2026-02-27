---
id: TASK-8
title: Integrazione end-to-end + golden path test
status: To Do
assignee: []
created_date: '2026-02-27 10:27'
labels:
  - integration
dependencies:
  - TASK-5
  - TASK-6
  - TASK-7
references:
  - PRD.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Collegare tutti i pezzi e validare il flusso completo.

1. Form submit -> calcolo netto -> API route -> streaming -> results page
2. Test con golden path del PRD:
   - Backend Developer, Java/Spring, 6y, 350/gg, forfettario 15%, 18gg, ATECO 62.20.10, aumentare tariffa
   - Verificare: netto 56.778,01, fascia senior 400-550, 3 azioni specifiche
3. Test casi edge:
   - Frontend senza ATECO (due calcoli paralleli)
   - Ruolo "Altro" (disclaimer)
   - Valori ai limiti della validazione
4. Fix bug emersi dall integrazione
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Golden path produce output corretto nei 3 blocchi
- [ ] #2 Frontend senza ATECO mostra due calcoli
- [ ] #3 Nessun errore in console
<!-- AC:END -->
