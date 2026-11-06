// DATA CONTOH (simulator). Bukan hasil pengukuran. Semua objek bertanda source: 'simulator'.
// Pseudo-random bersiklus tetap (seeded) agar tes stabil.
import { CONFIG } from '../config'
import type { FeedCategory } from '../config'
import type { AlarmEvent, DoPoint, FeedAnalysis, FeedRecommendation, Telemetry } from './types'

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const MIN = 60_000

/** Seri DO contoh: gelombang harian + derau kecil. Nilai hanya ilustrasi. */
export function makeDoSeries(nowMs: number, hours = 24, stepMin = 10, seed = 7): DoPoint[] {
  const rand = mulberry32(seed)
  const points: DoPoint[] = []
  const n = Math.floor((hours * 60) / stepMin)
  for (let i = n; i >= 0; i--) {
    const t = nowMs - i * stepMin * MIN
    const hour = new Date(t).getUTCHours() + new Date(t).getUTCMinutes() / 60
    const wave = Math.sin(((hour - 5) / 24) * Math.PI * 2)
    points.push({ ts: new Date(t).toISOString(), value: round2(5.5 + wave * 1.6 + (rand() - 0.5) * 0.3) })
  }
  return points
}

/** 'normal' kembali pelan ke pita ideal; 'dropping' turun cepat (alat uji alarm saat demo). Nilai hanya ilustrasi. */
export function nextDoValue(prev: number, rand: () => number, mode: 'normal' | 'dropping' = 'normal'): number {
  const v = mode === 'dropping' ? prev - 0.5 + (rand() - 0.5) * 0.1 : prev + (5.8 - prev) * 0.08 + (rand() - 0.5) * 0.25
  return round2(Math.min(9, Math.max(1.2, v)))
}

export function makeTelemetry(tsMs: number, doValue: number): Telemetry {
  return {
    ts: new Date(tsMs).toISOString(),
    source: 'simulator',
    do: { value: doValue, valid: true },
    panel: { mode: 'manual', speed: { value: 40, unit: CONFIG.speedUnit }, motorState: 'berjalan' },
  }
}

/** Tabel kategori → rekomendasi dari Ardan (6 Nov 2026). Hanya dipakai simulator; nilai sungguhan dari model/backend. */
export function recommendationFor(category: FeedCategory): FeedRecommendation {
  if (category === 'habis') return { action: 'increase', percent: 30 }
  if (category === 'banyak') return { action: 'decrease', percent: 30 }
  return { action: 'keep', percent: null }
}

export function makeFeedAnalyses(nowMs: number): FeedAnalysis[] {
  // Persen di bawah hanya ILUSTRASI untuk data contoh, bukan ambang kategori (ambang: TODO-RAHMADIAN).
  const rows: Array<[number, number, FeedCategory, number]> = [
    [95, 4, 'habis', 0.93],
    [380, 18, 'sedikit', 0.88],
    [700, 61, 'banyak', 0.81],
  ]
  return rows.map(([ago, pct, category, confidence], i) => ({
    id: `contoh-${i + 1}`,
    clientId: `contoh-client-${i + 1}`,
    capturedAt: new Date(nowMs - ago * MIN).toISOString(),
    status: 'done',
    source: 'simulator',
    result: { leftoverPct: pct, category, confidence },
    recommendation: recommendationFor(category),
    modelVersion: 'contoh-0.0.0',
    error: null,
  }))
}

/** Riwayat alarm contoh, semuanya sudah selesai dan di luar jendela grafik 24 jam. Alarm aktif muncul dari simulator DO. */
export function makeAlarms(nowMs: number): AlarmEvent[] {
  const ended = (hAgo: number, durMin: number) => ({
    startedAt: new Date(nowMs - hAgo * 60 * MIN).toISOString(),
    endedAt: new Date(nowMs - hAgo * 60 * MIN + durMin * MIN).toISOString(),
  })
  return [
    { id: 'alarm-contoh-1', kind: 'do_low', ...ended(26, 40), detail: 'Contoh alarm selesai', valueAtStart: 2.8, source: 'simulator' },
    { id: 'alarm-contoh-2', kind: 'do_critical', ...ended(50, 15), detail: 'Contoh alarm selesai', valueAtStart: 1.9, source: 'simulator' },
    { id: 'alarm-contoh-3', kind: 'sensor_invalid', ...ended(75, 12), detail: 'Contoh sensor tidak valid', valueAtStart: null, source: 'simulator' },
  ]
}

/** Hasil analisis contoh setelah "diproses". Bukan keluaran model sungguhan. */
export function makeSimulatedResult(rand: () => number): NonNullable<FeedAnalysis['result']> {
  const cats = CONFIG.feedCategories
  const idx = Math.floor(rand() * cats.length)
  const base = [3, 16, 60][idx] ?? 3 // ILUSTRASI, bukan ambang kategori
  return { leftoverPct: Math.round(base + rand() * 6), category: cats[idx] ?? cats[0], confidence: round2(0.75 + rand() * 0.2) }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}
