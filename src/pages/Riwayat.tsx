import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Chip, ChipButton, Chips, List, Page, PageHead } from '../components/ui'
import { btnClass, cardClass, ITEM_MAIN } from '../components/styles'
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
    <Page>
      <PageHead title={t('history.title')}>
        <p className="hidden text-muted print:block">{t('history.printTitle', { app: t('app.name') })}</p>
      </PageHead>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between print:hidden">
        <Chips role="group" aria-label={t('history.title')}>
          {FILTERS.map((f) => (
            <ChipButton key={f.id} selected={filter === f.id} onClick={() => setFilter(f.id)}>
              {t(f.label)}
            </ChipButton>
          ))}
        </Chips>
        <button type="button" className={btnClass('secondary', 'md:w-auto md:min-w-55')} onClick={() => window.print()}>
          {t('history.export')}
        </button>
      </div>
      <p className="text-caption text-muted print:hidden">{t('history.exportHint')}</p>

      {items.length === 0 ? <p className="text-muted">{t('history.empty')}</p> : null}
      <List>
        {items.map((it) =>
          it.type === 'feed' ? (
            <Link key={it.feed.id} to={`/pakan/${it.feed.id}`} className={cardClass({ compact: true })}>
              <span className="text-caption text-muted">{formatDateTime(it.at)}</span>
              <span className={ITEM_MAIN}>
                <strong>{it.feed.result ? t('history.feed', { pct: it.feed.result.leftoverPct, category: t(`category.${it.feed.result.category}`) }) : t('history.feedNoResult')}</strong>
                <Chip tone={STATUS_TONE[it.feed.status]}>{t(`status.${it.feed.status}`)}</Chip>
              </span>
            </Link>
          ) : (
            <Card key={it.alarm.id} compact>
              <span className="text-caption text-muted">{formatDateTime(it.at)}</span>
              <span className={ITEM_MAIN}>
                <strong>{t(`alarm.kind.${it.alarm.kind}`)}</strong>
                <Chip tone={it.alarm.endedAt ? 'success' : 'danger'}>{it.alarm.endedAt ? t('status.done') : t('alarm.active')}</Chip>
              </span>
            </Card>
          ),
        )}
      </List>
    </Page>
  )
}
