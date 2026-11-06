import { t } from '../i18n'

const TZ = 'Asia/Jakarta'

export function formatTime(iso: string | null): string {
  if (!iso) return t('conn.noData')
  return new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(new Date(iso)).replace(':', '.')
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ })
    .format(new Date(iso))
    .replace(':', '.')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export function formatNumber(n: number, digits = 1): string {
  return new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n)
}
