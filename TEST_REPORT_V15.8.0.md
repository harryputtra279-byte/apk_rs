# Laporan pemeriksaan V15.8.0

Tanggal paket: 2026-10-09

## Perubahan
- Memulihkan tombol hamburger **Pelayanan** khusus akun superuser di kiri atas.
- Tombol Pelayanan membuka 16 ikon akses cepat dalam grid 4×4.
- Chat tetap terpisah di kiri atas untuk akun petugas dan pasien.
- Topbar diubah ke layout grid responsif agar judul halaman memiliki kolom sendiri dan tidak tertutup Chat.
- Pada layar sempit, Chat dan Pelayanan menjadi tombol ikon ringkas.
- Label modal yang tidak dipakai sebagai navbar diubah dari “Menu Lainnya” menjadi “Akses Modul”.
- Versi aplikasi dan service-worker cache dinaikkan ke V15.8.0.

## Pemeriksaan yang dijalankan
- `node --check app.js`: lulus.
- `node --check sw.js`: lulus.
- Pemeriksaan otomatis daftar menu: 16 route unik, seluruhnya terdaftar pada katalog NAV_ITEMS.
- Pemeriksaan markup: tombol Pelayanan dan handler klik ditemukan; tombol Chat terpisah.
- Pemeriksaan CSS: aturan layout responsif topbar dan grid 4 kolom ditemukan.
- Pemeriksaan versi cache: `index.html`, `app.js`, dan `sw.js` konsisten pada V15.8.0.

## Batas pengujian
Percobaan menjalankan Chromium headless pada lingkungan build tidak selesai (proses macet sebelum menghasilkan DOM). Karena itu, **pengujian klik langsung di browser dan pengujian visual pada perangkat belum dinyatakan lulus**. Perubahan ini telah lolos pemeriksaan sintaks dan statis, tetapi perlu diuji pada browser target setelah ZIP dibuka. Pengujian ini bukan validasi keamanan/operasional rumah sakit.

## Penyimpanan lintas browser
Aplikasi menggunakan `localStorage`; data tiap browser/perangkat terpisah. Versi kode yang baru dapat tampil setelah cache/service worker diperbarui, tetapi data lokal tidak otomatis tersinkron antar browser.
