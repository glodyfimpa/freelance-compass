---
tipo: task
created: 2026-05-26
slug: task-10-migrate-streaming-to-vercel-ai-sdk-streamtext-usecompletion
id: TASK-10
title: Migrate streaming to Vercel AI SDK (streamText + useCompletion)
status: In Progress
assignee: []
created_date: '2026-02-28 14:45'
updated_date: '2026-02-28 15:10'
labels:
  - streaming
  - ux
  - ai-sdk
dependencies: []
references:
  - docs/plans/2026-02-28-ai-sdk-streaming-design.md
  - app/api/analyze/route.ts
  - app/results/page.tsx
  - lib/stream-parser.ts
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace raw Anthropic SDK streaming with Vercel AI SDK for smoother text rendering on the three result cards. Server: streamText() + smoothStream(word, 15ms) + toTextStreamResponse(). Client: useCompletion hook with streamProtocol: 'text' and experimental_throttle: 50. Design doc: docs/plans/2026-02-28-ai-sdk-streaming-design.md
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 streamText with @ai-sdk/anthropic replaces raw Anthropic SDK on server
- [ ] #2 smoothStream(word, 15ms) enabled for word-level buffering
- [ ] #3 useCompletion hook replaces manual fetch loop on client
- [ ] #4 experimental_throttle: 50 limits React renders to ~20/sec
- [x] #5 All existing tests pass (updated mocks)
- [x] #6 stream-parser.ts unchanged
- [x] #7 Build succeeds with zero TS errors
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
## Stato attuale (2026-02-28 16:10)

### Completato
- Server `route.ts` migrato: `streamText` da `ai` + `anthropic()` da `@ai-sdk/anthropic` + `toTextStreamResponse()`
- Rimosso `@anthropic-ai/sdk` (raw SDK)
- Test route aggiornati (14 test, mock di `streamText` e `anthropic`)
- Override Zod ^3.25.76 in package.json (Zod v4 rompe Turbopack)
- CLAUDE.md aggiornato (constraint, stack, architecture)

### Semplificato (revert)
- Rimosso `@ai-sdk/react` e `useCompletion` -- il client torna al fetch loop manuale originale
- Rimosso `smoothStream` -- era sperimentale, da rivalutare dopo test live

### Ancora da fare
- **Test live**: compilare form golden path e verificare streaming fluido sulle 3 card
- Se lo streaming non è fluido, valutare di riaggiungere `smoothStream` server-side (una riga)
- Opzionale: `@ai-sdk/react` con `useCompletion` + `experimental_throttle` per ridurre render client

### Dipendenze attuali
- `ai`: ^6.0.105
- `@ai-sdk/anthropic`: ^3.0.50
- Zod override: ^3.25.76

### Verifiche
- 156 test verdi, 0 errori TS, build OK
- Dev server gira su task ba456e6 (porta 3000)
- Playwright MCP disponibile (Chrome deve essere chiuso prima di lanciarlo)"
<!-- SECTION:NOTES:END -->
