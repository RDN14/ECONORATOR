import { useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, Chip, Chips, Page, PageHead, Stack } from '../components/ui'
import { btnClass, ITEM_MAIN, ITEM_ROW, MORE_LINK, PLAIN_LINK } from '../components/styles'
import { CONFIG } from '../config'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { formatDateTime } from '../lib/format'
import { compressImage } from '../lib/image'
import { hasCoarsePointer } from '../lib/platform'
import { recommendationText } from '../lib/recommendation'
import { STATUS_TONE } from '../lib/status'

export default function SisaPakan() {
  const { online, analyses, setDraft } = useStore()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const last = analyses.find((a) => a.status === 'done' && a.result)
  // Di HP kamera langsung terbuka; di laptop/desktop yang terbuka pemilih berkas, jadi labelnya disesuaikan.
  const [touch] = useState(hasCoarsePointer)

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setBusy(true)
    setError(false)
    try {
      setDraft(await compressImage(file, CONFIG.photo))
      navigate('/pakan/pratinjau')
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Page className="md:grid-cols-2 md:items-start">
      <PageHead title={t('feed.title')} subtitle={t('feed.subtitle')} />

      <Stack>
        {!online ? (
          <Card tone="warning">
            <p className="font-semibold">{t('feed.offlineNote')}</p>
          </Card>
        ) : null}

        <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={onFile} data-testid="camera-input" />
        <button type="button" className={btnClass('primary')} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? t('feed.compressing') : touch ? t('feed.take') : t('feed.pick')}
        </button>
        {error ? <p className="font-semibold text-danger" role="alert">{t('feed.compressError')}</p> : null}

        <Card title={t('feed.last.title')}>
          {last?.result ? (
            <Link className={PLAIN_LINK} to={`/pakan/${last.id}`}>
              <Chips>
                <span className="text-stat-sm leading-none font-extrabold md:text-stat-md lg:text-stat-lg">{last.result.leftoverPct}%</span>
                <Chip tone="warning">{t('home.feed.category', { category: t(`category.${last.result.category}`) })}</Chip>
              </Chips>
              <p className="font-semibold">{recommendationText(last.recommendation)}</p>
              <p className="text-caption text-muted">{t('feed.last.confidence', { value: last.result.confidence, time: formatDateTime(last.capturedAt) })}</p>
            </Link>
          ) : (
            <p className="text-muted">{t('feed.last.none')}</p>
          )}
        </Card>
      </Stack>

      <Card title={t('feed.list.title')}>
        {analyses.slice(0, 3).map((a) => (
          <Link key={a.id} to={`/pakan/${a.id}`} className={ITEM_ROW}>
            <span className="text-caption text-muted">{formatDateTime(a.capturedAt)}</span>
            <span className={ITEM_MAIN}>
              <strong>{a.result ? `${a.result.leftoverPct}% · ${t(`category.${a.result.category}`)}` : t('history.feedNoResult')}</strong>
              <Chip tone={STATUS_TONE[a.status]}>{t(`status.${a.status}`)}</Chip>
            </span>
          </Link>
        ))}
        <Link to="/riwayat" className={MORE_LINK}>{t('feed.list.more')}</Link>
      </Card>
    </Page>
  )
}
