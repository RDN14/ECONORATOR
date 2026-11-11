import type { ComponentProps, ReactNode } from 'react'
import { cardClass } from './styles'

// Komponen dasar. Gaya memakai kelas utilitas Tailwind; token warna/ukuran ada di src/index.css (@theme).
// Kelas yang dipakai banyak halaman ada di ./styles.ts.

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger'

const CHIP_SHAPE = 'inline-flex items-center self-start rounded-full text-caption font-bold'
const CHIP_TONE: Record<Tone, string> = {
  neutral: 'bg-placeholder text-fg',
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
}

export function Chip({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`${CHIP_SHAPE} px-2.5 py-1 ${CHIP_TONE[tone]}`}>{children}</span>
}

/** Tombol pilihan (filter, rentang waktu). `selected` = sedang dipilih. Tinggi baris `normal` seperti tombol bawaan browser (tampilan lama). */
export function ChipButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={`${CHIP_SHAPE} min-h-11 cursor-pointer px-3.5 py-2 leading-[normal] hover:brightness-95 ${selected ? 'bg-primary text-on-color' : CHIP_TONE.primary}`}
    >
      {children}
    </button>
  )
}

/** Baris chip / tombol pilihan yang boleh turun baris. */
export function Chips({ className = '', ...rest }: ComponentProps<'div'>) {
  return <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()} {...rest} />
}

export function Card({
  title,
  tone,
  compact,
  children,
  className = '',
}: {
  title?: string
  tone?: 'warning' | 'danger'
  compact?: boolean
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`${cardClass({ tone, compact })} ${className}`.trim()}>
      {title ? <h2 className="text-caption font-bold tracking-[0.02em] text-muted">{title}</h2> : null}
      {children}
    </section>
  )
}

/** Kotak pratinjau foto. Tingginya mengikuti tinggi layar (clamp), lebih lega di tablet/desktop. */
export function PhotoBox({ url, label }: { url: string | null; label: string }) {
  const box = 'w-full rounded-lg bg-placeholder object-contain h-[clamp(180px,45dvh,420px)] md:h-[clamp(220px,50dvh,420px)]'
  return url ? (
    <img className={box} src={url} alt={label} />
  ) : (
    <div className={`${box} flex items-center justify-center text-caption font-semibold text-muted`} role="img" aria-label={label}>
      {label}
    </div>
  )
}

export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-3">
      <span className="font-semibold">{label}</span>
      <span className="text-balance text-right text-muted">{value}</span>
    </div>
  )
}

/** Susunan halaman. HP: satu kolom. Kolom tambahan ditentukan pemanggil lewat className (md:, lg:). */
export function Page({ stack = false, narrow = false, className = '', children }: { stack?: boolean; narrow?: boolean; className?: string; children: ReactNode }) {
  const layout = stack ? 'flex flex-col' : 'grid grid-cols-1 content-start'
  const width = narrow ? 'mx-auto w-full max-w-160' : ''
  return <div className={`${layout} flex-1 gap-3 *:min-w-0 print:block print:*:mb-2 print:*:break-inside-avoid ${width} ${className}`.trim()}>{children}</div>
}

/** Kepala halaman: judul + keterangan; selalu selebar baris di grid. */
export function PageHead({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col gap-0.5 md:col-span-full">
      <h1 className="text-h1 font-bold">{title}</h1>
      {subtitle ? <p className="text-muted">{subtitle}</p> : null}
      {children}
    </header>
  )
}

export function Stack({ children }: { children: ReactNode }) {
  return <div className="flex min-w-0 flex-col gap-3">{children}</div>
}

/** Daftar kartu yang otomatis menyesuaikan jumlah kolom (min. 300px per kolom). */
export function List({ className = '', children }: { className?: string; children: ReactNode }) {
  return (
    <div className={`grid grid-cols-[repeat(auto-fill,minmax(min(100%,300px),1fr))] gap-3 print:block print:*:mb-2 print:*:break-inside-avoid ${className}`.trim()}>
      {children}
    </div>
  )
}
