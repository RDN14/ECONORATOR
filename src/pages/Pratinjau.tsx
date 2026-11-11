import { Navigate, useNavigate } from 'react-router-dom'
import { Page, PageHead, PhotoBox } from '../components/ui'
import { btnClass } from '../components/styles'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { formatBytes } from '../lib/format'

export default function Pratinjau() {
  const { draft, setDraft, submitDraft } = useStore()
  const navigate = useNavigate()
  if (!draft) return <Navigate to="/pakan" replace />
  return (
    <Page stack narrow>
      <PageHead title={t('preview.title')} />
      <PhotoBox url={draft.url} label={t('feed.photoSample')} />
      <p className="text-caption text-muted">{t('preview.size', { size: formatBytes(draft.blob.size) })}</p>
      <p className="text-caption text-muted">{t('preview.notStored')}</p>
      <div className="flex-1" />
      <button type="button" className={btnClass('primary')} onClick={() => { submitDraft(); navigate('/pakan') }}>
        {t('preview.send')}
      </button>
      <button type="button" className={btnClass('secondary')} onClick={() => { setDraft(null); navigate('/pakan') }}>
        {t('preview.retake')}
      </button>
    </Page>
  )
}
