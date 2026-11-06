// Konfigurasi aplikasi.
// Nilai yang BELUM diputuskan ditandai `null` dan komentar TODO. Jangan diisi tanpa konfirmasi
// (TODO — NEED STAKEHOLDER CONFIRMATION). Lihat claude/KONTRAK-ANTARMUKA-V0.md (v0.5).

export const CONFIG = {
  appVersion: '0.1.0',
  deviceId: 'aerator-01', // USULAN; jumlah aerator: TODO-DOSEN

  // --- Josh ---
  doUnit: 'mg/L', // USULAN. TODO-JOSH: ditentukan keluaran sensor
  // KEPUTUSAN (dilaporkan Ardan 5 Nov 2026): ideal 5-8 mg/L, batas minimum aman 3 mg/L, batas kritis 2 mg/L.
  // ASUMSI batas: ideal 5 <= DO <= 8; aman jika DO >= 3; kritis jika DO < 2. TODO-JOSH: nilai tepat di batas,
  // histeresis, lama minimum sebelum alarm, dan apakah alarm hanya di bawah 3 (usulan) atau juga di bawah 5.
  doLevels: { critical: 2, safeMin: 3, idealMin: 5, idealMax: 8 },
  // KEPUTUSAN: rpm (kesepakatan Josh + Pak Erwin, dilaporkan Ardan 5 Nov 2026).
  // TODO-JOSH: rentang, resolusi, rpm poros kincir atau motor, terukur atau nilai setelan.
  speedUnit: 'rpm',
  offlineAfterSec: null as number | null, // TODO-JOSH: batas telemetri berhenti = offline

  // --- Rahmadian ---
  // KEPUTUSAN (Ardan 6 Nov 2026): 3 kategori sisa pakan: habis, sedikit, banyak (C300 anco memakai 4 kategori).
  // Ambang persen tiap kategori: TODO-RAHMADIAN. Web hanya menampilkan nilai hasil (tanpa foto dan mask).
  feedCategories: ['habis', 'sedikit', 'banyak'] as const,
  // TODO-RAHMADIAN: nilai kompresi foto. Ini hanya bawaan pengembangan agar unggahan ringan.
  photo: { maxDimension: 1280, jpegQuality: 0.7 },

  // --- Hanya untuk data contoh (simulator) ---
  liveIntervalMs: 5000,
} as const

export type FeedCategory = (typeof CONFIG.feedCategories)[number]
