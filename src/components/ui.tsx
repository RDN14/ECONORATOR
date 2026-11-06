import type { ReactNode } from 'react'

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`chip chip--${tone}`}>{children}</span>
}

export function Card({ title, tone, children, className = '' }: { title?: string; tone?: 'warning' | 'danger'; children: ReactNode; className?: string }) {
  return (
    <section className={`card ${tone ? `card--${tone}` : ''} ${className}`.trim()}>
      {title ? <h2 className="card__title">{title}</h2> : null}
      {children}
    </section>
  )
}

/** Kotak pratinjau foto. Tingginya diatur CSS (.photo--preview) agar menyesuaikan layar. */
export function PhotoBox({ url, label }: { url: string | null; label: string }) {
  return url ? (
    <img className="photo photo--preview" src={url} alt={label} />
  ) : (
    <div className="photo photo--preview photo--placeholder" role="img" aria-label={label}>
      {label}
    </div>
  )
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="kv">
      <span className="kv__label">{label}</span>
      <span className="kv__value">{value}</span>
    </div>
  )
}
