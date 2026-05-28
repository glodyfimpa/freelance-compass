---
tipo: task
created: 2026-05-26
slug: task-6-api-route-streaming-app-api-analyze-route-ts
id: TASK-6
title: API Route streaming (app/api/analyze/route.ts)
status: Done
assignee: []
created_date: '2026-02-27 10:26'
updated_date: '2026-02-27 14:56'
labels:
  - backend
dependencies:
  - TASK-3
  - TASK-4
references:
  - PRD.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implementare la API route con ciclo TDD.

**TDD: scrivere i test PRIMA del codice.**

### Red (test first)
Creare app/api/analyze/__tests__/route.test.ts con:
- Richiesta valida ritorna streaming response
- Input invalido ritorna 400 con messaggio errore
- Calcolo netto viene eseguito server-side prima della chiamata AI
- ANTHROPIC_API_KEY mancante ritorna 500

### Green (minimum code)
1. Riceve FormData dal form
2. Esegue il calcolo netto deterministico (calculator.ts)
3. Costruisce il prompt con dati pre-calcolati (prompt.ts)
4. Chiama claude-sonnet-4-5 via Anthropic SDK con streaming
5. Ritorna la risposta in streaming al client

### Refactor
Clean up mantenendo i test verdi.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Chiamata Anthropic funzionante con streaming
- [x] #2 Calcolo netto eseguito server-side prima della chiamata AI
- [x] #3 Errori API gestiti con messaggio utente
- [x] #4 Test scritti PRIMA del codice di produzione
- [x] #5 Chiamata Anthropic funzionante con streaming
- [x] #6 Calcolo netto eseguito server-side prima della chiamata AI
- [x] #7 Errori API gestiti con messaggio utente
- [x] #8 Tutti i test passano
<!-- AC:END -->
