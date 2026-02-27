import Anthropic from '@anthropic-ai/sdk'
import { calcolaNettoPerRuolo } from '@/lib/calculator'
import { SYSTEM_PROMPT, buildUserMessage } from '@/lib/prompt'
import { BENCHMARK, getSeniority } from '@/lib/benchmarks'
import type { FormData, Ruolo, RegimeFiscale, Obiettivo, CalcoloNettoResult } from '@/lib/types'

// --- Rate limiting (in-memory, per-instance) ---

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = { maxRequests: 10, windowMs: 3600_000 }

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT.windowMs })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT.maxRequests
}

// --- Benchmark lookup ---

function getTariffaObiettivo(ruolo: string, anni: number, tariffaAttuale: number): number {
  const seniority = getSeniority(anni)
  const [min, max] = BENCHMARK[ruolo]?.[seniority] ?? [200, 400]
  const midpoint = Math.round((min + max) / 2)
  return Math.max(midpoint, Math.round(tariffaAttuale * 1.1))
}

// --- Validation ---

const RUOLI_VALIDI: Ruolo[] = ['backend', 'frontend', 'fullstack', 'devops', 'data', 'altro']
const REGIMI_VALIDI: RegimeFiscale[] = ['forfettario5', 'forfettario15']
const OBIETTIVI_VALIDI: Obiettivo[] = ['aumentare-tariffa', 'trovare-clienti', 'uscire-body-rental', 'ottimizzare-netto']

function validateFormData(data: unknown): { valid: true; formData: FormData } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Il corpo della richiesta deve essere un oggetto JSON valido.' }
  }

  const d = data as Record<string, unknown>

  if (!d.ruolo || !RUOLI_VALIDI.includes(d.ruolo as Ruolo)) {
    return { valid: false, error: 'Campo "ruolo" mancante o non valido. Valori ammessi: ' + RUOLI_VALIDI.join(', ') }
  }

  if (typeof d.tariffaGiornaliera !== 'number' || d.tariffaGiornaliera <= 0) {
    return { valid: false, error: 'Campo "tariffaGiornaliera" deve essere un numero positivo.' }
  }

  if (typeof d.giorniFatturatiMese !== 'number' || d.giorniFatturatiMese <= 0) {
    return { valid: false, error: 'Campo "giorniFatturatiMese" deve essere un numero positivo.' }
  }

  if (!d.regime || !REGIMI_VALIDI.includes(d.regime as RegimeFiscale)) {
    return { valid: false, error: 'Campo "regime" mancante o non valido. Valori ammessi: ' + REGIMI_VALIDI.join(', ') }
  }

  if (typeof d.anniEsperienza !== 'number' || d.anniEsperienza < 0) {
    return { valid: false, error: 'Campo "anniEsperienza" deve essere un numero non negativo.' }
  }

  if (!d.obiettivo || !OBIETTIVI_VALIDI.includes(d.obiettivo as Obiettivo)) {
    return { valid: false, error: 'Campo "obiettivo" mancante o non valido.' }
  }

  if (d.atecoConosciuto && d.codiceAteco) {
    const atecoPattern = /^\d{2}\.\d{2}(\.\d{2})?$/
    if (typeof d.codiceAteco !== 'string' || !atecoPattern.test(d.codiceAteco)) {
      return { valid: false, error: 'Codice ATECO non valido. Formato atteso: XX.XX o XX.XX.XX' }
    }
  }

  const sanitizedStack = typeof d.stack === 'string' ? d.stack.slice(0, 50) : undefined

  return {
    valid: true,
    formData: {
      ruolo: d.ruolo as Ruolo,
      stack: sanitizedStack as FormData['stack'],
      anniEsperienza: d.anniEsperienza as number,
      tariffaGiornaliera: d.tariffaGiornaliera as number,
      regime: d.regime as RegimeFiscale,
      giorniFatturatiMese: d.giorniFatturatiMese as number,
      atecoConosciuto: Boolean(d.atecoConosciuto),
      codiceAteco: d.codiceAteco as string | undefined,
      obiettivo: d.obiettivo as Obiettivo,
    },
  }
}

// --- Build CalcoloNettoResult ---

function buildCalcoloNettoResult(formData: FormData): CalcoloNettoResult {
  const atecoManuale = formData.atecoConosciuto ? formData.codiceAteco : undefined

  const risultatoAttuale = calcolaNettoPerRuolo(
    formData.tariffaGiornaliera,
    formData.giorniFatturatiMese,
    formData.ruolo,
    formData.regime,
    atecoManuale,
  )

  const tariffaObiettivo = getTariffaObiettivo(
    formData.ruolo,
    formData.anniEsperienza,
    formData.tariffaGiornaliera,
  )

  const risultatoObiettivo = calcolaNettoPerRuolo(
    tariffaObiettivo,
    formData.giorniFatturatiMese,
    formData.ruolo,
    formData.regime,
    atecoManuale,
  )

  const deltaNetto = Math.round((risultatoObiettivo.primario.netto - risultatoAttuale.primario.netto) * 100) / 100

  return {
    calcoloAttuale: risultatoAttuale.primario,
    calcoloObiettivo: risultatoObiettivo.primario,
    deltaNetto,
    calcoloAlternativo: risultatoAttuale.alternativo,
  }
}

// --- Route handler ---

export async function POST(request: Request): Promise<Response> {
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(clientIp)) {
    return Response.json(
      { error: 'Troppe richieste. Riprova tra qualche minuto.' },
      { status: 429 },
    )
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: 'Servizio temporaneamente non disponibile.' },
      { status: 500 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json(
      { error: 'Corpo della richiesta non valido. Inviare JSON.' },
      { status: 400 },
    )
  }

  const validation = validateFormData(body)
  if (!validation.valid) {
    return Response.json({ error: validation.error }, { status: 400 })
  }

  const { formData } = validation

  const calcoloNetto = buildCalcoloNettoResult(formData)

  const userMessage = buildUserMessage(formData, calcoloNetto)

  const client = new Anthropic()

  let stream: ReturnType<typeof client.messages.stream>
  try {
    stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    })
  } catch {
    return Response.json({ error: 'Errore temporaneo del servizio di analisi. Riprova tra poco.' }, { status: 502 })
  }

  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    start(controller) {
      let closed = false
      stream.on('text', (text: string) => {
        if (!closed) controller.enqueue(encoder.encode(text))
      })
      stream.on('end', () => {
        if (!closed) { closed = true; controller.close() }
      })
      stream.on('error', (_error: Error) => {
        if (!closed) {
          closed = true
          controller.enqueue(encoder.encode('\n\n[Errore: servizio temporaneamente non disponibile.]'))
          controller.close()
        }
      })
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
