---
tipo: task
created: 2026-05-26
slug: task-13-a-b-eval-haiku-4-5-vs-sonnet-on-3-real-profiles
id: TASK-13
title: 'A/B eval: Haiku 4.5 vs Sonnet on 3 real profiles'
status: To Do
assignee: []
created_date: '2026-04-19 12:50'
labels:
  - eval
  - ai-quality
  - decision-gate
dependencies:
  - TASK-12
references:
  - docs/evals/
  - lib/prompt.ts
priority: medium
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
After the flag lands, evaluate output quality empirically instead of guessing. Generate analyses for 3 representative freelance profiles using both models and compare on the 3 SYSTEM_PROMPT sections: BENCHMARK DI MERCATO, ANALISI NETTO REALE, PIANO DI TRANSIZIONE. Decide if Haiku 4.5 stays default or switch back to Sonnet. Non-negotiable gate before closing the feature flag story.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 3 profiles defined covering distinct obiettivi: uscire-body-rental (senior high day rate), aumentare-tariffa (mid junior), ottimizzare-netto (senior with regime switch question)
- [ ] #2 6 analyses generated (3 profiles x 2 models), saved under docs/evals/2026-04-ANALYZE_MODEL/ with raw markdown output
- [ ] #3 Each pair compared on 3 axes: numerical accuracy, specificity of PIANO DI TRANSIZIONE, tone adherence to SYSTEM_PROMPT
- [ ] #4 Decision recorded in backlog/decisions/ with rationale and links to eval outputs
- [ ] #5 If Sonnet wins: PR updates default ANALYZE_MODEL to 'sonnet' in lib/ai-config.ts. If Haiku wins: confirm default stays
<!-- AC:END -->

## Implementation Plan

<!-- SECTION:PLAN:BEGIN -->
1. Define 3 profiles in docs/evals/2026-04-ANALYZE_MODEL/profiles.md (ruolo, tariffa, obiettivo, regime, anni)\n2. Run analyze endpoint twice for each profile: once with ANALYZE_MODEL=haiku, once with =sonnet. Save output markdown per profile+model\n3. Read all 6 outputs side by side. For each pair score: numerical accuracy (are pre-calculated numbers used correctly?), PIANO specificity (generic vs obiettivo-calibrated?), tone (direct/numerical/concrete vs vague?)\n4. Write backlog/decisions/2026-04-analyze-model-choice.md with winner + rationale + cost/latency trade-off acknowledgment\n5. If decision = Sonnet, open PR to flip default in lib/ai-config.ts. If Haiku, close this task
<!-- SECTION:PLAN:END -->
