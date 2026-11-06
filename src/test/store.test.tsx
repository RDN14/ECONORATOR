import { act, fireEvent, render, screen } from '@testing-library/react'
import { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnBar } from '../components/ConnBar'
import { StoreProvider } from '../data/store'
import { useStore } from '../data/storeContext'
import type { Store } from '../data/storeContext'

let latest: Store
function Probe() {
  const store = useStore()
  useEffect(() => {
    latest = store
  })
  return null
}
function mount() {
  return render(
    <StoreProvider>
      <Probe />
    </StoreProvider>,
  )
}
const photo = () => new Blob([new Uint8Array([1, 2, 3])], { type: 'image/jpeg' })

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-11-04T13:00:00Z'))
  URL.createObjectURL = vi.fn(() => 'blob:fake')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => vi.useRealTimers())

describe('StoreProvider', () => {
  it('telemetri contoh berdenyut tiap liveIntervalMs saat online', () => {
    mount()
    const n = latest.doSeries.length
    act(() => void vi.advanceTimersByTime(5000 * 3))
    expect(latest.doSeries.length).toBe(n + 3)
  })

  it('berhenti berdenyut saat mode offline disimulasikan', () => {
    mount()
    act(() => latest.setSimulateOffline(true))
    expect(latest.online).toBe(false)
    const n = latest.doSeries.length
    act(() => void vi.advanceTimersByTime(20000))
    expect(latest.doSeries.length).toBe(n)
  })

  it('foto online: pending → queued → processing → done dengan hasil contoh', () => {
    mount()
    act(() => latest.setDraft(photo()))
    let id: string | null = null
    act(() => {
      id = latest.submitDraft()
    })
    expect(id).not.toBeNull()
    expect(latest.draft).toBeNull()
    const get = () => latest.analyses.find((a) => a.id === id)!
    expect(get().status).toBe('queued')
    act(() => void vi.advanceTimersByTime(1300))
    expect(get().status).toBe('processing')
    act(() => void vi.advanceTimersByTime(2500))
    expect(get().status).toBe('done')
    expect(get().source).toBe('simulator')
    expect(get().result).not.toBeNull()
  })

  it('foto saat offline tertahan lalu terkirim sendiri ketika online lagi', () => {
    mount()
    act(() => latest.setSimulateOffline(true))
    act(() => latest.setDraft(photo()))
    let id: string | null = null
    act(() => {
      id = latest.submitDraft()
    })
    const get = () => latest.analyses.find((a) => a.id === id)!
    expect(get().status).toBe('pending_upload')
    act(() => void vi.advanceTimersByTime(10000))
    expect(get().status).toBe('pending_upload')
    act(() => latest.setSimulateOffline(false))
    act(() => void vi.advanceTimersByTime(4000))
    expect(get().status).toBe('done')
  })

  it('submitDraft tanpa draft mengembalikan null', () => {
    mount()
    let r: string | null = 'x'
    act(() => {
      r = latest.submitDraft()
    })
    expect(r).toBeNull()
  })
})

describe('ConnBar', () => {
  it('menampilkan status online dan offline dengan waktu data terakhir', () => {
    const { rerender } = render(<ConnBar online lastUpdate="2026-11-04T13:00:00.000Z" />)
    expect(screen.getByRole('status')).toHaveTextContent('Terhubung')
    expect(screen.getByRole('status')).toHaveTextContent('20.00')
    rerender(<ConnBar online={false} lastUpdate="2026-11-04T13:00:00.000Z" />)
    expect(screen.getByRole('status')).toHaveTextContent('Tidak ada koneksi')
  })
})

describe('App', () => {
  it('Beranda tampil dengan 5 tab navigasi', async () => {
    const { default: App } = await import('../App')
    window.history.pushState({}, '', '/')
    render(<App />)
    const nav = screen.getByRole('navigation')
    expect(nav.querySelectorAll('a')).toHaveLength(5)
  })
})

// Satu tick per act(): di pemakaian nyata tiap tick (5 dtk) punya render sendiri sebelum tick berikutnya.
function tickN(n: number) {
  for (let i = 0; i < n; i++) act(() => void vi.advanceTimersByTime(5000))
}

