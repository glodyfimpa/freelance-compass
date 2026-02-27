import type { SeniorityBand } from '@/lib/types'

export const BENCHMARK: Record<string, Record<SeniorityBand, [number, number]>> = {
  backend:   { junior: [200, 280], mid: [300, 380], senior: [400, 550] },
  frontend:  { junior: [180, 250], mid: [260, 330], senior: [350, 480] },
  fullstack: { junior: [200, 270], mid: [270, 350], senior: [380, 520] },
  devops:    { junior: [250, 320], mid: [350, 430], senior: [450, 600] },
  data:      { junior: [230, 300], mid: [330, 420], senior: [440, 600] },
  altro:     { junior: [200, 280], mid: [300, 380], senior: [400, 550] },
}

export function getSeniority(anni: number): SeniorityBand {
  if (anni <= 2) return 'junior'
  if (anni <= 5) return 'mid'
  return 'senior'
}

export function buildBenchmarkMarkdownTable(): string {
  return `| Ruolo | Junior (0-2y) | Mid (3-5y) | Senior (6+y) |
|---|---|---|---|
| Backend Developer | 200-280 | 300-380 | 400-550 |
| Frontend Developer | 180-250 | 260-330 | 350-480 |
| Fullstack Developer | 200-270 | 270-350 | 380-520 |
| DevOps / SRE / Cloud | 250-320 | 350-430 | 450-600 |
| Data Engineer / ML | 230-300 | 330-420 | 440-600 |`
}
