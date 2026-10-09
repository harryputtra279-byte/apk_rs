# Laporan Pengujian V15.7.2 — Perbaikan Booking H+3

## Temuan akar masalah
- V15.7.1 masih memiliki `max=dateOffset(7)` pada form booking petugas.
- `submitBooking()` sebelumnya hanya menjalankan validasi rentang eksekutif; booking reguler dari form petugas dapat melewati rentang yang dimaksud.
- Form pasien memakai batas awal/tanggal yang statis saat jenis layanan diubah.
- `index.html` dan Service Worker menggunakan URL/cache versi 15.7.0, sehingga pembaruan aset perlu dipaksa dengan versi baru.

## Perubahan V15.7.2
- Batas kalender pasien dan petugas maksimal H+3.
- Batas minimum berubah ketika layanan berpindah antara Reguler dan Eksekutif.
- Validasi bisnis menolak tanggal di luar jendela pada saat submit, tidak hanya mengandalkan atribut kalender.
- Validasi Eksekutif memeriksa tanggal, batas jam 12.00 pada hari H, jadwal dokter, dan kapasitas sesi.
- URL aset dan Service Worker dinaikkan ke 15.7.2.

## Pemeriksaan
- `node --check app.js`: dijalankan setelah patch.
- `node --check sw.js`: lulus.
- Uji otomatis logika tanggal + pemeriksaan source: **15/15 lulus**, termasuk batas H+3, batas 00.01, aturan hari H eksekutif pukul 12.00, form petugas, validasi submit, dan cache-busting.
- `unzip -t` paket: lulus, tidak ditemukan kerusakan arsip.
- Uji browser penuh belum dijalankan di lingkungan ini; setelah deploy tetap perlu smoke test di browser/perangkat target.
