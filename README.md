# Econorator — Frontend (PWA, hanya memantau)

Aplikasi web/PWA untuk pekerja tambak: memantau oksigen terlarut (DO) dan status paddle wheel, mengirim foto anco untuk analisis sisa pakan, melihat riwayat dan alarm.

**Peran aplikasi (hasil asistensi 4 Nov 2026): MONITORING SAJA.** Kecepatan paddle wheel diatur dari panel box. Aplikasi ini tidak mengirim perintah apa pun ke alat. Hasil analisis sisa pakan hanya disimpan sebagai data.

> **Status: seluruh data adalah DATA CONTOH (simulator).** Belum ada koneksi ke backend, MQTT, atau model. Tulisan "DATA CONTOH" di layar sudah dihapus atas permintaan Ardan (6 Nov), tetapi semua objek data contoh tetap bertanda `source: 'simulator'` di kode. Jangan dipakai sebagai hasil uji skripsi.

## Menjalankan

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173 (di HP: pakai --host, lihat catatan HTTPS)
npm test             # vitest
npm run typecheck && npm run lint
npm run build        # hasil di dist/, termasuk manifest + service worker
npm run preview      # menjalankan hasil build
```

## Yang sudah ada

| Layar | Isi |
|---|---|
| Beranda | DO terbaru dengan status berpita (ideal 5–8 / di bawah ideal / di bawah batas aman 3 / kritis 2 mg/L), grafik 1/6/24 jam dengan pita ideal dan garis batas, mode/kecepatan (rpm)/status dari panel (tampilan saja), sisa pakan terakhir |
| Sisa Pakan | Ambil foto dengan kamera HP → kompres di HP → pratinjau → kirim → status antrean/proses/selesai. Hasil hanya berupa nilai (persen, kategori, confidence, rekomendasi); foto tidak ditampilkan lagi dan tidak disimpan |
| Detail analisis | Persentase, kategori (habis / sedikit / banyak), confidence, versi model, rekomendasi pakan (tambah porsi 30% / porsi tetap / kurangi porsi 30%) |
| Riwayat | Gabungan analisis + alarm, filter, "Ekspor PDF" (dialog cetak browser → Simpan sebagai PDF) |
| Alarm | Alarm aktif dan riwayat. Alarm muncul dari ambang DO (usulan: di bawah 3 dan di bawah 2); di versi ini disimulasikan di klien |
| Pengaturan | Bahasa, pasang ke layar utama (hanya Android), ambang DO, alat bantu demo "Simulasikan offline" dan "Simulasikan DO turun (uji alarm)" |

Perilaku yang disengaja: status koneksi selalu terlihat di atas; saat offline angka DO diberi tanda "Data lama"; foto yang diambil saat offline ditahan ("Menunggu kirim") lalu terkirim sendiri ketika sinyal kembali; tombol dan target sentuh ≥ 44 px; warna mengikuti mode terang/gelap dan kontras HP; bahasa Indonesia (struktur i18n siap untuk Inggris).

## Tampilan responsif (HP, tablet, desktop)

Satu kode untuk semua layar. Tata letak berubah otomatis mengikuti **lebar jendela** (bukan jenis perangkat):

| Lebar | Contoh perangkat | Navigasi | Beranda |
|---|---|---|---|
| < 768 px | HP portrait | bar bawah (5 tab) | 1 kolom |
| ≥ 768 px | tablet portrait, HP landscape | rel di kiri (ikon di atas teks) | 2 kolom (DO + paddle, grafik, sisa pakan) |
| ≥ 1100 px | tablet landscape, laptop | rel di kiri | 3 kolom (DO, paddle, sisa pakan; grafik penuh di bawahnya) |
| ≥ 1280 px | desktop | bilah samping dengan nama aplikasi dan label di samping ikon | 3 kolom |

Sisa Pakan, Alarm, Pengaturan memakai 2 kolom mulai 768 px; daftar Riwayat menjadi kisi (2–3 kolom). Detail analisis dan Pratinjau foto dibatasi 640 px agar nyaman dibaca. Grafik DO mengukur lebar wadahnya (skala 1:1, teks tidak melar) dan menampilkan jam awal dan akhir. Di desktop tombol foto berlabel "PILIH FOTO ANCO" karena yang terbuka pemilih berkas, bukan kamera. Tampilan cetak (Ekspor PDF) tidak terpengaruh. Lihat `src/index.css` (blok "Responsif").

## Pemasangan PWA: hanya Android

- Android (Chrome, Samsung Internet): Pengaturan menampilkan kartu "PASANG APLIKASI (ANDROID)". Bila peramban mengirim prompt pemasangan, muncul tombol "PASANG DI LAYAR UTAMA"; bila belum (mis. belum HTTPS), muncul petunjuk lewat menu peramban; bila sudah dibuka dari layar utama, muncul "sudah terpasang".
- Selain Android (desktop, iPhone, iPad): tidak ada tombol atau petunjuk pasang, dan aplikasi tidak menangkap prompt pemasangan.
- Batas yang diketahui: deteksi memakai user agent Android. Chrome Android dengan "Situs desktop" aktif bisa menyamarkan diri sebagai desktop sehingga kartu tidak muncul. Ikon "Pasang" bawaan di bilah alamat Chrome desktop tidak bisa dimatikan dari kode karena itu fitur peramban; aplikasi hanya tidak menawarkannya.
- Manifest: `orientation: any` (tablet dan HP boleh landscape), `id: "/"`.

## Merek

Nama aplikasi **Econorator** dan logonya (`public/logo-econorator.png`, `public/logo-econorator-icon.png`) memakai berkas logo dari Ardan apa adanya (hanya dipotong dan diperkecil). Ikon PWA (`public/icons/`) dibuat dari ikon tetesan pada logo itu. pH, water level, dan data energi **tidak ditampilkan di web** untuk saat ini (keputusan Ardan, 6 Nov). Nama field JSON menunggu setelah frontend selesai.

## Aturan data

- Nilai yang belum diputuskan **tidak diisi**: lihat `src/config.ts` (`null` + komentar `TODO`). Menampilkan "belum ditentukan" lebih baik daripada angka karangan.
- Data contoh ada di `src/data/dummy.ts` (pseudo-random bersiklus tetap supaya tes stabil).
- Kontrak antarmuka: `claude/KONTRAK-ANTARMUKA-V0.md` (v0.5) di Project CAPSTONE. Tipe data di `src/data/types.ts` mengikuti bagian 3–7 kontrak itu.

## Sudah diputuskan (dilaporkan Ardan, 4–5 Nov 2026)

- Web hanya memantau; kecepatan paddle wheel diatur dari panel box.
- Satuan kecepatan **rpm** (Josh dan Pak Erwin). DO dalam **mg/L**: ideal **5–8**, batas minimum aman **3**, batas kritis **2** (`src/config.ts` → `doLevels`).
- Segmentasi sisa pakan memakai algoritma proyek anco, tetapi **3 kategori** (habis, sedikit, banyak) dengan rekomendasi porsi (+30% / tetap / −30%). Web hanya menampilkan nilai hasil; **foto dan mask tidak ditampilkan, foto tidak disimpan** (6 Nov).
- Algoritma kebutuhan oksigen tetap ada; web hanya menampilkan nilainya. Belum ada kartunya karena nilai dan satuannya belum didefinisikan



## Catatan teknis dan batas yang diketahui

- **PWA bisa dipasang (Android) hanya lewat HTTPS** (atau `localhost`). HTTPS/domain tersedia setelah migrasi VPS (Senin 9 Nov). Lewat `http://IP-LAN` aplikasi tetap bisa dibuka, tetapi tidak bisa dipasang dan service worker tidak aktif. Notifikasi push juga menunggu HTTPS.
- Offline: cangkang aplikasi di-cache service worker. Antrean unggah foto hanya hidup selama aplikasi terbuka (belum disimpan ke IndexedDB). Bila tab ditutup sebelum sinyal kembali, foto harus diambil ulang.
- Ekspor PDF memakai dialog cetak browser, bukan PDF yang dibuat di server.
- `npm audit`: 0 temuan pada dependensi produksi. 10 temuan (2 rendah, 8 sedang) ada di rantai alat build `vite-plugin-pwa → workbox-build`; "fix" otomatis menurunkan versi (breaking), jadi belum diambil.
- Belum ada: backend, MQTT, Socket.io, basis data, Docker Compose, autentikasi (ditunda; maksimal ±10 pengguna saat demo).

## Struktur

```
src/
  config.ts        nilai konfigurasi + TODO
  i18n/            teks UI (id; en menyusul)
  data/            tipe, data contoh, reducer, store (React context)
  lib/             format, kompres gambar, gabung riwayat, status, deteksi platform
  components/      ConnBar, AppNav (bar bawah / rel / sidebar), DoChart (SVG), ui, usePwaInstall
  pages/           7 layar
  test/            vitest + Testing Library
```
