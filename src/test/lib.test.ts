import { describe, expect, it } from 'vitest'
import { deriveDoAlarms } from '../data/alarms'
import { makeAlarms, makeDoSeries, makeFeedAnalyses, makeSimulatedResult, mulberry32, nextDoValue, recommendationFor } from '../data/dummy'
import { doLevel } from '../lib/doLevel'
import type { AlarmEvent, FeedAnalysis } from '../data/types'
import { t } from '../i18n'
import { formatBytes, formatNumber, formatTime } from '../lib/format'
import { mergeHistory } from '../lib/history'
import { recommendationText } from '../lib/recommendation'
import { fitWithin } from '../lib/image'

const NOW = Date.UTC(2026, 10, 4, 13, 0, 0) // 4 Nov 2026 13:00 UTC = 20.00 WIB

describe('mulberry32', () => {
  it('deterministik untuk seed yang sama dan berbeda untuk seed lain', () => {
    const a = mulberry32(1), b = mulberry32(1), c = mulberry32(2)
    const sa = [a(), a(), a()], sb = [b(), b(), b()]
    expect(sa).toEqual(sb)
    expect(sa).not.toEqual([c(), c(), c()])
    for (const v of sa) {
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('data contoh', () => {
  it('seri DO: 24 jam tiap 10 menit, urut naik, nilai wajar', () => {
    const s = makeDoSeries(NOW)
    expect(s).toHaveLength(145)
    expect(s[s.length - 1].ts).toBe(new Date(NOW).toISOString())
    for (let i = 1; i < s.length; i++) expect(s[i].ts > s[i - 1].ts).toBe(true)
    for (const p of s) expect(p.value).toBeGreaterThan(0)
    expect(makeDoSeries(NOW)).toEqual(s)
  })
  it('nextDoValue normal: tetap di atas batas aman (3) dan di bawah 9', () => {
    const r = mulberry32(3)
    let v = 5.5
    for (let i = 0; i < 2000; i++) {
      v = nextDoValue(v, r)
      expect(v).toBeGreaterThanOrEqual(3)
      expect(v).toBeLessThanOrEqual(9)
    }
  })
  it('nextDoValue dropping: melewati batas kritis dalam 15 langkah dan tidak di bawah 1,2', () => {
    const r = mulberry32(4)
    let v = 6.5
    for (let i = 0; i < 15; i++) v = nextDoValue(v, r, 'dropping')
    expect(v).toBeLessThan(2)
    for (let i = 0; i < 50; i++) v = nextDoValue(v, r, 'dropping')
    expect(v).toBeGreaterThanOrEqual(1.2)
  })
  it('riwayat alarm contoh: tidak ada yang aktif, nilai sesuai jenis dan ambang', () => {
    for (const a of makeAlarms(NOW)) {
      expect(a.endedAt).not.toBeNull()
      if (a.kind === 'do_low') {
        expect(a.valueAtStart!).toBeGreaterThanOrEqual(2)
        expect(a.valueAtStart!).toBeLessThan(3)
      }
      if (a.kind === 'do_critical') expect(a.valueAtStart!).toBeLessThan(2)
    }
  })
  it('rekomendasi mengikuti tabel kategori → porsi (habis +30%, sedikit tetap, banyak −30%)', () => {
    expect(recommendationFor('habis')).toEqual({ action: 'increase', percent: 30 })
    expect(recommendationFor('sedikit')).toEqual({ action: 'keep', percent: null })
    expect(recommendationFor('banyak')).toEqual({ action: 'decrease', percent: 30 })
    for (const f of makeFeedAnalyses(NOW)) expect(f.recommendation).toEqual(recommendationFor(f.result!.category))
  })
  it('data contoh sisa pakan memakai tiga kategori dan semuanya muncul', () => {
    const cats = makeFeedAnalyses(NOW).map((f) => f.result!.category)
    expect(new Set(cats)).toEqual(new Set(['habis', 'sedikit', 'banyak']))
  })
  it('semua data contoh berlabel simulator', () => {
    for (const a of makeFeedAnalyses(NOW)) expect(a.source).toBe('simulator')
    for (const a of makeAlarms(NOW)) expect(a.source).toBe('simulator')
  })
  it('hasil simulasi memakai kategori yang ada di konfigurasi', () => {
    const r = mulberry32(9)
    for (let i = 0; i < 50; i++) {
      const res = makeSimulatedResult(r)
      expect(['habis', 'sedikit', 'banyak']).toContain(res.category)
      expect(res.confidence).toBeGreaterThan(0)
      expect(res.confidence).toBeLessThanOrEqual(1)
    }
  })
})

describe('doLevel (ideal 5–8, aman ≥ 3, kritis < 2)', () => {
  it.each([
    [1.99, 'critical'], [2, 'low'], [2.99, 'low'], [3, 'below_ideal'], [4.99, 'below_ideal'],
    [5, 'ideal'], [6.5, 'ideal'], [8, 'ideal'], [8.01, 'above_ideal'],
  ])('%f → %s', (v, lvl) => expect(doLevel(v)).toBe(lvl))
})

describe('deriveDoAlarms', () => {
  const T1 = '2026-11-05T10:00:00.000Z'
  const T2 = '2026-11-05T10:00:05.000Z'
  const T3 = '2026-11-05T10:00:10.000Z'
  it('tidak ada alarm saat DO ≥ 3', () => {
    expect(deriveDoAlarms([], 6, T1)).toEqual([])
    expect(deriveDoAlarms([], 3, T1)).toEqual([])
    expect(deriveDoAlarms([], 4.2, T1)).toEqual([])
  })
  it('DO < 3 membuka do_low sekali saja (tanpa duplikat)', () => {
    const a = deriveDoAlarms([], 2.8, T1)
    expect(a).toHaveLength(1)
    expect(a[0]).toMatchObject({ kind: 'do_low', endedAt: null, valueAtStart: 2.8, source: 'simulator' })
    expect(deriveDoAlarms(a, 2.6, T2)).toHaveLength(1)
  })
  it('DO < 2 menaikkan ke do_critical dan menutup do_low', () => {
    const b = deriveDoAlarms(deriveDoAlarms([], 2.8, T1), 1.5, T2)
    expect(b.find((x) => x.kind === 'do_critical')).toMatchObject({ endedAt: null, valueAtStart: 1.5 })
    expect(b.find((x) => x.kind === 'do_low')).toMatchObject({ endedAt: T2 })
  })
  it('pulih ≥ 3 menutup semua alarm DO, alarm sensor tidak disentuh', () => {
    const sensor = { id: 's', kind: 'sensor_invalid', startedAt: T1, endedAt: null, detail: '', valueAtStart: null, source: 'simulator' } as const
    const c = deriveDoAlarms([sensor, ...deriveDoAlarms([], 1.5, T1)], 6, T3)
    expect(c.find((x) => x.kind === 'do_critical')?.endedAt).toBe(T3)
    expect(c.find((x) => x.kind === 'sensor_invalid')?.endedAt).toBeNull()
  })
})

describe('fitWithin', () => {
  it('tidak memperbesar', () => expect(fitWithin(800, 600, 1280)).toEqual({ width: 800, height: 600 }))
  it('mengecilkan landscape dan portrait menjaga rasio', () => {
    expect(fitWithin(4000, 3000, 1280)).toEqual({ width: 1280, height: 960 })
    expect(fitWithin(3000, 4000, 1280)).toEqual({ width: 960, height: 1280 })
  })
})

describe('mergeHistory', () => {
  const feeds = [
    { id: 'f1', capturedAt: '2026-11-04T10:00:00.000Z' },
    { id: 'f2', capturedAt: '2026-11-04T12:00:00.000Z' },
  ] as FeedAnalysis[]
  const alarms = [{ id: 'a1', startedAt: '2026-11-04T11:00:00.000Z' }] as AlarmEvent[]
  it('urut terbaru dulu', () => {
    const ids = mergeHistory(feeds, alarms, 'all').map((i) => (i.type === 'feed' ? i.feed.id : i.alarm.id))
    expect(ids).toEqual(['f2', 'a1', 'f1'])
  })
  it('filter feed / alarm', () => {
    expect(mergeHistory(feeds, alarms, 'feed').every((i) => i.type === 'feed')).toBe(true)
    expect(mergeHistory(feeds, alarms, 'alarm')).toHaveLength(1)
  })
})

describe('t()', () => {
  it('mengisi parameter', () => expect(t('conn.online', { time: '20.00' })).toContain('20.00'))
  it('parameter yang hilang dibiarkan', () => expect(t('conn.online')).toContain('{time}'))
  it('en kosong jatuh ke id', () => expect(t('nav.home', undefined, 'en')).toBe('Beranda'))
})

describe('teks rekomendasi', () => {
  it('menyusun teks dari aksi dan persen', () => {
    expect(recommendationText({ action: 'increase', percent: 30 })).toBe('Tambah porsi 30%')
    expect(recommendationText({ action: 'keep', percent: null })).toBe('Porsi tetap')
    expect(recommendationText({ action: 'decrease', percent: 30 })).toBe('Kurangi porsi 30%')
    expect(recommendationText(null)).toBe('Belum ada')
  })
  it('kategori "sedang" tidak ada lagi di teks', () => expect(t('category.habis')).toBe('habis'))
})

describe('format', () => {
  it('waktu WIB (UTC+7)', () => expect(formatTime('2026-11-04T13:00:00.000Z')).toBe('20.00'))
  it('null → belum ada data', () => expect(formatTime(null)).toBe('belum ada data'))
  it('ukuran berkas', () => {
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(2048)).toBe('2 KB')
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB')
  })
  it('angka desimal gaya Indonesia', () => expect(formatNumber(5.25)).toBe('5,3'))
})
