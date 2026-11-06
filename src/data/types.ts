import type { FeedCategory } from '../config'

// 'simulator' = data contoh. 'device' = dari alat. 'phone' = foto dari HP.
export type DataSource = 'simulator' | 'device' | 'phone'

export interface DoPoint {
  ts: string // ISO 8601 UTC
  value: number
}

// Hanya baca. Kontrak: KONTRAK-ANTARMUKA-V0.md bagian 3.
export interface Telemetry {
  ts: string
  source: DataSource
  do: { value: number; valid: boolean }
  panel: { mode: string | null; speed: { value: number; unit: string } | null; motorState: string | null }
}

export type FeedStatus = 'pending_upload' | 'queued' | 'processing' | 'done' | 'failed'

// Rekomendasi pakan berikutnya (KEPUTUSAN Ardan 6 Nov 2026, tabel dari asistensi): habis → tambah porsi 30%,
// sedikit → porsi tetap, banyak → kurangi porsi 30%. Nilai sebenarnya datang dari backend/model; web hanya menampilkan.
export interface FeedRecommendation {
  action: 'increase' | 'keep' | 'decrease'
  percent: number | null
}

export interface FeedResult {
  leftoverPct: number
  category: FeedCategory
  confidence: number
}

export interface FeedAnalysis {
  id: string
  clientId: string
  capturedAt: string
  status: FeedStatus
  source: DataSource
  result: FeedResult | null
  recommendation: FeedRecommendation | null
  modelVersion: string | null
  error: string | null
}

export type AlarmKind = 'do_low' | 'do_critical' | 'sensor_invalid'

export interface AlarmEvent {
  id: string
  kind: AlarmKind
  startedAt: string
  endedAt: string | null
  detail: string
  valueAtStart: number | null // nilai DO saat alarm mulai (null jika tidak relevan)
  source: DataSource
}
