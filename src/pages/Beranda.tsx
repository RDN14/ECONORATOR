import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Chip } from '../components/ui'
import { DoChart } from '../components/DoChart'
import { CONFIG } from '../config'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { DO_LEVEL_TONE, doLevel } from '../lib/doLevel'
import { recommendationText } from '../lib/recommendation'
import { formatDateTime, formatNumber, formatTime } from '../lib/format'

const RANGES = [
  { hours: 1, label: 'home.chart.1h' },
  { hours: 6, label: 'home.chart.6h' },
  { hours: 24, label: 'home.chart.24h' },
] as const

export default function Beranda() {
  const { latest, doSeries, analyses, online, lastUpdate } = useStore()
  const [hours, setHours] = useState<number>(6)
  const cutoff = new Date(latest.ts).getTime() - hours * 3_600_000
  const points = doSeries.filter((p) => new Date(p.ts).getTime() >= cutoff)
  const lastFeed = analyses.find((a) => a.status === 'done' && a.result)

  const lv = CONFIG.doLevels
  const level = doLevel(latest.do.value)
  const levelText = t(`do.level.${level}`, { critical: lv.critical, safe: lv.safeMin, min: lv.idealMin, max: lv.idealMax })
  const doChip = latest.do.valid ? <Chip tone={DO_LEVEL_TONE[level]}>{levelText}</Chip> : <Chip tone="danger">{t('home.do.invalid')}</Chip>

  return (
    <div className="page page--home">
      <header className="head">
        <h1>{t('home.pond')}</h1>
        <p className="muted">{t('home.device', { device: CONFIG.deviceId })}</p>
      </header>

      <Card title={t('home.do.title')} className="h-do">
        <div className={`big ${online ? '' : 'big--stale'}`}>
          <span className="big__num">{formatNumber(latest.do.value, 2)}</span>
          <span className="big__unit">{CONFIG.doUnit}</span>
        </div>
        {online ? doChip : <Chip tone="warning">{t('home.do.stale', { time: formatTime(lastUpdate) })}</Chip>}
      </Card>

      <Card title={t('home.chart.title')} className="h-chart">
        <div className="chips" role="group" aria-label={t('home.chart.title')}>
          {RANGES.map((r) => (
            <button key={r.hours} type="button" className={`chip chip--btn ${hours === r.hours ? 'chip--selected' : 'chip--primary'}`} aria-pressed={hours === r.hours} onClick={() => setHours(r.hours)}>
              {t(r.label)}
            </button>
          ))}
        </div>
        <DoChart points={points} unit={CONFIG.doUnit} label={t('home.chart.label', { range: `${hours} jam` })} />
        <p className="muted small">{t('home.chart.legend', { min: lv.idealMin, max: lv.idealMax, safe: lv.safeMin, critical: lv.critical, unit: CONFIG.doUnit })}</p>
      </Card>

      <Card title={t('home.paddle.title')} className="h-paddle">
        <div className="chips">
          <Chip tone="primary">{t('home.paddle.mode', { mode: latest.panel.mode ?? t('home.paddle.unknown') })}</Chip>
          <Chip tone="success">{latest.panel.motorState ?? t('home.paddle.unknown')}</Chip>
        </div>
        <p className="strong">
          {t('home.paddle.speed', {
            value: latest.panel.speed ? `${formatNumber(latest.panel.speed.value, 0)} ${latest.panel.speed.unit}` : t('home.paddle.unknown'),
          })}
        </p>
      </Card>

      <Card title={t('home.feed.title')} className="h-feed">
        {lastFeed?.result ? (
          <Link className="plain-link" to={`/pakan/${lastFeed.id}`}>
            <div className="chips">
              <span className="big__num big__num--md">{lastFeed.result.leftoverPct}%</span>
              <Chip tone="warning">{t('home.feed.category', { category: t(`category.${lastFeed.result.category}`) })}</Chip>
            </div>
            <p className="strong">{recommendationText(lastFeed.recommendation)}</p>
            <p className="muted small">{t('home.feed.detail', { time: formatDateTime(lastFeed.capturedAt) })}</p>
          </Link>
        ) : (
          <p className="muted">{t('home.feed.none')}</p>
        )}
      </Card>
    </div>
  )
}
