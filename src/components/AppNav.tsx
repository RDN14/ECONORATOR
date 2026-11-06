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

/**
 * Satu <nav> untuk semua ukuran layar; letaknya diatur CSS:
 * HP = bar bawah, tablet = rel di kiri (ikon di atas teks), layar lebar = bilah samping (ikon di samping teks).
 */
export function AppNav() {
  return (
    <nav className="nav" aria-label="Navigasi utama">
      <div className="nav__brand">
        <img className="nav__logo nav__logo--icon" src="/logo-econorator-icon.png" alt={t('app.name')} width="34" height="39" />
        <img className="nav__logo nav__logo--full" src="/logo-econorator.png" alt={t('app.name')} width="190" height="48" />
      </div>
      {ITEMS.map((it) => (
        <NavLink key={it.to} to={it.to} end={it.end} className={({ isActive }) => `nav__item ${isActive ? 'is-active' : ''}`}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d={ICONS[it.icon]} />
          </svg>
          <span>{t(it.label)}</span>
        </NavLink>
      ))}
    </nav>
  )
}
