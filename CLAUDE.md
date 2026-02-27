# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

**Requires Node >=20.9.0** (project uses Node 22 via nvm). If bash commands fail with Node version errors, prefix with `source ~/.nvm/nvm.sh && nvm use 22 &&`.

```bash
npm run dev          # Start dev server (Next.js)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint (flat config, core-web-vitals + typescript)
npm test             # Run tests (vitest)
npm run test:watch   # Watch mode
npx tsc --noEmit     # Type-check without emitting
```

Test config: `vitest.config.ts` with jsdom environment. Test files: `**/__tests__/*.test.ts`. Path alias `@/*` resolved in vitest config.

Golden path test scenario defined in PRD.md (backend dev, Java/Spring, 6y experience, 350/gg, forfettario 15%).

## Development Methodology: TDD (Black-Box)

Every feature MUST follow the TDD cycle: Red → Green → Refactor.

1. **Red:** Write tests FIRST that describe WHAT the code should do (inputs → expected outputs). Focus on behavior, not implementation details.
2. **Green:** Write the minimum code to make tests pass.
3. **Refactor:** Clean up while keeping tests green.

Rules:
- Tests describe behavior (what), never implementation (how).
- Test public interfaces, not internal methods.
- No production code without a failing test first.
- Golden path test from PRD is the first test for `lib/calculator.ts`.

## Architecture

**Core principle: deterministic math in TypeScript, interpretive analysis in AI.**

Fiscal calculations (INPS, imposta sostitutiva, netto) are pure arithmetic in `lib/calculator.ts` to prevent LLM hallucination on financial data. Claude receives pre-calculated numbers and handles subjective analysis: market benchmarking, narrative presentation, and personalized action plans.

### Data Flow

```
Form (7 steps) → lib/calculator.ts (deterministic) → /api/analyze (API route)
  → claude-sonnet-4-5 (streaming) → Results page (3 blocks split by ## markers)
```

### Key Files

- `lib/types.ts` - All TypeScript types/interfaces (FormData, CalcoloNetto, CalcoloNettoResult, AnalysisRequest). Domain types use Italian naming.
- `lib/calculator.ts` - Deterministic net income formula for regime forfettario. ATECO code deduction logic lives here. Exports: `calcolaNettoForfettario`, `deduciCoefficienteATECO`, `getAliquota`, `calcolaNettoPerRuolo`.
- `lib/prompt.ts` - System prompt builder for Claude. Embeds pre-calculated numbers into the prompt context. Exports: `SYSTEM_PROMPT`, `buildUserMessage`.
- `app/page.tsx` - Multi-step form (7 steps, 8 fields)
- `app/results/page.tsx` - Streaming results display, splits Claude response on `## BENCHMARK DI MERCATO`, `## ANALISI NETTO REALE`, `## PIANO DI TRANSIZIONE` markers
- `app/api/analyze/route.ts` - API route: runs calculator, calls Anthropic SDK with streaming
- `components/FormStep.tsx` - Form step component
- `components/ResultBlock.tsx` - Individual result block renderer

### Domain Rules

- Only regime forfettario (5% first 5 years, 15% after). No regime ordinario.
- ATECO coefficient is either 0.67 or 0.78 depending on role/activity type.
- Frontend Developer without known ATECO is ambiguous: must calculate both 67% and 78% scenarios.
- INPS gestione separata rate: 26.07% (2025 circular).
- Revenue cap for forfettario: 85,000 EUR/year.
- Seniority bands derived from years of experience: 0-2 junior, 3-5 mid, 6+ senior.
- Financial rounding: `Math.round(value * 100) / 100` at each intermediate step (fatturato, redditoLordo, inps, imponibile, imposta, netto).

### Path Alias

`@/*` maps to project root (configured in tsconfig.json). Use `@/lib/types` not `../../lib/types`.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript 5 (strict mode)
- Tailwind CSS v4 (via `@tailwindcss/postcss`)
- Anthropic SDK with `claude-sonnet-4-5` (streaming)
- Deploy target: Vercel (stateless, no auth, no persistence)

## Conventions

- Domain types and variables use **Italian naming** (e.g., `tariffaGiornaliera`, `RegimeFiscale`, `CalcoloNetto`).
- UI text is in Italian.
- ESLint uses flat config format (`eslint.config.mjs`) with Next.js core-web-vitals and TypeScript presets.
- Fonts: Geist Sans + Geist Mono (Google Fonts via `next/font`).
- No design system: Tailwind defaults only.
- Git on this machine is old: use `git branch` not `git branch --show-current`.

<!-- BACKLOG.MD MCP GUIDELINES START -->

<CRITICAL_INSTRUCTION>

## BACKLOG WORKFLOW INSTRUCTIONS

This project uses Backlog.md MCP for all task and project management activities.

**CRITICAL GUIDANCE**

- If your client supports MCP resources, read `backlog://workflow/overview` to understand when and how to use Backlog for this project.
- If your client only supports tools or the above request fails, call `backlog.get_workflow_overview()` tool to load the tool-oriented overview (it lists the matching guide tools).

- **First time working here?** Read the overview resource IMMEDIATELY to learn the workflow
- **Already familiar?** You should have the overview cached ("## Backlog.md Overview (MCP)")
- **When to read it**: BEFORE creating tasks, or when you're unsure whether to track work

These guides cover:
- Decision framework for when to create tasks
- Search-first workflow to avoid duplicates
- Links to detailed guides for task creation, execution, and finalization
- MCP tools reference

You MUST read the overview resource to understand the complete workflow. The information is NOT summarized here.

</CRITICAL_INSTRUCTION>

<!-- BACKLOG.MD MCP GUIDELINES END -->
