---
id: TASK-7
title: >-
  Pagina risultati con streaming (app/results/page.tsx +
  components/ResultBlock.tsx)
status: To Do
assignee: []
created_date: '2026-02-27 10:27'
labels:
  - frontend
dependencies:
  - TASK-1
  - TASK-2
references:
  - PRD.md
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Costruire la pagina risultati che:
1. Riceve la risposta streaming dalla API route
2. Splitta il markdown sui marcatori (## BENCHMARK DI MERCATO, ## ANALISI NETTO REALE, ## PIANO DI TRANSIZIONE)
3. Renderizza ogni blocco separatamente con rendering progressivo

UX streaming:
- Skeleton/placeholder per blocchi non ancora ricevuti
- Testo che appare progressivamente (effetto typewriter naturale)
- Ogni blocco si popola man mano che arriva il testo
- Markdown renderizzato (bold, tabelle, liste)

Componente ResultBlock:
- Titolo del blocco
- Contenuto markdown renderizzato
- Stato: loading/streaming/complete
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 3 blocchi renderizzati separatamente
- [ ] #2 Streaming progressivo visibile
- [ ] #3 Skeleton mostrato per blocchi non ancora ricevuti
- [ ] #4 Markdown renderizzato correttamente (bold, tabelle, liste)
<!-- AC:END -->