describe('Halaman (perilaku yang diputuskan asistensi 4 Nov)', () => {
  it('saat offline angka DO ditandai data lama', async () => {
    const { default: App } = await import('../App')
    window.history.pushState({}, '', '/')
    render(<App />)
    expect(screen.queryByText(/Data lama/)).toBeNull()
    act(() => void window.dispatchEvent(new Event('offline')))
    expect(screen.getByText(/Data lama/)).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Tidak ada koneksi')
  })

  it('alarm muncul dari ambang saat DO turun lalu hilang saat pulih (alur demo)', async () => {
    const { default: App } = await import('../App')
    window.history.pushState({}, '', '/pengaturan')
    render(<App />)
    const go = (name: string) => fireEvent.click(screen.getByRole('link', { name }))
    go('Alarm')
    expect(screen.getByText('Tidak ada alarm aktif.')).toBeInTheDocument()
    go('Pengaturan')
    fireEvent.click(screen.getByLabelText(/Simulasikan DO turun/))
    tickN(14)
    go('Beranda')
    expect(screen.getByText(/KRITIS \(di bawah 2\)/)).toBeInTheDocument()
    go('Alarm')
    expect(screen.getByText('ALARM AKTIF')).toBeInTheDocument()
    expect(screen.getByText('DO KRITIS', { selector: '.alarm-title' })).toBeInTheDocument()
    expect(screen.getByText(/Nilai saat alarm mulai: .* mg\/L \(contoh\)/)).toBeInTheDocument()
    go('Pengaturan')
    fireEvent.click(screen.getByLabelText(/Simulasikan DO turun/))
    tickN(14)
    go('Alarm')
    expect(screen.getByText('Tidak ada alarm aktif.')).toBeInTheDocument()
    expect(screen.getAllByText(/DO KRITIS/).length).toBeGreaterThan(0) // masuk riwayat
  })

  it('detail analisis: rekomendasi sesuai kategori, tanpa foto, dengan catatan foto tidak disimpan', async () => {
    const { default: App } = await import('../App')
    for (const [id, text] of [['contoh-1', 'Tambah porsi 30%'], ['contoh-2', 'Porsi tetap'], ['contoh-3', 'Kurangi porsi 30%']] as const) {
      window.history.pushState({}, '', `/pakan/${id}`)
      const { unmount } = render(<App />)
      expect(screen.getByText(text)).toBeInTheDocument()
      expect(screen.queryByText('foto contoh')).toBeNull()
      expect(screen.getByText(/Foto tidak disimpan/)).toBeInTheDocument()
      unmount()
    }
  })

  it('Beranda dan Sisa Pakan menampilkan nilai hasil terakhir (persen, kategori, rekomendasi) tanpa foto', async () => {
    const { default: App } = await import('../App')
    for (const path of ['/', '/pakan']) {
      window.history.pushState({}, '', path)
      const { unmount } = render(<App />)
      expect(screen.getByText('Tambah porsi 30%')).toBeInTheDocument()
      expect(screen.getByText('4%')).toBeInTheDocument()
      expect(screen.queryByText('foto contoh')).toBeNull()
      unmount()
    }
  })

  it('foto yang dikirim tidak muncul di hasil dan URL pratinjau dilepas', () => {
    mount()
    act(() => latest.setDraft(photo()))
    act(() => void latest.submitDraft())
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake')
    expect(JSON.stringify(latest.analyses[0])).not.toContain('blob:')
  })

  it('ambang DO tampil di Pengaturan dan halaman Alarm', async () => {
    const { default: App } = await import('../App')
    window.history.pushState({}, '', '/alarm')
    render(<App />)
    expect(screen.getByText(/ideal 5–8 mg\/L, batas aman 3, kritis 2/)).toBeInTheDocument()
  })

  it('tidak ada kontrol ke alat: tidak ada tombol STOP / atur kecepatan', async () => {
    const { default: App } = await import('../App')
    for (const path of ['/', '/pakan', '/riwayat', '/alarm', '/pengaturan']) {
      window.history.pushState({}, '', path)
      const { unmount } = render(<App />)
      expect(screen.queryByRole('button', { name: /stop|matikan|atur kecepatan|set speed/i })).toBeNull()
      unmount()
    }
  })
})
