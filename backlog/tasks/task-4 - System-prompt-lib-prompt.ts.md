---
id: TASK-4
title: System prompt (lib/prompt.ts)
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
Costruire il system prompt per Claude e la funzione builder con ciclo TDD.

**TDD: scrivere i test PRIMA del codice.**

### Red (test first)
Creare lib/__tests__/prompt.test.ts con:
- buildUserMessage include i numeri pre-calcolati nel messaggio
- buildUserMessage include il profilo utente (ruolo, stack, anni, obiettivo)
- System prompt contiene la tabella benchmark per ogni ruolo/seniority
- System prompt contiene istruzioni per i 3 marcatori di sezione
- System prompt contiene istruzione di NON ricalcolare i numeri

### Green (minimum code)
- System prompt completo (gia definito nella pagina Notion)
- Funzione buildUserMessage(formData, calcoloNetto) -> string
- Marcatori: ## BENCHMARK DI MERCATO, ## ANALISI NETTO REALE, ## PIANO DI TRANSIZIONE

### Refactor
Clean up mantenendo i test verdi.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 System prompt include tabella benchmark per ruolo/seniority
- [x] #2 Builder inietta i numeri pre-calcolati nel messaggio utente
- [x] #3 Output usa i 3 marcatori di sezione definiti nel PRD
- [x] #4 Test scritti PRIMA del codice di produzione
- [x] #5 System prompt include tabella benchmark per ruolo/seniority
- [x] #6 Builder inietta i numeri pre-calcolati nel messaggio utente
- [x] #7 Output usa i 3 marcatori di sezione definiti nel PRD
- [x] #8 Tutti i test passano
<!-- AC:END -->

## Final Summary

<!-- SECTION:FINAL_SUMMARY:BEGIN -->
Implementato lib/prompt.ts con TDD black-box (27 test). SYSTEM_PROMPT: tabella benchmark 5 ruoli x 3 seniority, 3 marcatori di sezione (## BENCHMARK DI MERCATO, ## ANALISI NETTO REALE, ## PIANO DI TRANSIZIONE), istruzione non ricalcolare, disclaimer commercialista. buildUserMessage: inietta profilo utente e tutti i numeri pre-calcolati (attuale, obiettivo, delta, alternativo frontend). Helper formatCalcoloNetto per evitare duplicazione. Commit: 6b2eb72.
<!-- SECTION:FINAL_SUMMARY:END -->
