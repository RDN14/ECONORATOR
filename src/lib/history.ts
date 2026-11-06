import type { AlarmEvent, FeedAnalysis } from '../data/types'

export type HistoryFilter = 'all' | 'feed' | 'alarm'

export type HistoryItem =
  | { type: 'feed'; at: string; feed: FeedAnalysis }
  | { type: 'alarm'; at: string; alarm: AlarmEvent }

/** Gabungkan analisis sisa pakan dan alarm, terbaru lebih dulu. */
export function mergeHistory(feeds: FeedAnalysis[], alarms: AlarmEvent[], filter: HistoryFilter): HistoryItem[] {
  const items: HistoryItem[] = []
  if (filter !== 'alarm') for (const feed of feeds) items.push({ type: 'feed', at: feed.capturedAt, feed })
  if (filter !== 'feed') for (const alarm of alarms) items.push({ type: 'alarm', at: alarm.startedAt, alarm })
  return items.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0))
}
