import type { Tone } from '../components/ui'
import { CONFIG } from '../config'

export type DoLevel = 'critical' | 'low' | 'below_ideal' | 'ideal' | 'above_ideal'

/** Pita DO menurut ambang di CONFIG.doLevels. Batas: lihat komentar di config (ASUMSI, TODO-JOSH). */
export function doLevel(value: number): DoLevel {
  const l = CONFIG.doLevels
  if (value < l.critical) return 'critical'
  if (value < l.safeMin) return 'low'
  if (value < l.idealMin) return 'below_ideal'
  if (value <= l.idealMax) return 'ideal'
  return 'above_ideal'
}

export const DO_LEVEL_TONE: Record<DoLevel, Tone> = {
  critical: 'danger',
  low: 'danger',
  below_ideal: 'warning',
  ideal: 'success',
  above_ideal: 'neutral',
}
