import { describe, expect, it } from 'vitest'
import { initState, reducer } from '../data/reducer'
import { makeTelemetry } from '../data/dummy'

const NOW = Date.UTC(2026, 10, 4, 13, 0, 0)

describe('reducer', () => {
  it('tick menambah titik dan memperbarui lastUpdate', () => {
    const s = initState(NOW)
    const ts = new Date(NOW + 5000).toISOString()
    const n = reducer(s, { type: 'tick', point: { ts, value: 6.1 }, telemetry: makeTelemetry(NOW + 5000, 6.1) })
    expect(n.doSeries).toHaveLength(s.doSeries.length + 1)
    expect(n.latest.do.value).toBe(6.1)
    expect(n.lastUpdate).toBe(ts)
  })
  it('tick membatasi panjang seri (tidak tumbuh tanpa batas)', () => {
    let s = initState(NOW)
    for (let i = 0; i < 400; i++) {
      const ts = new Date(NOW + (i + 1) * 5000).toISOString()
      s = reducer(s, { type: 'tick', point: { ts, value: 5 }, telemetry: makeTelemetry(NOW, 5) })
    }
    expect(s.doSeries.length).toBeLessThanOrEqual(301)
  })
  it('add dan update analisis', () => {
    const s = initState(NOW)
    const first = s.analyses[0]
    const u = reducer(s, { type: 'update', id: first.id, patch: { status: 'failed', error: 'x' } })
    expect(u.analyses.find((a) => a.id === first.id)?.status).toBe('failed')
    expect(u.analyses.filter((a) => a.id !== first.id)).toEqual(s.analyses.filter((a) => a.id !== first.id))
    const a = reducer(u, { type: 'add', analysis: { ...first, id: 'baru' } })
    expect(a.analyses[0].id).toBe('baru')
  })
  it('flag offline', () => {
    const s = reducer(initState(NOW), { type: 'offline', value: true })
    expect(s.simulateOffline).toBe(true)
  })
  it('tick DO rendah membuka alarm aktif; tick DO normal menutupnya', () => {
    const s0 = initState(NOW)
    expect(s0.alarms.every((a) => a.endedAt !== null)).toBe(true)
    const tick = (s: typeof s0, v: number, i: number) => {
      const ts = new Date(NOW + (i + 1) * 5000).toISOString()
      return reducer(s, { type: 'tick', point: { ts, value: v }, telemetry: makeTelemetry(NOW + (i + 1) * 5000, v) })
    }
    const s1 = tick(s0, 2.5, 0)
    expect(s1.alarms.filter((a) => a.endedAt === null).map((a) => a.kind)).toEqual(['do_low'])
    const s2 = tick(s1, 6, 1)
    expect(s2.alarms.some((a) => a.endedAt === null)).toBe(false)
  })
  it('tick dengan sensor tidak valid tidak membuat alarm DO', () => {
    const s0 = initState(NOW)
    const tel = makeTelemetry(NOW + 5000, 1)
    tel.do.valid = false
    const s1 = reducer(s0, { type: 'tick', point: { ts: tel.ts, value: 1 }, telemetry: tel })
    expect(s1.alarms).toEqual(s0.alarms)
  })
})
