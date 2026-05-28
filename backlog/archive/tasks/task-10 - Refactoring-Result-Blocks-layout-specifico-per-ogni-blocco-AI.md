---
tipo: task
created: 2026-05-26
slug: task-10-refactoring-result-blocks-layout-specifico-per-ogni-blocco-ai
id: TASK-10
title: 'Refactoring Result Blocks: layout specifico per ogni blocco AI'
status: To Do
assignee: []
created_date: '2026-02-28 10:26'
labels:
  - design
  - refactoring
  - ux
dependencies: []
references:
  - components/ResultBlock.tsx
  - app/results/page.tsx
  - lib/benchmarks.ts
  - components/KpiCards.tsx
  - lib/types.ts
  - design/screenshots/
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
## Context

Le 3 card risultato (Benchmark di Mercato, Analisi Netto Reale, Piano di Transizione) sono wall of text in card quasi identiche. Le KPI card sopra funzionano, ma i blocchi AI sotto restano generici e poco leggibili. Dalla ricerca competitor (Moneysida, Bonsai, Manfred) emergono pattern chiari: numeri grandi come hero, dati strutturati, differenziazione visiva tra sezioni.

## Competitor insights

- **Moneysida Salary Compass**: score/gauge circolare, card scura per benchmark con numero EUR grande + percentuale colorata, tag profilo, sfondo gradient
- **Bonsai Rates Explorer**: chart a colonne per distribuzione tariffe, filtri per ruolo/esperienza/location, visual hierarchy chart > FAQ
- **Manfred Salary Compass**: palette teal/purple, font serif per heading, grid responsive, benchmark con percentili
- **Pattern comune**: MAI wall of text. Numeri grandi come hero, dettagli sotto. Ogni sezione ha layout diverso.

## Cosa fare

Refactoring di `components/ResultBlock.tsx` e `app/results/page.tsx` per dare a ogni blocco un layout specifico:

1. **Block 1 (Benchmark di Mercato)**: visualizzazione posizione nella fascia (barra con indicatore "sei qui"), range min-max, tariffa obiettivo evidenziata
2. **Block 2 (Analisi Netto Reale)**: breakdown fiscale strutturato (fatturato -> INPS -> imposta -> netto), confronto attuale vs obiettivo side-by-side
3. **Block 3 (Piano di Transizione)**: timeline con step numerati, già evidenziato con bordo blu (mantenere)

**Approccio scelto**: Block 1 e 2 usano dati deterministici da `CalcoloNettoResult` (già disponibile client-side) con componenti visual custom. AI resta solo per Block 3 (piano di transizione, interpretazione qualitativa).

## File coinvolti

- `components/ResultBlock.tsx` -- refactor per supportare layout specifici per blocco
- `app/results/page.tsx` -- passare dati CalcoloNettoResult ai blocchi 1 e 2
- `lib/benchmarks.ts` -- dati range per la barra posizionamento (già esportati)
- `components/KpiCards.tsx` -- possibile merge/riuso con Block 1-2
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Block 1 mostra barra posizionamento con indicatore 'sei qui', range min-max, tariffa obiettivo evidenziata -- dati deterministici da CalcoloNettoResult, non AI
- [ ] #2 Block 2 mostra breakdown fiscale strutturato (fatturato -> INPS -> imposta -> netto) con confronto attuale vs obiettivo side-by-side -- dati deterministici
- [ ] #3 Block 3 mantiene layout timeline con step numerati e bordo blu -- contenuto AI streaming
- [ ] #4 Nessun wall of text: ogni blocco ha layout visivamente distinto
- [ ] #5 155 test continuano a passare
- [ ] #6 Screenshot Playwright di ogni blocco salvati in design/screenshots/tmp/
- [ ] #7 Confronto visivo con screenshot competitor in design/screenshots/
<!-- AC:END -->
