import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppNav } from '../components/AppNav'
import { DoChart } from '../components/DoChart'
import { StoreProvider } from '../data/store'
import { hasCoarsePointer, isAndroid, isStandalone } from '../lib/platform'
import Pengaturan from '../pages/Pengaturan'
import SisaPakan from '../pages/SisaPakan'

const UA = {
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-A546E) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36',
  samsungInternet: 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36',
  chromeWindows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  safariIphone: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  safariMac: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15',
  chromeLinux: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
}

function setUserAgent(ua: string) {
  vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
}
function setMedia(matches: Record<string, boolean>) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({ matches: matches[query] ?? false, media: query, addEventListener: () => {}, removeEventListener: () => {} }),
  })
}

afterEach(() => {
  vi.restoreAllMocks()
  // @ts-expect-error matchMedia tidak ada di jsdom; hapus stub antar-tes
  delete window.matchMedia
})

describe('platform', () => {
  it('isAndroid hanya true untuk Android', () => {
    expect(isAndroid(UA.chromeAndroid, undefined)).toBe(true)
    expect(isAndroid(UA.samsungInternet, undefined)).toBe(true)
    expect(isAndroid(UA.chromeWindows, undefined)).toBe(false)
    expect(isAndroid(UA.safariIphone, undefined)).toBe(false)
    expect(isAndroid(UA.safariMac, undefined)).toBe(false)
    expect(isAndroid(UA.chromeLinux, undefined)).toBe(false)
  })

  it('isAndroid ikut membaca userAgentData.platform', () => {
    expect(isAndroid(UA.chromeLinux, { platform: 'Android' })).toBe(true)
    expect(isAndroid(UA.chromeWindows, { platform: 'Windows' })).toBe(false)
  })

  it('isStandalone dan hasCoarsePointer aman tanpa matchMedia (jsdom)', () => {
    expect(isStandalone()).toBe(false)
    expect(hasCoarsePointer()).toBe(false)
  })

  it('isStandalone dan hasCoarsePointer membaca media query', () => {
    setMedia({ '(display-mode: standalone)': true, '(pointer: coarse)': true })
    expect(isStandalone()).toBe(true)
    expect(hasCoarsePointer()).toBe(true)
  })
})

describe('pemasangan PWA hanya di Android', () => {
  const mountSettings = () =>
    render(
      <MemoryRouter>
        <StoreProvider>
          <Pengaturan />
        </StoreProvider>
      </MemoryRouter>,
    )
  const promptEvent = () => {
    const evt = new Event('beforeinstallprompt', { cancelable: true }) as Event & { prompt: () => Promise<void> }
    evt.prompt = vi.fn(() => Promise.resolve())
    return evt
  }

  it('desktop: tidak ada UI pasang, walau peramban mengirim beforeinstallprompt', () => {
    setUserAgent(UA.chromeWindows)
    mountSettings()
    const evt = promptEvent()
    act(() => void window.dispatchEvent(evt))
    expect(screen.queryByText('PASANG APLIKASI (ANDROID)')).toBeNull()
    expect(screen.queryByRole('button', { name: 'PASANG DI LAYAR UTAMA' })).toBeNull()
    expect(evt.defaultPrevented).toBe(false)
  })

  it('iPhone: tidak ada UI pasang', () => {
    setUserAgent(UA.safariIphone)
    mountSettings()
    expect(screen.queryByText('PASANG APLIKASI (ANDROID)')).toBeNull()
  })

  it('Android tanpa prompt (mis. belum HTTPS): tampil petunjuk menu, tanpa tombol', () => {
    setUserAgent(UA.chromeAndroid)
    mountSettings()
    expect(screen.getByText('PASANG APLIKASI (ANDROID)')).toBeInTheDocument()
    expect(screen.getByText(/Pasang aplikasi/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'PASANG DI LAYAR UTAMA' })).toBeNull()
  })

  it('Android dengan prompt: tombol muncul, klik memanggil prompt lalu tombol hilang', async () => {
    setUserAgent(UA.chromeAndroid)
    mountSettings()
    const evt = promptEvent()
    act(() => void window.dispatchEvent(evt))
    expect(evt.defaultPrevented).toBe(true)
    const btn = screen.getByRole('button', { name: 'PASANG DI LAYAR UTAMA' })
    await act(async () => void fireEvent.click(btn))
    expect(evt.prompt).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('button', { name: 'PASANG DI LAYAR UTAMA' })).toBeNull()
  })

  it('Android yang sudah dibuka dari layar utama: tampil "sudah terpasang"', () => {
    setUserAgent(UA.chromeAndroid)
    setMedia({ '(display-mode: standalone)': true })
    mountSettings()
    expect(screen.getByText('Aplikasi sudah terpasang di HP ini.')).toBeInTheDocument()
  })

  it('Android: event appinstalled mengubah status jadi terpasang', () => {
    setUserAgent(UA.chromeAndroid)
    mountSettings()
    act(() => void window.dispatchEvent(new Event('appinstalled')))
    expect(screen.getByText('Aplikasi sudah terpasang di HP ini.')).toBeInTheDocument()
  })
})

