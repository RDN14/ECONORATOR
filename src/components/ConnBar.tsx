import { t } from '../i18n'
import { formatTime } from '../lib/format'

export function ConnBar({ online, lastUpdate }: { online: boolean; lastUpdate: string | null }) {
  const time = formatTime(lastUpdate)
  return (
    <div className={`conn ${online ? 'conn--online' : 'conn--offline'}`} role="status" aria-live="polite">
      <span className="conn__dot" aria-hidden="true" />
      <span>{online ? t('conn.online', { time }) : t('conn.offline', { time })}</span>
    </div>
  )
}
