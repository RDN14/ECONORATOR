import { makeAlarms, makeDoSeries, makeFeedAnalyses, makeTelemetry } from './dummy'
import { deriveDoAlarms } from './alarms'
import type { AlarmEvent, DoPoint, FeedAnalysis, Telemetry } from './types'

export interface State {
  doSeries: DoPoint[]
  latest: Telemetry
  lastUpdate: string | null
  analyses: FeedAnalysis[]
  alarms: AlarmEvent[]
  simulateOffline: boolean
  lowDoDemo: boolean
  browserOnline: boolean
  draft: { blob: Blob; url: string; capturedAt: string } | null
}

export type Action =
  | { type: 'tick'; point: DoPoint; telemetry: Telemetry }
  | { type: 'add'; analysis: FeedAnalysis }
  | { type: 'update'; id: string; patch: Partial<FeedAnalysis> }
  | { type: 'offline'; value: boolean }
  | { type: 'lowDo'; value: boolean }
  | { type: 'browserOnline'; value: boolean }
  | { type: 'draft'; draft: State['draft'] }

export function initState(nowMs: number): State {
  const series = makeDoSeries(nowMs)
  const last = series[series.length - 1]
  return {
    doSeries: series,
    latest: makeTelemetry(nowMs, last.value),
    lastUpdate: new Date(nowMs).toISOString(),
    analyses: makeFeedAnalyses(nowMs),
    alarms: makeAlarms(nowMs),
    simulateOffline: false,
    lowDoDemo: false,
    browserOnline: typeof navigator === 'undefined' ? true : navigator.onLine,
    draft: null,
  }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'tick':
      return {
        ...state,
        doSeries: [...state.doSeries.slice(-300), action.point],
        latest: action.telemetry,
        lastUpdate: action.telemetry.ts,
        alarms: action.telemetry.do.valid ? deriveDoAlarms(state.alarms, action.point.value, action.point.ts) : state.alarms,
      }
    case 'add':
      return { ...state, analyses: [action.analysis, ...state.analyses] }
    case 'update':
      return { ...state, analyses: state.analyses.map((a) => (a.id === action.id ? { ...a, ...action.patch } : a)) }
    case 'offline':
      return { ...state, simulateOffline: action.value }
    case 'lowDo':
      return { ...state, lowDoDemo: action.value }
    case 'browserOnline':
      return { ...state, browserOnline: action.value }
    case 'draft':
      return { ...state, draft: action.draft }
  }
}
