import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Chip } from '../components/ui'
import { Card } from '../components/ui'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import type { TextKey } from '../i18n'
import { formatDateTime } from '../lib/format'
import { mergeHistory } from '../lib/history'
import type { HistoryFilter } from '../lib/history'
import { STATUS_TONE } from '../lib/status'

const FILTERS: Array<{ id: HistoryFilter; label: TextKey }> = [
  { id: 'all', label: 'history.filter.all' },
  { id: 'feed', label: 'history.filter.feed' },
  { id: 'alarm', label: 'history.filter.alarm' },
]

export default function Riwayat() {
  const { analyses, alarms } = useStore()
  const [filter, setFilter] = useState<HistoryFilter>('all')
  const items = mergeHistory(analyses, alarms, filter)
  return (
    <div className="page page--history">
      <header className="head">
        <h1>{t('history.title')}</h1>
        <p className="print-only muted">{t('history.printTitle', { app: t('app.name') })}</p>
      </header>
      <div className="toolbar no-print">
        <div className="chips" role="group" aria-label={t('history.title')}>
          {FILTERS.map((f) => (
            <button key={f.id} type="button" className={`chip chip--btn ${filter === f.id ? 'chip--selected' : 'chip--primary'}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {t(f.label)}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn--secondary" onClick={() => window.print()}>
          {t('history.export')}
        </button>
      </div>
      <p className="muted small no-print">{t('history.exportHint')}</p>

      {items.length === 0 ? <p className="muted">{t('history.empty')}</p> : null}
      <div className="list">
        {items.map((it) =>
          it.type === 'feed' ? (
            <Link key={it.feed.id} to={`/pakan/${it.feed.id}`} className="card item">
              <span className="muted small">{formatDateTime(it.at)}</span>
              <span className="item__main">
                <strong>{it.feed.result ? t('history.feed', { pct: it.feed.result.leftoverPct, category: t(`category.${it.feed.result.category}`) }) : t('history.feedNoResult')}</strong>
                <Chip tone={STATUS_TONE[it.feed.status]}>{t(`status.${it.feed.status}`)}</Chip>
              </span>
            </Link>
          ) : (
            <Card key={it.alarm.id} className="item">
              <span className="muted small">{formatDateTime(it.at)}</span>
              <span className="item__main">
                <strong>{t(`alarm.kind.${it.alarm.kind}`)}</strong>
                <Chip tone={it.alarm.endedAt ? 'success' : 'danger'}>{it.alarm.endedAt ? t('status.done') : t('alarm.active')}</Chip>
              </span>
            </Card>
          ),
        )}
      </div>
    </div>
  )
}
