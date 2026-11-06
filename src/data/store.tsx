import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'
import { CONFIG } from '../config'
import { makeSimulatedResult, makeTelemetry, mulberry32, nextDoValue, recommendationFor } from './dummy'
import { initState, reducer } from './reducer'
import { StoreContext } from './storeContext'
import type { Store } from './storeContext'
import type { FeedAnalysis } from './types'

function simulatedOutcome(rand: () => number) {
  const result = makeSimulatedResult(rand)
  return { result, recommendation: recommendationFor(result.category) }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initState(Date.now()))
  const online = state.browserOnline && !state.simulateOffline
  const rand = useRef(mulberry32(42))
  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
  })
  const timers = useRef<number[]>([])

  // status koneksi browser
  useEffect(() => {
    const on = () => dispatch({ type: 'browserOnline', value: true })
    const off = () => dispatch({ type: 'browserOnline', value: false })
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  // telemetri contoh berdenyut hanya saat online
  useEffect(() => {
    if (!online) return
    const id = window.setInterval(() => {
      const now = Date.now()
      const prev = stateRef.current.doSeries[stateRef.current.doSeries.length - 1]?.value ?? 5.5
      const value = nextDoValue(prev, rand.current, stateRef.current.lowDoDemo ? 'dropping' : 'normal')
      dispatch({ type: 'tick', point: { ts: new Date(now).toISOString(), value }, telemetry: makeTelemetry(now, value) })
    }, CONFIG.liveIntervalMs)
    return () => window.clearInterval(id)
  }, [online])

  const runPipeline = useCallback((analysisId: string) => {
    dispatch({ type: 'update', id: analysisId, patch: { status: 'queued' } })
    timers.current.push(
      window.setTimeout(() => dispatch({ type: 'update', id: analysisId, patch: { status: 'processing' } }), 1200),
      window.setTimeout(
        () => dispatch({ type: 'update', id: analysisId, patch: { status: 'done', ...simulatedOutcome(rand.current), modelVersion: 'contoh-0.0.0' } }),
        3600,
      ),
    )
  }, [])

  // kirim otomatis foto yang menunggu saat sinyal kembali
  useEffect(() => {
    if (!online) return
    for (const a of stateRef.current.analyses) if (a.status === 'pending_upload') runPipeline(a.id)
  }, [online, runPipeline])

  useEffect(() => () => timers.current.forEach((x) => window.clearTimeout(x)), [])

  const setDraft = useCallback((blob: Blob | null) => {
    const prev = stateRef.current.draft
    if (prev) URL.revokeObjectURL(prev.url)
    dispatch({ type: 'draft', draft: blob ? { blob, url: URL.createObjectURL(blob), capturedAt: new Date().toISOString() } : null })
  }, [])

  const submitDraft = useCallback((): string | null => {
    const d = stateRef.current.draft
    if (!d) return null
    const id = `foto-${Date.now()}`
    const analysis: FeedAnalysis = {
      id,
      clientId: crypto.randomUUID?.() ?? id,
      capturedAt: d.capturedAt,
      status: 'pending_upload',
      source: 'simulator',
      result: null,
      recommendation: null,
      modelVersion: null,
      error: null,
    }
    dispatch({ type: 'add', analysis })
    dispatch({ type: 'draft', draft: null })
    URL.revokeObjectURL(d.url) // foto tidak ditampilkan lagi setelah dikirim; hanya hasil yang dipakai
    const isOnline = stateRef.current.browserOnline && !stateRef.current.simulateOffline
    if (isOnline) runPipeline(id)
    return id
  }, [runPipeline])

  const value = useMemo<Store>(
    () => ({ ...state, online, setSimulateOffline: (v) => dispatch({ type: 'offline', value: v }), setLowDoDemo: (v) => dispatch({ type: 'lowDo', value: v }), setDraft, submitDraft }),
    [state, online, setDraft, submitDraft],
  )
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}
