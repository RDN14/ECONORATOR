import { t } from '../i18n'
import { formatTime } from '../lib/format'

export function ConnBar({ online, lastUpdate }: { online: boolean; lastUpdate: string | null }) {
  const time = formatTime(lastUpdate)
  return (
    <div
      className={`flex min-h-9 items-center gap-2 px-[max(var(--gutter),calc((100%-var(--page-max))/2))] py-1.5 text-caption font-semibold ${online ? 'bg-success-soft' : 'bg-danger-soft'}`}
      role="status"
      aria-live="polite"
    >
      <span className={`size-2.5 flex-none rounded-full ${online ? 'bg-success' : 'bg-danger'}`} aria-hidden="true" />
      <span>{online ? t('conn.online', { time }) : t('conn.offline', { time })}</span>
    </div>
  )
}
