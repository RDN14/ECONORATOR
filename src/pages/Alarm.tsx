import { Link } from 'react-router-dom'
import { Card, Chip } from '../components/ui'
import { CONFIG } from '../config'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { formatDateTime, formatNumber } from '../lib/format'

export default function Alarm() {
  const { alarms } = useStore()
  const byStart = (a: { startedAt: string }, b: { startedAt: string }) => b.startedAt.localeCompare(a.startedAt)
  const active = alarms.filter((a) => a.endedAt === null).sort(byStart)
  const past = alarms.filter((a) => a.endedAt !== null).sort(byStart)
  return (
    <div className="page page--alarm">
      <header className="head">
        <h1>{t('alarm.title')}</h1>
      </header>
      <p className="muted small span-all">{t('alarm.threshold', { min: CONFIG.doLevels.idealMin, max: CONFIG.doLevels.idealMax, safe: CONFIG.doLevels.safeMin, critical: CONFIG.doLevels.critical, unit: CONFIG.doUnit })}</p>
      {active.length === 0 ? <p className="muted span-all">{t('alarm.none')}</p> : null}
      {active.length > 0 ? (
        <div className="list span-all">
          {active.map((a) => (
            <Card key={a.id} tone="danger">
              <Chip tone="danger">{t('alarm.active')}</Chip>
              <p className="alarm-title">{t(`alarm.kind.${a.kind}`)}</p>
              {a.valueAtStart !== null ? <p>{t('alarm.valueAtStart', { value: formatNumber(a.valueAtStart, 1), unit: CONFIG.doUnit })}</p> : null}
              <p className="muted small">{t('alarm.since', { time: formatDateTime(a.startedAt) })}</p>
              <Link to="/" className="btn btn--primary">{t('alarm.viewChart')}</Link>
            </Card>
          ))}
        </div>
      ) : null}
      <Card title={t('alarm.history')}>
        {past.map((a) => (
          <p key={a.id}>
            {formatDateTime(a.startedAt)} · {t(`alarm.kind.${a.kind}`)} · {t('alarm.ended', { time: formatDateTime(a.endedAt as string) })}
          </p>
        ))}
      </Card>
      <Card title={t('alarm.push.title')}>
        <p className="muted small">{t('alarm.push.body')}</p>
      </Card>
    </div>
  )
}
