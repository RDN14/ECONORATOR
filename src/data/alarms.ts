import { CONFIG } from '../config'
import type { AlarmEvent, AlarmKind } from './types'

const isDoKind = (k: AlarmKind) => k === 'do_low' || k === 'do_critical'

/**
 * Simulasi aturan alarm DO untuk data contoh (di sistem nyata ini dikerjakan backend).
 * USULAN (TODO-JOSH/dosen): alarm 'do_low' jika DO < batas aman, 'do_critical' jika DO < batas kritis.
 * Satu alarm DO aktif pada satu waktu; naik/turun tingkat menutup yang lama dan membuka yang baru.
 */
export function deriveDoAlarms(alarms: AlarmEvent[], value: number, ts: string): AlarmEvent[] {
  const want: AlarmKind | null = value < CONFIG.doLevels.critical ? 'do_critical' : value < CONFIG.doLevels.safeMin ? 'do_low' : null
  let out = alarms.map((a) => (isDoKind(a.kind) && a.endedAt === null && a.kind !== want ? { ...a, endedAt: ts } : a))
  if (want && !out.some((a) => a.kind === want && a.endedAt === null)) {
    out = [
      { id: `alarm-sim-${ts}-${want}`, kind: want, startedAt: ts, endedAt: null, detail: 'Alarm contoh dari simulator', valueAtStart: value, source: 'simulator' },
      ...out,
    ]
  }
  return out
}
