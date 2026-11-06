import { Navigate, useNavigate } from 'react-router-dom'
import { PhotoBox } from '../components/ui'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'
import { formatBytes } from '../lib/format'

export default function Pratinjau() {
  const { draft, setDraft, submitDraft } = useStore()
  const navigate = useNavigate()
  if (!draft) return <Navigate to="/pakan" replace />
  return (
    <div className="page page--stack page--narrow">
      <header className="head">
        <h1>{t('preview.title')}</h1>
      </header>
      <PhotoBox url={draft.url} label={t('feed.photoSample')} />
      <p className="muted small">{t('preview.size', { size: formatBytes(draft.blob.size) })}</p>
      <p className="muted small">{t('preview.notStored')}</p>
      <div className="grow" />
      <button type="button" className="btn btn--primary" onClick={() => { submitDraft(); navigate('/pakan') }}>
        {t('preview.send')}
      </button>
      <button type="button" className="btn btn--secondary" onClick={() => { setDraft(null); navigate('/pakan') }}>
        {t('preview.retake')}
      </button>
    </div>
  )
}
