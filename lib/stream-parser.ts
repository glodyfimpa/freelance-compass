export const MARKERS = {
  BENCHMARK: '## BENCHMARK DI MERCATO',
  ANALISI: '## ANALISI NETTO REALE',
  PIANO: '## PIANO DI TRANSIZIONE',
} as const

export type BlockId = 'benchmark' | 'analisi' | 'piano'
export type BlockState = 'loading' | 'streaming' | 'complete'

export interface ParsedBlock {
  id: BlockId
  titolo: string
  contenuto: string
  stato: BlockState
}

export interface ParsedBlocks {
  benchmark: ParsedBlock
  analisi: ParsedBlock
  piano: ParsedBlock
}

const BLOCK_TITLES: Record<BlockId, string> = {
  benchmark: 'Benchmark di Mercato',
  analisi: 'Analisi Netto Reale',
  piano: 'Piano di Transizione',
}

export function parseStreamingBlocks(
  text: string,
  streamComplete: boolean,
): ParsedBlocks {
  const benchmarkIdx = text.indexOf(MARKERS.BENCHMARK)
  const analisiIdx = text.indexOf(MARKERS.ANALISI)
  const pianoIdx = text.indexOf(MARKERS.PIANO)

  let benchmarkContent = ''
  let analisiContent = ''
  let pianoContent = ''

  if (benchmarkIdx !== -1) {
    const contentStart = benchmarkIdx + MARKERS.BENCHMARK.length
    const contentEnd = analisiIdx !== -1 ? analisiIdx : text.length
    benchmarkContent = text.slice(contentStart, contentEnd).trim()
  }

  if (analisiIdx !== -1) {
    const contentStart = analisiIdx + MARKERS.ANALISI.length
    const contentEnd = pianoIdx !== -1 ? pianoIdx : text.length
    analisiContent = text.slice(contentStart, contentEnd).trim()
  }

  if (pianoIdx !== -1) {
    const contentStart = pianoIdx + MARKERS.PIANO.length
    pianoContent = text.slice(contentStart).trim()
  }

  function getBlockState(
    markerFound: boolean,
    nextMarkerFound: boolean,
    isLastBlock: boolean,
  ): BlockState {
    if (streamComplete) return 'complete'
    if (!markerFound) return 'loading'
    if (isLastBlock) return 'streaming'
    if (nextMarkerFound) return 'complete'
    return 'streaming'
  }

  return {
    benchmark: {
      id: 'benchmark',
      titolo: BLOCK_TITLES.benchmark,
      contenuto: benchmarkContent,
      stato: getBlockState(benchmarkIdx !== -1, analisiIdx !== -1, false),
    },
    analisi: {
      id: 'analisi',
      titolo: BLOCK_TITLES.analisi,
      contenuto: analisiContent,
      stato: getBlockState(analisiIdx !== -1, pianoIdx !== -1, false),
    },
    piano: {
      id: 'piano',
      titolo: BLOCK_TITLES.piano,
      contenuto: pianoContent,
      stato: getBlockState(pianoIdx !== -1, false, true),
    },
  }
}
