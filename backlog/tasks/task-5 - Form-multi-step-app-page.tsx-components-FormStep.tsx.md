---
id: TASK-5
title: Form multi-step (app/page.tsx + components/FormStep.tsx)
status: To Do
assignee: []
created_date: '2026-02-27 10:25'
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
Costruire il form a 7 step con validazione.

Step:
1. Ruolo (dropdown) + Stack tecnologico (dropdown, opzionale)
2. Anni di esperienza (numerico, 0-50)
3. Tariffa giornaliera (numerico, 50-2000 euro)
4. Regime fiscale (radio: forfettario 5%, forfettario 15%)
5. Giorni fatturati/mese (numerico, 1-23)
6. Codice ATECO (toggle conosco/non lo so + campo libero condizionale)
7. Obiettivo principale (radio/select)

UX:
- Navigazione avanti/indietro tra step
- Validazione inline per campi numerici (min/max)
- Progress indicator
- Submit finale invia dati alla API route
- Mobile-friendly (Tailwind responsive)
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Tutti i 7 step navigabili avanti/indietro
- [ ] #2 Validazione min/max funzionante per campi numerici
- [ ] #3 Toggle ATECO mostra/nasconde campo libero
- [ ] #4 Submit invia FormData completo
<!-- AC:END -->
