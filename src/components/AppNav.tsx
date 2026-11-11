import { NavLink } from 'react-router-dom'
import { t } from '../i18n'
import type { TextKey } from '../i18n'

const ICONS: Record<string, string> = {
  home: 'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  feed: 'M4 7h16M4 12h16M4 17h10',
  history: 'M12 7v5l3 2M3 12a9 9 0 1 0 3-6.7M3 4v4h4',
  alarm: 'M6 9a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7M10 20a2 2 0 0 0 4 0',
  settings: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .1 1.2l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2L10 21h4l.6-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z',
}

const ITEMS: Array<{ to: string; label: TextKey; icon: keyof typeof ICONS; end?: boolean }> = [
  { to: '/', label: 'nav.home', icon: 'home', end: true },
  { to: '/pakan', label: 'nav.feed', icon: 'feed' },
  { to: '/riwayat', label: 'nav.history', icon: 'history' },
  { to: '/alarm', label: 'nav.alarm', icon: 'alarm' },
  { to: '/pengaturan', label: 'nav.settings', icon: 'settings' },
]

// Kelas per bagian. Urutan varian: dasar (HP) -> md (tablet) -> xl (desktop) -> short (layar landscape pendek).
const NAV =
  'fixed inset-x-0 bottom-0 z-10 flex justify-center border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] ' +
  'md:sticky md:top-0 md:h-dvh md:w-(--rail-w) md:flex-none md:flex-col md:justify-start md:gap-1 md:self-start md:overflow-y-auto md:border-t-0 md:border-r md:px-2 md:py-3 ' +
  'xl:px-3 xl:py-4 short:md:gap-0.5 short:md:py-2 print:hidden'
const BRAND = 'hidden items-center justify-center rounded-card bg-white p-1.5 md:mb-2 md:flex xl:mb-3 xl:px-3 xl:py-2.5 short:md:hidden'
const ITEM =
  'flex max-w-24 flex-1 flex-col items-center justify-center gap-0.5 min-h-(--nav-h) text-micro hover:bg-primary-soft hover:text-primary ' +
  'md:max-w-none md:flex-none md:rounded-card xl:min-h-12 xl:flex-row xl:justify-start xl:gap-3 xl:px-3.5 xl:text-nav'

/**
 * Satu <nav> untuk semua ukuran layar; letaknya diatur utilitas responsif:
 * HP = bar bawah, tablet = rel di kiri (ikon di atas teks), layar lebar = bilah samping (ikon di samping teks).
 */
export function AppNav() {
  return (
    <nav className={NAV} aria-label="Navigasi utama">
      <div className={BRAND}>
        <img className="block h-auto xl:hidden" src="/logo-econorator-icon.png" alt={t('app.name')} width="34" height="39" />
        <img className="hidden h-auto w-full max-w-47.5 xl:block" src="/logo-econorator.png" alt={t('app.name')} width="190" height="48" />
      </div>
      {ITEMS.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.end}
          className={({ isActive }) => `${ITEM} ${isActive ? 'font-extrabold text-primary md:bg-primary-soft' : 'font-semibold text-muted'}`}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[it.icon]} />
          </svg>
          <span>{t(it.label)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
