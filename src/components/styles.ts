// Kelas utilitas Tailwind yang dipakai bersama oleh banyak komponen dan halaman.
// Dipisah dari ui.tsx supaya berkas komponen hanya mengekspor komponen (syarat fast refresh).
// Kelas disusun per peran: tidak ada dua utilitas yang berebut properti yang sama pada satu elemen.

const CARD_FILL = {
  none: 'border-line bg-surface',
  warning: 'border-warning bg-warning-soft',
  danger: 'border-danger bg-danger-soft',
} as const

/** Kelas kartu. `compact` = baris riwayat (rapat, border menyorot saat dihover); dipakai juga oleh <Link>. */
export function cardClass({ tone, compact = false }: { tone?: 'warning' | 'danger'; compact?: boolean } = {}) {
  return `flex flex-col rounded-card border ${CARD_FILL[tone ?? 'none']} ${compact ? 'gap-1 p-3 hover:border-primary' : 'gap-2 p-4'}`
}

const BTN =
  'flex min-h-(--tap) w-full cursor-pointer items-center justify-center rounded-card border-2 px-4 text-center text-action font-bold disabled:cursor-not-allowed disabled:border-transparent disabled:bg-disabled disabled:text-muted'
const BTN_VARIANT = {
  primary: 'border-transparent bg-primary text-on-color hover:brightness-110',
  secondary: 'border-primary bg-surface text-primary hover:bg-primary-soft',
}

/** Kelas tombol; dipakai untuk <button> maupun <Link> yang tampil sebagai tombol. */
export function btnClass(variant: keyof typeof BTN_VARIANT, extra = '') {
  return `${BTN} ${BTN_VARIANT[variant]} ${extra}`.trim()
}

/** Tautan di dalam kartu (kolom, tanpa dekorasi). */
export const PLAIN_LINK = 'flex flex-col gap-2'
/** Tautan teks "lihat selengkapnya" / "kembali" dengan target sentuh 44px. */
export const MORE_LINK = 'inline-flex min-h-11 items-center font-semibold text-primary hover:underline'
/** Baris riwayat di dalam kartu (dipisah garis bawah). */
export const ITEM_ROW = 'flex flex-col gap-1 border-b border-line p-3 hover:border-primary'
/** Judul + chip status dalam satu baris. */
export const ITEM_MAIN = 'flex items-center justify-between gap-2'
