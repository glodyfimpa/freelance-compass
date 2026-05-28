---
tipo: task
created: 2026-05-26
slug: task-12-add-analyze-model-feature-flag-switch-default-to-haiku-4-5
id: TASK-12
title: Add ANALYZE_MODEL feature flag + switch default to Haiku 4.5
status: To Do
assignee: []
created_date: '2026-04-19 12:48'
labels:
  - ai-config
  - cost-optimization
  - performance
dependencies:
  - TASK-11
references:
  - lib/ai-config.ts
  - app/api/analyze/route.ts
  - .env.example
priority: high
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Introduce ANALYZE_MODEL env var to switch between Haiku 4.5 and Sonnet models without redeploy. Default switches from claude-sonnet-4-5-20250929 to claude-haiku-4-5-20251001. Rationale: the analyze endpoint does template-following on pre-calculated deterministic numbers (calculator.ts) + lookup on benchmark table in SYSTEM_PROMPT. This is a writer-with-good-taste task, not a reasoner task. Haiku 4.5 fits the pattern; ~5x cheaper and 2-3x faster. Env var keeps Sonnet fallback one setting away.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 ANALYZE_MODEL env var supported: accepts 'haiku', 'sonnet', or full model ID
- [ ] #2 Default model is claude-haiku-4-5-20251001 when env var unset or empty
- [ ] #3 Invalid env var value falls back to default with a console.warn, never crashes the route
- [ ] #4 ANALYZE_MAX_TOKENS env var supported with safe integer parsing, default 4096
- [ ] #5 .env.example documents both env vars with allowed values and defaults
- [ ] #6 route.test.ts covers: default path, ANALYZE_MODEL=sonnet path, invalid value path
- [ ] #7 README.md (or docs/) documents how to switch model in production
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. In lib/ai-config.ts extend getAnalyzeModelConfig():\n   - Read process.env.ANALYZE_MODEL\n   - Map 'haiku' -> 'claude-haiku-4-5-20251001', 'sonnet' -> 'claude-sonnet-4-6' (or latest stable), full IDs passed through\n   - Read process.env.ANALYZE_MAX_TOKENS with Number.parseInt + fallback\n   - Log warning on invalid values, never throw\n2. Add unit tests for the mapping function (new lib/__tests__/ai-config.test.ts)\n3. Update route.test.ts mocks to read config from lib/ai-config.ts\n4. Update .env.example with ANALYZE_MODEL and ANALYZE_MAX_TOKENS entries\n5. Add a short section in README or docs/ explaining the env var and when to switch
<!-- SECTION:PLAN:END -->
