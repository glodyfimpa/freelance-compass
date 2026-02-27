---
id: TASK-2
title: Tipi TypeScript (lib/types.ts)
status: Done
assignee: []
created_date: '2026-02-27 10:24'
updated_date: '2026-02-27 11:06'
labels:
  - lib
dependencies: []
references:
  - PRD.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Definire tutti i tipi TypeScript per il progetto.

Include:
- FormData: tutti i campi del form (ruolo, stack, anni, tariffa, regime, giorni, ateco, obiettivo)
- Enum per Ruolo, Stack, RegimeFiscale, Obiettivo
- CalcoloNetto: output del calculator (fatturato, redditoLordo, inps, imponibile, imposta, netto)
- AnalysisRequest: payload per la API route
- Tipi per la risposta streaming (blocchi di output)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tutti i campi del form hanno un tipo
- [ ] #2 CalcoloNetto include tutti i passaggi intermedi della formula
- [ ] #3 Nessun any nel codice
<!-- AC:END -->
