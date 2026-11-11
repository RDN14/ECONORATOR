import { useLayoutEffect, useRef, useState } from 'react'
import { CONFIG } from '../config'
import type { DoPoint } from '../data/types'
import { formatTime } from '../lib/format'

const TICK = 'fill-muted text-micro'

/** Lebar awal sebelum diukur (dan di lingkungan tanpa layout, mis. uji jsdom). */
const FALLBACK_WIDTH = 300

/** Tinggi grafik mengikuti lebar: HP rapat, tablet/desktop lebih lega. */
function chartHeight(width: number): number {
  if (width < 420) return 170
  if (width < 700) return 190
  return 230
}

function useWidth(fallback: number) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width)
      if (w > 0) setWidth(w)
    }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return { ref, width }
}

/**
 * Grafik garis DO ringan (SVG, tanpa pustaka). Sumbu Y mulai dari 0 supaya ambang terlihat apa adanya:
 * pita ideal (5–8), garis batas aman (3) dan kritis (2) dari CONFIG.doLevels.
 * Lebar diukur dari wadahnya, jadi skala 1:1 di HP, tablet, maupun desktop (teks tidak ikut melar).
 */
export function DoChart({ points, label, unit }: { points: DoPoint[]; label: string; unit: string }) {
  const { ref, width: W } = useWidth(FALLBACK_WIDTH)
  const total = chartHeight(W)
  const padL = 28
  const padT = 20 // ruang untuk satuan di kiri atas
  const padB = 22 // ruang untuk jam di bawah
  const H = total - padB

  if (points.length < 2) {
    return (
      <div ref={ref} className="w-full">
        <div className="w-full rounded-lg bg-placeholder" style={{ height: total }} role="img" aria-label={label} />
      </div>
    )
  }

  const l = CONFIG.doLevels
  const max = Math.max(10, Math.ceil(Math.max(...points.map((p) => p.value))))
  const x = (i: number) => padL + (i / (points.length - 1)) * (W - padL - 2)
  const y = (v: number) => H - ((v / max) * (H - padT))
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const first = points[0]
  const last = points[points.length - 1]
  return (
    <div ref={ref} className="w-full">
      <svg className="block max-w-full" width={W} height={total} viewBox={`0 0 ${W} ${total}`} role="img" aria-label={label}>
        <rect x={padL} y={y(l.idealMax)} width={W - padL} height={y(l.idealMin) - y(l.idealMax)} className="fill-success opacity-14" />
        <line x1={padL} x2={W} y1={y(l.safeMin)} y2={y(l.safeMin)} className="stroke-warning" strokeWidth={1} strokeDasharray="4 3" />
        <line x1={padL} x2={W} y1={y(l.critical)} y2={y(l.critical)} className="stroke-danger" strokeWidth={1} strokeDasharray="4 3" />
        {[l.idealMax, l.idealMin, l.safeMin, l.critical].map((v) => (
          <text key={v} x="0" y={y(v) + 4} className={TICK}>{v}</text>
        ))}
        <text x="0" y="11" className={TICK}>{unit}</text>
        <line x1={padL} x2={W} y1={y(0)} y2={y(0)} className="stroke-line" strokeWidth={1} />
        <path d={d} className="stroke-primary" strokeWidth={2} strokeLinejoin="round" fill="none" />
        <text x={padL} y={total - 5} className={TICK}>{formatTime(first.ts)}</text>
        <text x={W - 2} y={total - 5} className={TICK} textAnchor="end">{formatTime(last.ts)}</text>
      </svg>
    </div>
  )
}
