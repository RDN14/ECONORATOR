import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, Chip, ChipButton, Chips, Page, PageHead } from '../components/ui'
import { PLAIN_LINK } from '../components/styles'
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

/** Angka besar (DO, % sisa pakan). Ukurannya membesar di tablet dan laptop. */
const STAT = 'leading-none font-extrabold'

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
    // Tablet: 2 kolom, grafik dan sisa pakan selebar baris. Laptop: 3 kolom, sisa pakan di samping DO dan paddle.
    // grid-flow-dense mengisi sel kosong di sebelah kartu DO dengan kartu paddle meski urutan DOM-nya setelah grafik.
    <Page className="md:grid-flow-dense md:grid-cols-2 lg:grid-cols-3">
      <PageHead title={t('home.pond')} subtitle={t('home.device', { device: CONFIG.deviceId })} />

      <Card title={t('home.do.title')}>
        <div className={`flex items-end gap-2 ${online ? '' : 'opacity-55'}`}>
          <span className={`${STAT} text-stat md:text-stat-md lg:text-stat-lg`}>{formatNumber(latest.do.value, 2)}</span>
          <span className="pb-1 font-semibold text-muted">{CONFIG.doUnit}</span>
        </div>
        {online ? doChip : <Chip tone="warning">{t('home.do.stale', { time: formatTime(lastUpdate) })}</Chip>}
      </Card>

      <Card title={t('home.chart.title')} className="md:col-span-full">
        <Chips role="group" aria-label={t('home.chart.title')}>
          {RANGES.map((r) => (
            <ChipButton key={r.hours} selected={hours === r.hours} onClick={() => setHours(r.hours)}>
              {t(r.label)}
            </ChipButton>
          ))}
        </Chips>
        <DoChart points={points} unit={CONFIG.doUnit} label={t('home.chart.label', { range: `${hours} jam` })} />
        <p className="text-caption text-muted">{t('home.chart.legend', { min: lv.idealMin, max: lv.idealMax, safe: lv.safeMin, critical: lv.critical, unit: CONFIG.doUnit })}</p>
      </Card>

      <Card title={t('home.paddle.title')}>
        <Chips>
          <Chip tone="primary">{t('home.paddle.mode', { mode: latest.panel.mode ?? t('home.paddle.unknown') })}</Chip>
          <Chip tone="success">{latest.panel.motorState ?? t('home.paddle.unknown')}</Chip>
        </Chips>
        <p className="font-semibold">
          {t('home.paddle.speed', {
            value: latest.panel.speed ? `${formatNumber(latest.panel.speed.value, 0)} ${latest.panel.speed.unit}` : t('home.paddle.unknown'),
          })}
        </p>
      </Card>

      <Card title={t('home.feed.title')} className="md:col-span-full lg:col-span-1">
        {lastFeed?.result ? (
          <Link className={PLAIN_LINK} to={`/pakan/${lastFeed.id}`}>
            <Chips>
              <span className={`${STAT} text-stat-sm md:text-stat-md lg:text-stat-lg`}>{lastFeed.result.leftoverPct}%</span>
              <Chip tone="warning">{t('home.feed.category', { category: t(`category.${lastFeed.result.category}`) })}</Chip>
            </Chips>
            <p className="font-semibold">{recommendationText(lastFeed.recommendation)}</p>
            <p className="text-caption text-muted">{t('home.feed.detail', { time: formatDateTime(lastFeed.capturedAt) })}</p>
          </Link>
        ) : (
          <p className="text-muted">{t('home.feed.none')}</p>
        )}
      </Card>
    </Page>
  )
}
