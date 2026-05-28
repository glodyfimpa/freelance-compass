---
tipo: resource
created: 2026-05-26
slug: 2026-02-28-ai-sdk-streaming-design
---

# AI SDK Streaming Migration

## Goal
Replace raw Anthropic SDK streaming with Vercel AI SDK (`streamText` + `useCompletion`) to get smoother text rendering on the three result cards.

## What changes

### Server: `app/api/analyze/route.ts`
- Replace `new Anthropic()` + `client.messages.stream()` + manual ReadableStream with `streamText()` from `ai` + `anthropic()` provider from `@ai-sdk/anthropic`
- Add `smoothStream({ chunking: 'word', delayInMs: 15 })` as `experimental_transform` for word-level buffering
- Return `result.toTextStreamResponse()` (plain text protocol, compatible with `useCompletion({ streamProtocol: 'text' })`)
- Keep: validation, rate limiting, `buildCalcoloNettoResult`, `buildUserMessage`, `SYSTEM_PROMPT`
- Remove: `@anthropic-ai/sdk` dependency

### Client: `app/results/page.tsx`
- Replace manual fetch loop (lines 137-181) with `useCompletion` hook from `ai/react`
- Pass FormData via `body` parameter to `complete()`
- Use `streamProtocol: 'text'` to match server plain text output
- Use `experimental_throttle: 50` to cap React renders at 20/sec
- Derive blocks: `parseStreamingBlocks(completion, !isLoading)` in useMemo

### Unchanged
- `lib/stream-parser.ts` (block splitting logic)
- `lib/calculator.ts`, `lib/benchmarks.ts` (deterministic math)
- `components/ResultBlock.tsx` (markdown rendering)
- `components/KpiCards.tsx` (instant KPI display)
- Sticky stacking cards behavior
- `rehype-sanitize` security

## Dependencies
- Add: `ai`, `@ai-sdk/anthropic`
- Remove: `@anthropic-ai/sdk`

## Test impact
- `route.test.ts`: update mock from `@anthropic-ai/sdk` to `ai` + `@ai-sdk/anthropic`. Verify same validation behavior, same model params, same calc integration.
- `stream-parser.test.ts`: no changes needed
- New: verify `toTextStreamResponse()` returns correct content-type

## Migration steps
1. Install deps (`ai`, `@ai-sdk/anthropic`), remove `@anthropic-ai/sdk`
2. Update `route.ts` server-side (TDD: update tests first)
3. Update `page.tsx` client-side (replace fetch loop with `useCompletion`)
4. Update CLAUDE.md constraint
5. Run full test suite, verify build
