/** Deteksi platform ringan. Dipisah supaya mudah diuji dengan user agent palsu. */

interface UaData {
  platform?: string
}

/** True bila peramban berjalan di Android. Dipakai agar pemasangan PWA hanya ditawarkan di Android. */
export function isAndroid(ua: string = navigator.userAgent, uaData: UaData | undefined = (navigator as Navigator & { userAgentData?: UaData }).userAgentData): boolean {
  return /android/i.test(ua) || uaData?.platform === 'Android'
}

/** True bila aplikasi sudah dibuka dari layar utama (mode standalone), bukan dari tab peramban. */
export function isStandalone(): boolean {
  try {
    return window.matchMedia?.('(display-mode: standalone)').matches === true
  } catch {
    return false
  }
}

/** True bila perangkat utama berupa layar sentuh (HP/tablet). Di desktop kamera tidak dibuka langsung. */
export function hasCoarsePointer(): boolean {
  try {
    return window.matchMedia?.('(pointer: coarse)').matches === true
  } catch {
    return false
  }
}
