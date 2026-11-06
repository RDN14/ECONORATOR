import { Link, useParams } from 'react-router-dom'
import { Card, Chip, Row } from '../components/ui'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { formatDateTime } from '../lib/format'
import { recommendationText } from '../lib/recommendation'
import { STATUS_TONE } from '../lib/status'

export default function DetailAnalisis() {
  const { id } = useParams()
  const { analyses } = useStore()
  const a = analyses.find((x) => x.id === id)
  if (!a) {
    return (
      <div className="page page--stack page--narrow">
        <Link to="/pakan" className="more">{t('detail.back')}</Link>
        <p>{t('detail.notFound')}</p>
      </div>
    )
  }
  return (
    <div className="page page--stack page--narrow">
      <Link to="/pakan" className="more">{t('detail.back')}</Link>
      <header className="head">
        <h1>{t('detail.title')}</h1>
      </header>
      <Card>
        {a.result ? (
          <>
            <Row label={t('detail.leftover')} value={`${a.result.leftoverPct}%`} />
            <Row label={t('detail.category')} value={t(`category.${a.result.category}`)} />
            <Row label={t('detail.confidence')} value={a.result.confidence} />
          </>
        ) : (
          <p className="muted">{t('detail.noResult')}</p>
        )}
        <Row label={t('detail.capturedAt')} value={formatDateTime(a.capturedAt)} />
        <Row label={t('detail.model')} value={a.modelVersion ?? t('common.unknown')} />
        <Row label={t('detail.status')} value={<Chip tone={STATUS_TONE[a.status]}>{t(`status.${a.status}`)}</Chip>} />
        <Row label={t('detail.recommendation')} value={recommendationText(a.recommendation)} />
      </Card>
      <Card tone="warning">
        <p className="small">{t('detail.note')}</p>
        <p className="small">{t('detail.recommendation.note')}</p>
        <p className="small">{t('detail.photoNotStored')}</p>
      </Card>
    </div>
  )
}
