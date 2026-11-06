import { Card, Row } from '../components/ui'
import { usePwaInstall } from '../components/usePwaInstall'
import { CONFIG } from '../config'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'

export default function Pengaturan() {
  const { simulateOffline, setSimulateOffline, lowDoDemo, setLowDoDemo } = useStore()
  const { state: installState, install } = usePwaInstall()
  return (
    <div className="page page--settings">
      <header className="head">
        <h1>{t('settings.title')}</h1>
      </header>
      <div className="stack">
        <Card>
          <Row
            label={t('settings.language')}
            value={
              <select aria-label={t('settings.language')} defaultValue="id">
                <option value="id">{t('settings.language.id')}</option>
                <option value="en" disabled>{t('settings.language.en')}</option>
              </select>
            }
          />
          <Row label={t('settings.display')} value={t('settings.display.value')} />
          <Row label={t('settings.notif')} value={t('settings.notif.value')} />
          <Row label={t('settings.threshold')} value={t('settings.threshold.value', { min: CONFIG.doLevels.idealMin, max: CONFIG.doLevels.idealMax, safe: CONFIG.doLevels.safeMin, critical: CONFIG.doLevels.critical, unit: CONFIG.doUnit })} />
          <Row label={t('settings.device')} value={CONFIG.deviceId} />
          <Row label={t('settings.version')} value={CONFIG.appVersion} />
        </Card>
        {installState !== 'unsupported' ? (
          <Card title={t('settings.install.title')}>
            {installState === 'installed' ? <p className="strong">{t('settings.installed')}</p> : null}
            {installState === 'prompt' ? (
              <>
                <button type="button" className="btn btn--primary" onClick={() => void install()}>{t('settings.install')}</button>
                <p className="muted small">{t('settings.installHint')}</p>
              </>
            ) : null}
            {installState === 'manual' ? <p className="muted small">{t('settings.installManual')}</p> : null}
          </Card>
        ) : null}
      </div>
      <div className="stack">
        <Card title={t('settings.demo.title')}>
          <label className="switch">
            <input type="checkbox" checked={simulateOffline} onChange={(e) => setSimulateOffline(e.target.checked)} />
            <span>{t('settings.demo.offline')}</span>
          </label>
          <p className="muted small">{t('settings.demo.offlineHint')}</p>
          <label className="switch">
            <input type="checkbox" checked={lowDoDemo} onChange={(e) => setLowDoDemo(e.target.checked)} />
            <span>{t('settings.demo.lowDo')}</span>
          </label>
          <p className="muted small">{t('settings.demo.lowDoHint')}</p>
        </Card>
        <Card>
          <p className="muted small">{t('settings.note')}</p>
        </Card>
      </div>
    </div>
  )
}
