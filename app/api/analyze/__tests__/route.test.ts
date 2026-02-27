import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { FormData } from '@/lib/types'

const mockOn = vi.fn().mockReturnThis()
const mockStream = { on: mockOn }
const mockStreamFn = vi.fn().mockReturnValue(mockStream)

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { stream: mockStreamFn }
  },
}))

const validFormData: FormData = {
  ruolo: 'backend',
  stack: 'java-spring',
  anniEsperienza: 6,
  tariffaGiornaliera: 350,
  regime: 'forfettario15',
  giorniFatturatiMese: 18,
  atecoConosciuto: false,
  obiettivo: 'ottimizzare-netto',
}

function makeReq(body: unknown): Request {
  return new Request('http://localhost/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analyze', () => {
  const origApiKey = process.env.ANTHROPIC_API_KEY

  beforeEach(() => {
    vi.resetModules()
    mockStreamFn.mockClear()
    mockOn.mockClear().mockReturnThis()
    process.env.ANTHROPIC_API_KEY = 'test-key'
    mockOn.mockImplementation(function(this: typeof mockStream, ev: string, cb: (...a: unknown[]) => void) {
      if (ev === 'text') setTimeout(() => cb('response text'), 0)
      if (ev === 'end') setTimeout(() => cb(), 10)
      return this
    })
  })

  afterEach(() => {
    if (origApiKey !== undefined) {
      process.env.ANTHROPIC_API_KEY = origApiKey
    } else {
      delete process.env.ANTHROPIC_API_KEY
    }
    vi.restoreAllMocks()
  })

  it('valid request returns streaming response', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq(validFormData))
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('text/plain; charset=utf-8')
  })

  it('missing ruolo returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq({ ...validFormData, ruolo: undefined }))
    expect(res.status).toBe(400)
  })

  it('invalid ruolo returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq({ ...validFormData, ruolo: 'xyz' }))
    expect(res.status).toBe(400)
  })

  it('negative tariffa returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq({ ...validFormData, tariffaGiornaliera: -1 }))
    expect(res.status).toBe(400)
  })

  it('zero giorni returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq({ ...validFormData, giorniFatturatiMese: 0 }))
    expect(res.status).toBe(400)
  })

  it('invalid regime returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq({ ...validFormData, regime: 'ordinario' }))
    expect(res.status).toBe(400)
  })

  it('malformed JSON returns 400', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    const req = new Request('http://localhost/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad',
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('missing API key returns 500', async () => {
    delete process.env.ANTHROPIC_API_KEY
    const { POST } = await import('@/app/api/analyze/route')
    const res = await POST(makeReq(validFormData))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toContain('API_KEY')
  })

  it('runs calcolaNettoPerRuolo before AI call', async () => {
    const calc = await import('@/lib/calculator')
    const spy = vi.spyOn(calc, 'calcolaNettoPerRuolo')
    const { POST } = await import('@/app/api/analyze/route')
    await POST(makeReq(validFormData))
    expect(spy).toHaveBeenCalledWith(350, 18, 'backend', 'forfettario15', undefined)
  })

  it('passes codiceAteco when atecoConosciuto', async () => {
    const calc = await import('@/lib/calculator')
    const spy = vi.spyOn(calc, 'calcolaNettoPerRuolo')
    const { POST } = await import('@/app/api/analyze/route')
    await POST(makeReq({ ...validFormData, atecoConosciuto: true, codiceAteco: '62.20.10' }))
    expect(spy).toHaveBeenCalledWith(350, 18, 'backend', 'forfettario15', '62.20.10')
  })

  it('calls Anthropic with correct model and params', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    await POST(makeReq(validFormData))
    expect(mockStreamFn).toHaveBeenCalledWith(expect.objectContaining({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: expect.any(String),
      messages: [{ role: 'user', content: expect.stringContaining('backend') }],
    }))
  })

  it('user message contains benchmark target calculation', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    await POST(makeReq(validFormData))
    const call = mockStreamFn.mock.calls[0]?.[0]
    expect((call?.messages?.[0]?.content as string)).toContain('Calcolo obiettivo')
  })

  it('frontend without ATECO includes alternativo in message', async () => {
    const { POST } = await import('@/app/api/analyze/route')
    await POST(makeReq({
      ruolo: 'frontend',
      stack: 'react-vue-angular',
      anniEsperienza: 3,
      tariffaGiornaliera: 280,
      regime: 'forfettario5',
      giorniFatturatiMese: 20,
      atecoConosciuto: false,
      obiettivo: 'aumentare-tariffa',
    }))
    const call = mockStreamFn.mock.calls[0]?.[0]
    expect((call?.messages?.[0]?.content as string)).toContain('alternativo')
  })
})
