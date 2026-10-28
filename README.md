# Freelance Compass

**English** · [Italiano](README.it.md)

AI advisor for Italian freelance developers under the *regime forfettario* (Italy's flat-tax
scheme for sole traders). You fill in a 7-step form (role, stack, years of experience, daily
rate, goal, and more) and get three blocks back:

- **Market benchmark**: where your daily rate sits for your role and seniority.
- **Real net income**: what you actually keep after INPS contributions and the flat tax.
- **Transition plan**: concrete steps to raise your rate or move to value-based consulting.

The app UI and the generated analysis are in Italian.

## How it works

The code does the tax math and the model does the analysis, so the model never invents the numbers.

```
Form (7 steps) → lib/calculator.ts (deterministic math)
               → /api/analyze → Claude (streaming) → results page (3 blocks)
```

- `lib/calculator.ts` computes the net income: ATECO coefficient (67% or 78%), INPS *gestione
  separata* at 26.07%, flat tax at 5% for the first 5 years and 15% after, 85,000 € revenue cap.
  Every intermediate step is rounded to the cent.
- `lib/prompt.ts` hands Claude the pre-computed figures: the model explains them, it does not
  recompute them.
- When the ATECO coefficient is ambiguous (e.g. a frontend role without a known code), the
  calculator returns both scenarios.

## Stack

Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS 4, Anthropic SDK.
Tested with Vitest and Testing Library, written test-first: 155 tests covering the calculator,
the prompt builder, the streaming parser, the API route and the form.

## Run locally

Requires Node 20.9+ and an Anthropic API key.

```bash
npm install
echo "ANTHROPIC_API_KEY=..." > .env.local
npm run dev
```

Other commands: `npm test`, `npm run lint`, `npm run build`.

## Scope

Covers the *regime forfettario* only, not the ordinary tax regime. The figures are a guide for
thinking about your rate, not tax advice.
