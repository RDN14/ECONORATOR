import { Card, Page, PageHead, Row, Stack } from '../components/ui'
import { btnClass } from '../components/styles'
import { usePwaInstall } from '../components/usePwaInstall'
import { CONFIG } from '../config'
import { useStore } from '../data/storeContext'
import { t } from '../i18n'

const SWITCH = 'flex min-h-12 items-center gap-3 font-semibold'
// Preflight Tailwind menghapus jarak bawaan browser pada kotak centang (3px 3px 3px 4px); dipasang lagi agar tata letak sama.
const CHECKBOX = 'size-7 ml-1 mr-[3px] my-[3px]'

export default function Pengaturan() {
  const { simulateOffline, setSimulateOffline, lowDoDemo, setLowDoDemo } = useStore()
  const { state: installState, install } = usePwaInstall()
  return (
    <Page className="md:grid-cols-2 md:items-start">
      <PageHead title={t('settings.title')} />
      <Stack>
        <Card>
          <Row
            label={t('settings.language')}
            value={
              <select className="min-h-11 rounded-lg border border-line bg-surface px-2 text-fg" aria-label={t('settings.language')} defaultValue="id">
                <option value="id">{t('settings.language.id')}</option>
                <option value="en" disabled>{t('settings.language.en')}</option>
              </select>
            }
          />
          <Row label={t('settings.notif')} value={t('settings.notif.value')} />
          <Row label={t('settings.threshold')} value={t('settings.threshold.value', { min: CONFIG.doLevels.idealMin, max: CONFIG.doLevels.idealMax, safe: CONFIG.doLevels.safeMin, critical: CONFIG.doLevels.critical, unit: CONFIG.doUnit })} />
          <Row label={t('settings.device')} value={CONFIG.deviceId} />
          <Row label={t('settings.version')} value={CONFIG.appVersion} />
        </Card>
        {installState !== 'unsupported' ? (
          <Card title={t('settings.install.title')}>
            {installState === 'installed' ? <p className="font-semibold">{t('settings.installed')}</p> : null}
            {installState === 'prompt' ? (
              <>
                <button type="button" className={btnClass('primary')} onClick={() => void install()}>{t('settings.install')}</button>
                <p className="text-caption text-muted">{t('settings.installHint')}</p>
              </>
            ) : null}
            {installState === 'manual' ? <p className="text-caption text-muted">{t('settings.installManual')}</p> : null}
          </Card>
        ) : null}
      </Stack>
      <Stack>
        <Card title={t('settings.demo.title')}>
          <label className={SWITCH}>
            <input className={CHECKBOX} type="checkbox" checked={simulateOffline} onChange={(e) => setSimulateOffline(e.target.checked)} />
            <span>{t('settings.demo.offline')}</span>
          </label>
          <p className="text-caption text-muted">{t('settings.demo.offlineHint')}</p>
          <label className={SWITCH}>
            <input className={CHECKBOX} type="checkbox" checked={lowDoDemo} onChange={(e) => setLowDoDemo(e.target.checked)} />
            <span>{t('settings.demo.lowDo')}</span>
          </label>
          <p className="text-caption text-muted">{t('settings.demo.lowDoHint')}</p>
        </Card>
        <Card>
          <p className="text-caption text-muted">{t('settings.note')}</p>
        </Card>
      </Stack>
    </Page>
  )
}