describe('label tombol foto menyesuaikan perangkat', () => {
  const mountFeed = () =>
    render(
      <MemoryRouter>
        <StoreProvider>
          <SisaPakan />
        </StoreProvider>
      </MemoryRouter>,
    )
  it('layar sentuh: AMBIL FOTO ANCO', () => {
    setMedia({ '(pointer: coarse)': true })
    mountFeed()
    expect(screen.getByRole('button', { name: 'AMBIL FOTO ANCO' })).toBeInTheDocument()
  })
  it('mouse/desktop: PILIH FOTO ANCO', () => {
    setMedia({ '(pointer: coarse)': false })
    mountFeed()
    expect(screen.getByRole('button', { name: 'PILIH FOTO ANCO' })).toBeInTheDocument()
  })
})

describe('AppNav', () => {
  it('memuat 5 tautan dan logo Econorator (bentuk ikon/penuh dipilih CSS)', () => {
    render(
      <MemoryRouter>
        <AppNav />
      </MemoryRouter>,
    )
    const nav = screen.getByRole('navigation', { name: 'Navigasi utama' })
    expect(nav.querySelectorAll('a')).toHaveLength(5)
    expect(screen.getAllByAltText('Econorator').length).toBeGreaterThan(0)
  })
})

describe('DoChart', () => {
  const pts = [
    { ts: '2026-11-06T08:00:00Z', value: 6.1 },
    { ts: '2026-11-06T08:05:00Z', value: 6.8 },
    { ts: '2026-11-06T08:10:00Z', value: 5.2 },
  ]

  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', undefined)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('tanpa ResizeObserver/layout memakai lebar cadangan 300 dan tidak error', () => {
    render(<DoChart points={pts} label="Grafik" unit="mg/L" />)
    const svg = screen.getByRole('img', { name: 'Grafik' })
    expect(svg.tagName.toLowerCase()).toBe('svg')
    expect(svg).toHaveAttribute('viewBox', '0 0 300 170')
  })

  it('menampilkan jam awal dan akhir (WIB) serta satuan', () => {
    render(<DoChart points={pts} label="Grafik" unit="mg/L" />)
    const svg = screen.getByRole('img', { name: 'Grafik' })
    expect(svg).toHaveTextContent('15.00')
    expect(svg).toHaveTextContent('15.10')
    expect(svg).toHaveTextContent('mg/L')
  })

  it('kurang dari 2 titik: kotak kosong, bukan svg', () => {
    render(<DoChart points={pts.slice(0, 1)} label="Kosong" unit="mg/L" />)
    expect(screen.getByRole('img', { name: 'Kosong' }).tagName.toLowerCase()).toBe('div')
  })

  it('mengikuti lebar wadah: HP lebih pendek, desktop lebih tinggi, skala 1:1', () => {
    const widths = [
      { w: 358, h: 170 },
      { w: 600, h: 190 },
      { w: 1000, h: 230 },
    ]
    for (const { w, h } of widths) {
      const spy = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ width: w, height: 0, x: 0, y: 0, top: 0, left: 0, right: w, bottom: 0, toJSON: () => ({}) })
      const { unmount } = render(<DoChart points={pts} label="Grafik" unit="mg/L" />)
      const svg = screen.getByRole('img', { name: 'Grafik' })
      expect(svg).toHaveAttribute('viewBox', `0 0 ${w} ${h}`)
      expect(svg).toHaveAttribute('width', String(w))
      unmount()
      spy.mockRestore()
    }
  })
})
