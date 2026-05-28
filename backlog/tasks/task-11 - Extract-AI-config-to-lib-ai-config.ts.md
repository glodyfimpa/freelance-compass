---
tipo: task
created: 2026-05-26
slug: task-11-extract-ai-config-to-lib-ai-config-ts
id: TASK-11
title: Extract AI config to lib/ai-config.ts
status: To Do
assignee: []
created_date: '2026-04-19 12:48'
labels:
  - refactor
  - ai-config
  - tech-debt
dependencies: []
references:
  - app/api/analyze/route.ts
  - app/api/analyze/__tests__/route.test.ts
  - lib/prompt.ts
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Extract hardcoded model name and max_tokens from app/api/analyze/route.ts into a dedicated lib/ai-config.ts module. Current hardcoded values are scattered between route.ts:166 and __tests__/route.test.ts:133-134, creating drift risk. The module exposes getAnalyzeModelConfig() that returns {model, maxTokens}, reading from env with safe defaults. Pure refactor: no behavior change.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 lib/ai-config.ts exists and exports getAnalyzeModelConfig(): {model: string, maxTokens: number}
- [ ] #2 route.ts imports config from lib/ai-config.ts, no hardcoded model/maxTokens remain
- [ ] #3 route.test.ts imports same config, no drift between runtime and tests
- [ ] #4 All 156 existing tests still pass
- [ ] #5 Zero TS errors, build succeeds
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Create lib/ai-config.ts with getAnalyzeModelConfig() returning {model: 'claude-sonnet-4-5-20250929', maxTokens: 4096} (preserve current behavior)\n2. Update route.ts:165-167 to use the imported config\n3. Update route.test.ts:133-134 to import and reuse the same config (single source of truth)\n4. Run npm test and npm run build to verify zero regression
<!-- SECTION:PLAN:END -->
