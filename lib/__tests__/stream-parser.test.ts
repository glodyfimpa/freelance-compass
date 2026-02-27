import { describe, it, expect } from 'vitest'
import { parseStreamingBlocks, MARKERS } from '@/lib/stream-parser'

describe('parseStreamingBlocks', () => {
  describe('block states', () => {
    it('returns all blocks as loading when text is empty', () => {
      const result = parseStreamingBlocks('', false)

      expect(result.benchmark.stato).toBe('loading')
      expect(result.analisi.stato).toBe('loading')
      expect(result.piano.stato).toBe('loading')
    })

    it('returns all blocks as loading when text has no markers', () => {
      const result = parseStreamingBlocks('Some preamble text', false)

      expect(result.benchmark.stato).toBe('loading')
      expect(result.analisi.stato).toBe('loading')
      expect(result.piano.stato).toBe('loading')
    })

    it('marks benchmark as streaming when only first marker appears', () => {
      const text = `${MARKERS.BENCHMARK}\nSome benchmark content`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.stato).toBe('streaming')
      expect(result.analisi.stato).toBe('loading')
      expect(result.piano.stato).toBe('loading')
    })

    it('marks benchmark as complete and analisi as streaming when second marker appears', () => {
      const text = `${MARKERS.BENCHMARK}\nBenchmark content\n\n${MARKERS.ANALISI}\nAnalisi content`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('streaming')
      expect(result.piano.stato).toBe('loading')
    })

    it('marks benchmark and analisi as complete, piano as streaming when third marker appears', () => {
      const text = `${MARKERS.BENCHMARK}\nBenchmark\n\n${MARKERS.ANALISI}\nAnalisi\n\n${MARKERS.PIANO}\nPiano`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('complete')
      expect(result.piano.stato).toBe('streaming')
    })

    it('marks all blocks as complete when stream is complete', () => {
      const text = `${MARKERS.BENCHMARK}\nBenchmark\n\n${MARKERS.ANALISI}\nAnalisi\n\n${MARKERS.PIANO}\nPiano`
      const result = parseStreamingBlocks(text, true)

      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('complete')
      expect(result.piano.stato).toBe('complete')
    })

    it('marks partially received blocks as complete when stream ends', () => {
      const text = `${MARKERS.BENCHMARK}\nOnly benchmark`
      const result = parseStreamingBlocks(text, true)

      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('complete')
      expect(result.piano.stato).toBe('complete')
    })
  })

  describe('content extraction', () => {
    it('extracts content between first and second markers', () => {
      const text = `${MARKERS.BENCHMARK}\nBenchmark content here\n\n${MARKERS.ANALISI}\nAnalisi`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.contenuto).toBe('Benchmark content here')
    })

    it('extracts content between second and third markers', () => {
      const text = `${MARKERS.BENCHMARK}\nB\n\n${MARKERS.ANALISI}\nAnalisi content here\n\n${MARKERS.PIANO}\nP`
      const result = parseStreamingBlocks(text, false)

      expect(result.analisi.contenuto).toBe('Analisi content here')
    })

    it('extracts content after third marker until end of text', () => {
      const text = `${MARKERS.BENCHMARK}\nB\n\n${MARKERS.ANALISI}\nA\n\n${MARKERS.PIANO}\nPiano content here`
      const result = parseStreamingBlocks(text, false)

      expect(result.piano.contenuto).toBe('Piano content here')
    })

    it('returns empty content for blocks whose markers have not appeared', () => {
      const text = `${MARKERS.BENCHMARK}\nBenchmark only`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.contenuto).toBe('Benchmark only')
      expect(result.analisi.contenuto).toBe('')
      expect(result.piano.contenuto).toBe('')
    })

    it('ignores preamble text before first marker', () => {
      const text = `Some preamble\n\n${MARKERS.BENCHMARK}\nBenchmark content`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.contenuto).toBe('Benchmark content')
    })

    it('trims whitespace from extracted content', () => {
      const text = `${MARKERS.BENCHMARK}\n\n  Benchmark with spaces  \n\n${MARKERS.ANALISI}\nA`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.contenuto).toBe('Benchmark with spaces')
    })

    it('handles multiline content with markdown formatting', () => {
      const content = `Contenuto con **bold** e lista:\n- Item 1\n- Item 2\n\n| Col1 | Col2 |\n|---|---|\n| A | B |`
      const text = `${MARKERS.BENCHMARK}\n${content}\n\n${MARKERS.ANALISI}\nA`
      const result = parseStreamingBlocks(text, false)

      expect(result.benchmark.contenuto).toBe(content)
    })
  })

  describe('block titles', () => {
    it('assigns correct Italian titles to each block', () => {
      const result = parseStreamingBlocks('', false)

      expect(result.benchmark.titolo).toBe('Benchmark di Mercato')
      expect(result.analisi.titolo).toBe('Analisi Netto Reale')
      expect(result.piano.titolo).toBe('Piano di Transizione')
    })
  })

  describe('block ids', () => {
    it('assigns correct ids to each block', () => {
      const result = parseStreamingBlocks('', false)

      expect(result.benchmark.id).toBe('benchmark')
      expect(result.analisi.id).toBe('analisi')
      expect(result.piano.id).toBe('piano')
    })
  })

  describe('progressive streaming simulation', () => {
    it('correctly updates as text accumulates chunk by chunk', () => {
      let text = ''

      // Chunk 1: preamble
      text += 'Ecco la tua analisi.\n\n'
      let result = parseStreamingBlocks(text, false)
      expect(result.benchmark.stato).toBe('loading')

      // Chunk 2: first marker + partial content
      text += `${MARKERS.BENCHMARK}\nLa tua tariffa di 350`
      result = parseStreamingBlocks(text, false)
      expect(result.benchmark.stato).toBe('streaming')
      expect(result.benchmark.contenuto).toBe('La tua tariffa di 350')

      // Chunk 3: more benchmark content
      text += ' EUR/giorno si posiziona nella fascia alta.'
      result = parseStreamingBlocks(text, false)
      expect(result.benchmark.contenuto).toContain('fascia alta')

      // Chunk 4: second marker
      text += `\n\n${MARKERS.ANALISI}\nIl tuo netto`
      result = parseStreamingBlocks(text, false)
      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('streaming')

      // Chunk 5: third marker
      text += ` annuo.\n\n${MARKERS.PIANO}\nPasso 1`
      result = parseStreamingBlocks(text, false)
      expect(result.analisi.stato).toBe('complete')
      expect(result.piano.stato).toBe('streaming')

      // Stream complete
      text += ': aumenta la tariffa.'
      result = parseStreamingBlocks(text, true)
      expect(result.benchmark.stato).toBe('complete')
      expect(result.analisi.stato).toBe('complete')
      expect(result.piano.stato).toBe('complete')
      expect(result.piano.contenuto).toBe('Passo 1: aumenta la tariffa.')
    })
  })
})
